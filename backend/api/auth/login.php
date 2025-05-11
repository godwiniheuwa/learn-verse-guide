<?php
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
// Clean any buffered output
if (ob_get_level()) {
    ob_clean();
}

// 2) Includes (make sure none of these echo or print anything)
require_once "../../config/config.php";
require_once "../../config/database.php";
require_once "../../models/user.php";
require_once "../../utils/jwt.php";

// 3) Enforce POST
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed. Use POST."]);
    exit;
}

// 4) Decode input
$input = json_decode(file_get_contents("php://input"), false);
if (!isset($input->email, $input->password)) {
    http_response_code(400);
    echo json_encode(["error" => "Email and password are required."]);
    exit;
}

// 5) Optional: validate email format
if (!filter_var($input->email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid email format."]);
    exit;
}

// 6) Init DB & User
$database = new Database();
$db       = $database->getConnection();
$user     = new User($db);
$user->email = $input->email;

// 7) Lookup user & verify
// Always return the same 401 message on failure to avoid enumeration
$badCreds = ['error' => 'Invalid email or password.'];
if (!$user->findByEmail() ||
    !password_verify($input->password, $user->password_hash)
) {
    http_response_code(401);
    echo json_encode($badCreds);
    exit;
}

// 8) Check active flag
if (!$user->is_active) {
    http_response_code(401);
    echo json_encode(["error" => "Account not active. Check your email for the activation link."]);
    exit;
}

// 9) Generate JWT (with a short expiry, e.g. 15m)
$token = JWT::generate([
    'sub' => $user->id,
    'email' => $user->email,
    'iat' => time(),
    'exp' => time() + 900,             // 15 minutes
]);

// 10) Success response
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
