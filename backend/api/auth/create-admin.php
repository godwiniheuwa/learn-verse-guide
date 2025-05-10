
<?php
// Required headers
require_once "../../config/config.php";
require_once "../../config/database.php";
require_once "../../models/user.php";

// Initialize database connection
$database = new Database();
$db = $database->getConnection();

// Initialize user object
$user = new User($db);

// Create admin user if it doesn't exist
if ($user->createAdminIfNotExists()) {
    http_response_code(200); // OK
    echo json_encode(array(
        "message" => "Admin user created or already exists and is activated",
        "credentials" => array(
            "email" => "admin@examprep.com",
            "password" => "Admin@123456"
        )
    ));
} else {
    http_response_code(500); // Server Error
    echo json_encode(array("error" => "Failed to create admin user."));
}
?>
