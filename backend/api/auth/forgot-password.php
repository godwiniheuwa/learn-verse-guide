
<?php
// Required headers
require_once "../../config/config.php";
require_once "../../config/database.php";
require_once "../../models/user.php";
require_once "../../models/token.php";
require_once "../../utils/mailer.php";

// Check if request method is POST
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405); // Method Not Allowed
    echo json_encode(array("error" => "Method not allowed. Use POST."));
    exit;
}

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Check if email is provided
if (empty($data->email)) {
    http_response_code(400); // Bad Request
    echo json_encode(array("error" => "Email is required."));
    exit;
}

// Initialize database connection
$database = new Database();
$db = $database->getConnection();

// Initialize user object
$user = new User($db);
$user->email = $data->email;

// Check if user exists and is active
if (!$user->findByEmail()) {
    // For security, always return a generic message
    http_response_code(200); // OK
    echo json_encode(array("message" => "If your email is registered, you will receive a password reset link."));
    exit;
}

if (!$user->is_active) {
    http_response_code(400); // Bad Request
    echo json_encode(array("error" => "Account not active. Please activate your account first."));
    exit;
}

// Create a password reset token
$token = new Token($db);
$token->user_id = $user->id;
$token->token = $token->generateToken();
$token->token_type = "reset";

// Set token expiration (1 hour from now)
$expiresAt = new DateTime();
$expiresAt->add(new DateInterval('PT1H'));
$token->expires_at = $expiresAt->format('Y-m-d H:i:s');

if ($token->create()) {
    // Generate reset URL
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
    $domain = $_SERVER['HTTP_HOST'];
    $resetUrl = "$protocol://$domain/auth/reset-password?token=" . $token->token;
    
    // Send reset email
    $htmlMessage = Mailer::generateResetPasswordEmail($user->name, $resetUrl);
    Mailer::sendMail($user->email, "Reset your ExamPrep password", $htmlMessage);
    
    // Return success response
    http_response_code(200); // OK
    echo json_encode(array(
        "message" => "If your email is registered, you will receive a password reset link."
    ));
} else {
    http_response_code(500); // Server Error
    echo json_encode(array("error" => "Unable to create reset token."));
}
?>
