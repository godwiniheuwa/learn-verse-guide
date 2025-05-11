<?php
header("Content-Type: application/json");

define('DB_HOST',     'localhost');
define('DB_NAME',     'examprep_db');
define('DB_USER',     'root');
define('DB_PASS',     '');   // or your real password

// Include the database configuration
require_once '../config/database.php';

try {
    // Attempt to connect to the database using PDO
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME, DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // If connection is successful, return a success message
    echo json_encode([
        "status" => "success",
        "message" => "Database connection successful!",
        "database" => DB_NAME,
        "host" => DB_HOST,
        "user" => DB_USER
    ]);
} catch (PDOException $e) {
    // If connection fails, return the error message
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Database connection failed: " . $e->getMessage()
    ]);
}
?>