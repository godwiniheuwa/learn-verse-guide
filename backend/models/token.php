
<?php
class Token {
    // Database connection and table name
    private $conn;
    private $table_name = "activation_tokens";

    // Object properties
    public $id;
    public $user_id;
    public $token;
    public $token_type;
    public $expires_at;
    public $created_at;

    // Constructor with database connection
    public function __construct($db) {
        $this->conn = $db;
    }

    // Create token
    public function create() {
        // Generate UUID for token ID
        $this->id = $this->generateUuid();
        
        // Create query
        $query = "INSERT INTO " . $this->table_name . "
                  (id, user_id, token, token_type, expires_at, created_at)
                  VALUES
                  (:id, :user_id, :token, :token_type, :expires_at, NOW())";

        // Prepare statement
        $stmt = $this->conn->prepare($query);

        // Bind values
        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":user_id", $this->user_id);
        $stmt->bindParam(":token", $this->token);
        $stmt->bindParam(":token_type", $this->token_type);
        $stmt->bindParam(":expires_at", $this->expires_at);

        // Execute query
        if ($stmt->execute()) {
            return true;
        }

        return false;
    }

    // Find token by token string
    public function findByToken() {
        // Query
        $query = "SELECT * FROM " . $this->table_name . " 
                  WHERE token = :token 
                  LIMIT 0,1";

        // Prepare statement
        $stmt = $this->conn->prepare($query);

        // Bind values
        $stmt->bindParam(':token', $this->token);

        // Execute query
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            // Set properties
            $this->id = $row['id'];
            $this->user_id = $row['user_id'];
            $this->token = $row['token'];
            $this->token_type = $row['token_type'];
            $this->expires_at = $row['expires_at'];
            $this->created_at = $row['created_at'];
            return true;
        }

        return false;
    }

    // Find token by user ID and type
    public function findByUserIdAndType() {
        // Query
        $query = "SELECT * FROM " . $this->table_name . " 
                  WHERE user_id = :user_id 
                  AND token_type = :token_type
                  LIMIT 0,1";

        // Prepare statement
        $stmt = $this->conn->prepare($query);

        // Bind values
        $stmt->bindParam(':user_id', $this->user_id);
        $stmt->bindParam(':token_type', $this->token_type);

        // Execute query
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            // Set properties
            $this->id = $row['id'];
            $this->user_id = $row['user_id'];
            $this->token = $row['token'];
            $this->token_type = $row['token_type'];
            $this->expires_at = $row['expires_at'];
            $this->created_at = $row['created_at'];
            return true;
        }

        return false;
    }

    // Delete token
    public function delete() {
        // Create query
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";

        // Prepare statement
        $stmt = $this->conn->prepare($query);

        // Bind values
        $stmt->bindParam(":id", $this->id);

        // Execute query
        if ($stmt->execute()) {
            return true;
        }

        return false;
    }

    // Generate a secure token
    public function generateToken() {
        return bin2hex(random_bytes(32));
    }

    // Check if token is expired
    public function isExpired() {
        $now = new DateTime();
        $expires = new DateTime($this->expires_at);
        return $now > $expires;
    }

    // Generate a UUID v4
    private function generateUuid() {
        return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }
}
?>
