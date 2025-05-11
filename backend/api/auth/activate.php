
<?php
// Required headers
header("Content-Type: application/json");

require_once "../../config/config.php";
require_once "../../config/database.php";
require_once "../../models/user.php";
require_once "../../models/token.php";

// Check if token parameter is provided
if (!isset($_GET['token']) || empty($_GET['token'])) {
    http_response_code(400); // Bad Request
    echo json_encode(array("error" => "Token is required."));
    exit;
}

$tokenString = $_GET['token'];

// Initialize database connection
$database = new Database();
$db = $database->getConnection();

// Initialize token object
$token = new Token($db);
$token->token = $tokenString;

// Check if token exists
if (!$token->findByToken()) {
    http_response_code(404); // Not Found
    echo json_encode(array("error" => "Invalid or expired token."));
    exit;
}

// Check if token is expired
if ($token->isExpired()) {
    http_response_code(400); // Bad Request
    echo json_encode(array("error" => "Token has expired. Please request a new one."));
    exit;
}

// Initialize user object
$user = new User($db);
$user->id = $token->user_id;

// Check if user exists
if (!$user->findById()) {
    http_response_code(404); // Not Found
    echo json_encode(array("error" => "User not found."));
    exit;
}

// Check if user is already active
if ($user->is_active) {
    http_response_code(200); // OK
    echo json_encode(array("message" => "Account is already activated. You can now log in."));
    exit;
}

// Activate user
if ($user->activateUser()) {
    // Delete the token as it's been used
    $token->delete();
    
    http_response_code(200); // OK
    echo json_encode(array("message" => "Account activated successfully! You can now log in."));
} else {
    http_response_code(500); // Server Error
    echo json_encode(array("error" => "Failed to activate account."));
}
?>
