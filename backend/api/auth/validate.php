
<?php
// Required headers
require_once "../../config/config.php";
require_once "../../utils/jwt.php";

// Get authorization header
$headers = getallheaders();
$authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';

// Extract the token
if (!empty($authHeader) && preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
    $token = $matches[1];
    $userData = JWT::validate($token);
    
    if ($userData) {
        http_response_code(200); // OK
        echo json_encode(array(
            "valid" => true,
            "user" => $userData
        ));
        exit;
    }
}

http_response_code(401); // Unauthorized
echo json_encode(array(
    "valid" => false,
    "error" => "Invalid or expired token"
));
?>
