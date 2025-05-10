
<?php
class JWT {
    // Generate JWT token
    public static function generate($user) {
        $issued_at = time();
        $expiration = $issued_at + JWT_EXPIRY;
        
        $payload = array(
            "iat" => $issued_at,
            "exp" => $expiration,
            "data" => array(
                "id" => $user->id,
                "email" => $user->email,
                "name" => $user->name,
                "username" => $user->username,
                "role" => $user->role
            )
        );
        
        return self::encode($payload, JWT_SECRET);
    }
    
    // Validate JWT token
    public static function validate($jwt) {
        try {
            $decoded = self::decode($jwt, JWT_SECRET);
            return $decoded->data;
        } catch (Exception $e) {
            return false;
        }
    }
    
    // Private encode method
    private static function encode($payload, $key) {
        // Create the token header
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        
        // Encode Header
        $base64UrlHeader = self::base64UrlEncode($header);
        
        // Encode Payload
        $base64UrlPayload = self::base64UrlEncode(json_encode($payload));
        
        // Create Signature Hash
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $key, true);
        
        // Encode Signature to Base64Url String
        $base64UrlSignature = self::base64UrlEncode($signature);
        
        // Create JWT
        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }
    
    // Private decode method
    private static function decode($jwt, $key) {
        // Split the JWT
        $tokenParts = explode('.', $jwt);
        
        if (count($tokenParts) != 3) {
            throw new Exception("Invalid token format");
        }
        
        $header = $tokenParts[0];
        $payload = $tokenParts[1];
        $signatureProvided = $tokenParts[2];
        
        // Check the signature
        $signature = hash_hmac('sha256', $header . "." . $payload, $key, true);
        $base64UrlSignature = self::base64UrlEncode($signature);
        
        if ($base64UrlSignature !== $signatureProvided) {
            throw new Exception("Invalid token signature");
        }
        
        // Decode payload
        $decodedPayload = json_decode(self::base64UrlDecode($payload));
        
        // Check if token is expired
        if (isset($decodedPayload->exp) && $decodedPayload->exp < time()) {
            throw new Exception("Token expired");
        }
        
        return $decodedPayload;
    }
    
    // Base64Url encode
    private static function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
    
    // Base64Url decode
    private static function base64UrlDecode($data) {
        return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', 3 - (3 + strlen($data)) % 4));
    }
}
?>
