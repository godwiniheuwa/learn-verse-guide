
<?php
class Mailer {
    // Send email using PHP mail function
    public static function sendMail($to, $subject, $htmlMessage) {
        // Set content type header for HTML email
        $headers = "MIME-Version: 1.0" . "\r\n";
        $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
        $headers .= "From: ExamPrep <noreply@examprep.com>" . "\r\n";

        // Attempt to send email
        return mail($to, $subject, $htmlMessage, $headers);
    }

    // Generate activation email content
    public static function generateActivationEmail($name, $activationUrl) {
        return '
            <h1>Activate your ExamPrep account</h1>
            <p>Hello ' . $name . ',</p>
            <p>Thank you for signing up for ExamPrep. Please click the button below to activate your account:</p>
            <p>
              <a href="' . $activationUrl . '" style="display:inline-block; background-color:#4F46E5; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">
                Activate Account
              </a>
            </p>
            <p>Or copy and paste this URL into your browser:</p>
            <p>' . $activationUrl . '</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you did not create an account, please ignore this email.</p>
            <p>Best regards,<br>The ExamPrep Team</p>
        ';
    }

    // Generate password reset email content
    public static function generateResetPasswordEmail($name, $resetUrl) {
        return '
            <h1>Reset your ExamPrep password</h1>
            <p>Hello ' . $name . ',</p>
            <p>We received a request to reset your password. Please click the button below to set a new password:</p>
            <p>
              <a href="' . $resetUrl . '" style="display:inline-block; background-color:#4F46E5; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">
                Reset Password
              </a>
            </p>
            <p>Or copy and paste this URL into your browser:</p>
            <p>' . $resetUrl . '</p>
            <p>This link will expire in 1 hour.</p>
            <p>If you did not request a password reset, please ignore this email.</p>
            <p>Best regards,<br>The ExamPrep Team</p>
        ';
    }
}
?>
