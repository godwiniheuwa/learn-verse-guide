
<?php
// Required headers
require_once "../config/config.php";

// Nothing to do server-side for logout, just return success
http_response_code(200); // OK
echo json_encode(array("message" => "Logged out successfully"));
?>
