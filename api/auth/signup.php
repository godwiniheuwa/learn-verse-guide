
<?php
// Required headers
require_once "../config/config.php";
require_once "../config/database.php";
require_once "../models/user.php";

// Check if request method is POST
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405); // Method Not Allowed
    echo json_encode(array("error" => "Method not allowed. Use POST."));
    exit;
}

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Check if data is complete
if (
    empty($data->name) || 
    empty($data->email) || 
    empty($data->username) || 
    empty($data->password)
) {
    http_response_code(400); // Bad Request
    echo json_encode(array("error" => "All fields are required."));
    exit;
}

// Initialize database connection
$database = new Database();
$db = $database->getConnection();

// Initialize user object
$user = new User($db);

// Set user properties
$user->email = $data->email;
$user->name = $data->name;
$user->username = $data->username;
$user->password_hash = $data->password;
$user->role = "student";
$user->is_active = 1; // Auto-activate users for demo

// Check if email already exists
if ($user->findByEmail()) {
    http_response_code(400); // Bad Request
    echo json_encode(array("error" => "Email already in use."));
    exit;
}

// Create the user
if ($user->create()) {
    // Return success response
    http_response_code(201); // Created
    echo json_encode(array(
        "message" => "User created successfully. You can now log in."
    ));
} else {
    http_response_code(500); // Server Error
    echo json_encode(array("error" => "Unable to create user."));
}
?>
