
<?php
// Application configuration
define('JWT_SECRET', 'your_jwt_secret_key_change_this_in_production');
define('JWT_EXPIRY', 3600); // 1 hour in seconds

// CORS configuration
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header('Content-Type: application/json');

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}
?>
