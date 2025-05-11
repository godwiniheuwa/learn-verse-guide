<?php
// 0) Start buffering right away so nothing ever leaks
ob_start();

// 1) Force JSON response and set up error handling
header('Content-Type: application/json; charset=utf-8');
ini_set('display_errors', '0');
error_reporting(E_ALL);
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    throw new ErrorException($errstr, $errno, 0, $errfile, $errline);
});
set_exception_handler(function(Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error.']);
    exit;
});

// 2) Include your files—nothing should echo here!
require_once "../../config/config.php";
require_once "../../config/database.php";
require_once "../../models/user.php";
require_once "../../utils/jwt.php";

// 3) Immediately capture anything they might have output
$stray = ob_get_clean();
if (trim($stray) !== '') {
    // Log it so you can inspect what include is misbehaving
    file_put_contents(__DIR__ . '/../../logs/stray_output.log', date('c') . " - STRAY OUTPUT:\n" . $stray . "\n\n", FILE_APPEND);
    // Start a fresh buffer for our JSON-only response
    ob_start();
}

// 4) Enforce POST
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed. Use POST."]);
    exit;
}

// 5) Decode & validate input
$input = json_decode(file_get_contents("php://input"), false);
if (!isset($input->email, $input->password)) {
    http_response_code(400);
    echo json_encode(["error" => "Email and password are required."]);
    exit;
}
if (!filter_var($input->email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid email format."]);
    exit;
}

// 6) Look up user & verify
$database = new Database();
$db       = $database->getConnection();
$user     = new User($db);
$user->email = $input->email;

$badCreds = ['error' => 'Invalid email or password.'];
if (!$user->findByEmail() ||
    !password_verify($input->password, $user->password_hash)
) {
    http_response_code(401);
    echo json_encode($badCreds);
    exit;
}
if (!$user->is_active) {
    http_response_code(401);
    echo json_encode(["error" => "Account not active. Check your email for the activation link."]);
    exit;
}

// 7) Generate a short-lived JWT
$token = JWT::generate([
    'sub' => $user->id,
    'email' => $user->email,
    'iat' => time(),
    'exp' => time() + 900, // 15 minutes
]);

// 8) Send only your JSON
http_response_code(200);
echo json_encode([
    "message" => "Login successful",
    "user" => [
        "id"       => $user->id,
        "email"    => $user->email,
        "name"     => $user->name,
        "username" => $user->username,
        "role"     => $user->role,
        "isActive" => (bool)$user->is_active
    ],
    "token" => $token
]);
