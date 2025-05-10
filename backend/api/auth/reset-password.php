
<?php
// Required headers
require_once "../../config/config.php";
require_once "../../config/database.php";
require_once "../../models/user.php";
require_once "../../models/token.php";

// Check if request method is POST
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405); // Method Not Allowed
    echo json_encode(array("error" => "Method not allowed. Use POST."));
    exit;
}

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Check if token and password are provided
if (empty($data->token) || empty($data->password)) {
    http_response_code(400); // Bad Request
    echo json_encode(array("error" => "Token and new password are required."));
    exit;
}

// Initialize database connection
$database = new Database();
$db = $database->getConnection();

// Initialize token object
$token = new Token($db);
$token->token = $data->token;
$token->token_type = "reset";

// Check if token exists and is valid
if (!$token->isValid()) {
    http_response_code(400); // Bad Request
    echo json_encode(array("error" => "Invalid or expired reset token."));
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

// Update user password
$user->password_hash = password_hash($data->password, PASSWORD_BCRYPT);

// Create query
$query = "UPDATE users 
          SET password_hash = :password_hash, updated_at = NOW()
          WHERE id = :id";

// Prepare statement
$stmt = $db->prepare($query);

// Bind values
$stmt->bindParam(':password_hash', $user->password_hash);
$stmt->bindParam(':id', $user->id);

// Execute query
if ($stmt->execute()) {
    // Delete the token as it's been used
    $token->delete();
    
    // Return success response
    http_response_code(200); // OK
    echo json_encode(array(
        "message" => "Password reset successful. You can now log in with your new password."
    ));
} else {
    http_response_code(500); // Server Error
    echo json_encode(array("error" => "Failed to reset password."));
}
?>
