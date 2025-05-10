
<?php
class Token {
    // Database connection and table names
    private $conn;
    private $activation_table = "activation_tokens";
    private $reset_table = "password_reset_tokens";

    // Object properties
    public $id;
    public $user_id;
    public $token;
    public $expires_at;
    public $created_at;
    public $token_type; // 'activation' or 'reset'

    // Constructor
    public function __construct($db) {
        $this->conn = $db;
    }

    // Create a new token
    public function create() {
        // Determine which table to use
        $table_name = $this->token_type === 'activation' ? $this->activation_table : $this->reset_table;
        
        // Generate UUID for token ID
        $this->id = $this->generateUuid();
        
        // Create query
        $query = "INSERT INTO " . $table_name . "
                  (id, user_id, token, expires_at, created_at)
                  VALUES
                  (:id, :user_id, :token, :expires_at, NOW())";

        // Prepare statement
        $stmt = $this->conn->prepare($query);

        // Bind values
        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":user_id", $this->user_id);
        $stmt->bindParam(":token", $this->token);
        $stmt->bindParam(":expires_at", $this->expires_at);

        // Execute query
        if ($stmt->execute()) {
            return true;
        }

        return false;
    }

    // Find token by token string
    public function findByToken() {
        // Determine which table to use
        $table_name = $this->token_type === 'activation' ? $this->activation_table : $this->reset_table;
        
        // Query
        $query = "SELECT * FROM " . $table_name . " 
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
            $this->expires_at = $row['expires_at'];
            $this->created_at = $row['created_at'];
            return true;
        }

        return false;
    }

    // Delete token after use
    public function delete() {
        // Determine which table to use
        $table_name = $this->token_type === 'activation' ? $this->activation_table : $this->reset_table;
        
        // Query
        $query = "DELETE FROM " . $table_name . " WHERE token = :token";

        // Prepare statement
        $stmt = $this->conn->prepare($query);

        // Bind values
        $stmt->bindParam(':token', $this->token);

        // Execute query
        if ($stmt->execute()) {
            return true;
        }

        return false;
    }

    // Generate a random token
    public function generateToken($length = 32) {
        return bin2hex(random_bytes($length / 2));
    }

    // Check if token is valid and not expired
    public function isValid() {
        if (!$this->token || !$this->findByToken()) {
            return false;
        }

        $now = new DateTime();
        $expires = new DateTime($this->expires_at);

        return $now < $expires;
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
