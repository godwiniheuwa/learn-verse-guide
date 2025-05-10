
<?php
// Required headers
require_once "../config/config.php";
require_once "../config/database.php";
require_once "../models/user.php";
require_once "../utils/jwt.php";

// Check if request method is POST
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405); // Method Not Allowed
    echo json_encode(array("error" => "Method not allowed. Use POST."));
    exit;
}

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Check if data is complete
if (empty($data->email) || empty($data->password)) {
    http_response_code(400); // Bad Request
    echo json_encode(array("error" => "Email and password are required."));
    exit;
}

// Initialize database connection
$database = new Database();
$db = $database->getConnection();

// Initialize user object
$user = new User($db);
$user->email = $data->email;

// Check if user exists
if (!$user->findByEmail()) {
    http_response_code(401); // Unauthorized
    echo json_encode(array("error" => "Account not found. Please check your email or sign up first."));
    exit;
}

// Check if user is active
if (!$user->is_active) {
    http_response_code(401); // Unauthorized
    echo json_encode(array("error" => "Account not active. Please check your email for the activation link."));
    exit;
}

// Verify password
if (!password_verify($data->password, $user->password_hash)) {
    http_response_code(401); // Unauthorized
    echo json_encode(array("error" => "Invalid email or password. Please try again."));
    exit;
}

// Generate JWT token
$token = JWT::generate($user);

// Return success response with user data and token
http_response_code(200); // OK
echo json_encode(array(
    "message" => "Login successful",
    "user" => array(
        "id" => $user->id,
        "email" => $user->email,
        "name" => $user->name,
        "username" => $user->username,
        "role" => $user->role,
        "isActive" => (bool)$user->is_active
    ),
    "token" => $token
));
?>
