
<?php
class Mailer {
    /**
     * Send an email
     * 
     * @param string $to Recipient email
     * @param string $subject Email subject
     * @param string $htmlMessage HTML message body
     * @return bool Success or failure
     */
    public static function sendMail($to, $subject, $htmlMessage) {
        // In a real implementation, you would use PHPMailer, mail() function, 
        // or an API service like SendGrid, Mailgun, etc.
        
        // For now, we'll just log the email (for development purposes)
        $logDir = __DIR__ . "/../../logs";
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
        
        $logFile = $logDir . "/email_log.txt";
        $timestamp = date('Y-m-d H:i:s');
        $logMessage = "[$timestamp] To: $to | Subject: $subject | Body: " . substr(strip_tags($htmlMessage), 0, 100) . "...\n";
        
        file_put_contents($logFile, $logMessage, FILE_APPEND);
        
        // For development, we'll consider it a success
        // In production, you would return the success/failure of your email sending method
        return true;
    }
    
    /**
     * Generate account activation email content
     * 
     * @param string $userName Recipient's name
     * @param string $activationUrl Activation URL
     * @return string HTML email content
     */
    public static function generateActivationEmail($userName, $activationUrl) {
        return '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Activate Your ExamPrep Account</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #f4f4f4;
                }
                .container {
                    width: 100%;
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    padding: 20px;
                }
                .header {
                    background-color: #4f46e5;
                    color: white;
                    padding: 20px;
                    text-align: center;
                }
                .content {
                    padding: 20px;
                    line-height: 1.5;
                }
                .button {
                    display: inline-block;
                    padding: 10px 20px;
                    background-color: #4f46e5;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                    margin: 20px 0;
                }
                .footer {
                    margin-top: 20px;
                    text-align: center;
                    font-size: 12px;
                    color: #666;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome to ExamPrep!</h1>
                </div>
                <div class="content">
                    <p>Hello ' . htmlspecialchars($userName) . ',</p>
                    <p>Thank you for signing up with ExamPrep! To activate your account, please click the button below:</p>
                    <p style="text-align: center;">
                        <a href="' . htmlspecialchars($activationUrl) . '" class="button">Activate Your Account</a>
                    </p>
                    <p>If the button above doesn\'t work, you can also copy and paste the following link into your browser:</p>
                    <p>' . htmlspecialchars($activationUrl) . '</p>
                    <p>This link will expire in 24 hours for security reasons.</p>
                    <p>If you didn\'t create an account with us, please ignore this email.</p>
                    <p>Best regards,<br>The ExamPrep Team</p>
                </div>
                <div class="footer">
                    <p>© ' . date('Y') . ' ExamPrep. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        ';
    }
    
    /**
     * Generate password reset email content
     * 
     * @param string $userName Recipient's name
     * @param string $resetUrl Password reset URL
     * @return string HTML email content
     */
    public static function generatePasswordResetEmail($userName, $resetUrl) {
        return '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Reset Your ExamPrep Password</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #f4f4f4;
                }
                .container {
                    width: 100%;
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    padding: 20px;
                }
                .header {
                    background-color: #4f46e5;
                    color: white;
                    padding: 20px;
                    text-align: center;
                }
                .content {
                    padding: 20px;
                    line-height: 1.5;
                }
                .button {
                    display: inline-block;
                    padding: 10px 20px;
                    background-color: #4f46e5;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                    margin: 20px 0;
                }
                .footer {
                    margin-top: 20px;
                    text-align: center;
                    font-size: 12px;
                    color: #666;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Password Reset Request</h1>
                </div>
                <div class="content">
                    <p>Hello ' . htmlspecialchars($userName) . ',</p>
                    <p>We received a request to reset your ExamPrep password. If you made this request, please click the button below to set a new password:</p>
                    <p style="text-align: center;">
                        <a href="' . htmlspecialchars($resetUrl) . '" class="button">Reset Your Password</a>
                    </p>
                    <p>If the button above doesn\'t work, you can also copy and paste the following link into your browser:</p>
                    <p>' . htmlspecialchars($resetUrl) . '</p>
                    <p>This link will expire in 1 hour for security reasons.</p>
                    <p>If you didn\'t request a password reset, please ignore this email. Your account is secure.</p>
                    <p>Best regards,<br>The ExamPrep Team</p>
                </div>
                <div class="footer">
                    <p>© ' . date('Y') . ' ExamPrep. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        ';
    }
}
?>
