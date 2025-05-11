
<?php
// Database configuration

class Database {
    private $host = "localhost";
    private $db_name = "examprep_db";
    private $username = "root";
    private $password = ""; // Change this in production
    public $conn;

    // Get database connection
    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password,
                array(
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
                )
            );
        } catch(PDOException $e) {
            // Log the error to a file
            error_log(date('Y-m-d H:i:s') . " - Database connection error: " . $e->getMessage() . "\n", 3, __DIR__ . "/../../logs/db_errors.log");
            throw new Exception("Database connection error. Please check the logs for details.");
        }

        return $this->conn;
    }
}
?>
