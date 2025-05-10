
<?php
class User {
    // Database connection and table name
    private $conn;
    private $table_name = "users";

    // Object properties
    public $id;
    public $email;
    public $name;
    public $username;
    public $password_hash;
    public $role;
    public $is_active;
    public $created_at;
    public $updated_at;

    // Constructor with database connection
    public function __construct($db) {
        $this->conn = $db;
    }

    // Create user
    public function create() {
        // Generate UUID for user ID
        $this->id = $this->generateUuid();
        
        // Hash the password
        $this->password_hash = password_hash($this->password_hash, PASSWORD_BCRYPT);
        
        // Create query
        $query = "INSERT INTO " . $this->table_name . "
                  (id, email, name, username, password_hash, role, is_active, created_at, updated_at)
                  VALUES
                  (:id, :email, :name, :username, :password_hash, :role, :is_active, NOW(), NOW())";

        // Prepare statement
        $stmt = $this->conn->prepare($query);

        // Sanitize inputs
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->username = htmlspecialchars(strip_tags($this->username));

        // Bind values
        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":username", $this->username);
        $stmt->bindParam(":password_hash", $this->password_hash);
        $stmt->bindParam(":role", $this->role);
        $stmt->bindParam(":is_active", $this->is_active);

        // Execute query
        if ($stmt->execute()) {
            return true;
        }

        return false;
    }

    // Read single user by email
    public function findByEmail() {
        // Query
        $query = "SELECT * FROM " . $this->table_name . " 
                  WHERE email = :email 
                  LIMIT 0,1";

        // Prepare statement
        $stmt = $this->conn->prepare($query);

        // Bind values
        $stmt->bindParam(':email', $this->email);

        // Execute query
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            // Set properties
            $this->id = $row['id'];
            $this->email = $row['email'];
            $this->name = $row['name'];
            $this->username = $row['username'];
            $this->password_hash = $row['password_hash'];
            $this->role = $row['role'];
            $this->is_active = $row['is_active'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            return true;
        }

        return false;
    }

    // Read single user by ID
    public function findById() {
        // Query
        $query = "SELECT * FROM " . $this->table_name . " 
                  WHERE id = :id 
                  LIMIT 0,1";

        // Prepare statement
        $stmt = $this->conn->prepare($query);

        // Bind values
        $stmt->bindParam(':id', $this->id);

        // Execute query
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            // Set properties
            $this->id = $row['id'];
            $this->email = $row['email'];
            $this->name = $row['name'];
            $this->username = $row['username'];
            $this->password_hash = $row['password_hash'];
            $this->role = $row['role'];
            $this->is_active = $row['is_active'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            return true;
        }

        return false;
    }

    // Create admin user
    public function createAdminIfNotExists() {
        $this->email = "admin@examprep.com";
        
        // Check if admin already exists
        if ($this->findByEmail()) {
            // Update admin to be active if not already
            if (!$this->is_active) {
                return $this->activateUser();
            }
            return true;
        }

        // Admin doesn't exist, create it
        $this->id = $this->generateUuid();
        $this->name = "Admin User";
        $this->username = "admin";
        $this->password_hash = password_hash("Admin@123456", PASSWORD_BCRYPT);
        $this->role = "admin";
        $this->is_active = 1;
        
        return $this->create();
    }

    // Activate user account
    public function activateUser() {
        $query = "UPDATE " . $this->table_name . "
                  SET is_active = 1, updated_at = NOW()
                  WHERE id = :id";

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
