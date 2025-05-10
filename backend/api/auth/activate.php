
<?php
// Required headers
require_once "../../config/config.php";
require_once "../../config/database.php";
require_once "../../models/user.php";
require_once "../../models/token.php";

// Check if token is provided
if (!isset($_GET['token'])) {
    http_response_code(400); // Bad Request
    echo json_encode(array("error" => "Invalid activation link."));
    exit;
}

// Initialize database connection
$database = new Database();
$db = $database->getConnection();

// Initialize token object
$token = new Token($db);
$token->token = $_GET['token'];
$token->token_type = "activation";

// Check if token exists and is valid
if (!$token->isValid()) {
    http_response_code(400); // Bad Request
    echo json_encode(array("error" => "Invalid or expired activation token."));
    exit;
}

// Get user by ID
$user = new User($db);
$user->id = $token->user_id;

if (!$user->findById()) {
    http_response_code(400); // Bad Request
    echo json_encode(array("error" => "User not found."));
    exit;
}

// Activate the user
if ($user->activateUser()) {
    // Delete the token as it's been used
    $token->delete();
    
    // Redirect to login page with success parameter
    header("Location: /login?activated=true");
    exit;
} else {
    http_response_code(500); // Server Error
    echo json_encode(array("error" => "Failed to activate account."));
}
?>
