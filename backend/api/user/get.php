
<?php
// Required headers
require_once "../../config/config.php";
require_once "../../config/database.php";
require_once "../../models/user.php";
require_once "../../utils/jwt.php";

// Get authorization header
$headers = getallheaders();
$authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';

// Extract the token
if (empty($authHeader) || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
    http_response_code(401); // Unauthorized
    echo json_encode(array("error" => "Authorization token required"));
    exit;
}

$token = $matches[1];
$userData = JWT::validate($token);

if (!$userData) {
    http_response_code(401); // Unauthorized
    echo json_encode(array("error" => "Invalid or expired token"));
    exit;
}

// Initialize database connection
$database = new Database();
$db = $database->getConnection();

// Initialize user object
$user = new User($db);
$user->id = $userData->id;

// Get user data
if ($user->findById()) {
    http_response_code(200); // OK
    echo json_encode(array(
        "id" => $user->id,
        "email" => $user->email,
        "name" => $user->name,
        "username" => $user->username,
        "role" => $user->role,
        "isActive" => (bool)$user->is_active
    ));
} else {
    http_response_code(404); // Not Found
    echo json_encode(array("error" => "User not found"));
}
?>
