
<?php
// Required headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Start output buffering to prevent header issues
ob_start();

// Include database and authentication dependencies
require_once "../../config/config.php";
require_once "../../config/database.php";
require_once "../../models/user.php";
require_once "../../utils/jwt.php";

// Error handling
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    http_response_code(500);
    echo json_encode(["error" => "Server error: $errstr"]);
    exit();
});

try {
    // Get authorization header
    $headers = getallheaders();
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
    
    // Check if token is provided
    if (empty($authHeader) || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        http_response_code(401);
        echo json_encode(["error" => "Unauthorized: No token provided"]);
        exit();
    }
    
    // Extract and validate token
    $token = $matches[1];
    $userData = JWT::validate($token);
    
    if (!$userData) {
        http_response_code(401);
        echo json_encode(["error" => "Unauthorized: Invalid token"]);
        exit();
    }
    
    // Initialize database connection
    $database = new Database();
    $db = $database->getConnection();
    
    // Get user information
    $user = new User($db);
    $user->id = $userData->id;
    
    if (!$user->findById()) {
        http_response_code(404);
        echo json_encode(["error" => "User not found"]);
        exit();
    }
    
    // Prepare role-based dashboard data
    $dashboardData = [];
    
    switch ($user->role) {
        case 'admin':
            // Get counts for admin dashboard
            $stmt = $db->prepare("SELECT 
                (SELECT COUNT(*) FROM users) AS total_users,
                (SELECT COUNT(*) FROM users WHERE role = 'student') AS student_count,
                (SELECT COUNT(*) FROM users WHERE role = 'teacher') AS teacher_count,
                (SELECT COUNT(*) FROM users WHERE role = 'examiner') AS examiner_count,
                (SELECT COUNT(*) FROM exams) AS total_exams,
                (SELECT COUNT(*) FROM questions) AS total_questions");
            $stmt->execute();
            $counts = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Get recent users
            $stmtUsers = $db->prepare("SELECT id, name, email, username, role, created_at 
                                      FROM users ORDER BY created_at DESC LIMIT 5");
            $stmtUsers->execute();
            $recentUsers = $stmtUsers->fetchAll(PDO::FETCH_ASSOC);
            
            // Get recent exams
            $stmtExams = $db->prepare("SELECT e.id, e.title, e.status, e.created_at, u.name as created_by_name 
                                      FROM exams e 
                                      JOIN users u ON e.created_by = u.id 
                                      ORDER BY e.created_at DESC LIMIT 5");
            $stmtExams->execute();
            $recentExams = $stmtExams->fetchAll(PDO::FETCH_ASSOC);
            
            $dashboardData = [
                "role" => "admin",
                "user" => [
                    "id" => $user->id,
                    "name" => $user->name,
                    "email" => $user->email,
                    "username" => $user->username,
                ],
                "stats" => $counts,
                "recentUsers" => $recentUsers,
                "recentExams" => $recentExams
            ];
            break;
            
        case 'teacher':
            // Get teacher's questions count
            $stmt = $db->prepare("SELECT COUNT(*) AS question_count FROM questions WHERE created_by = :user_id");
            $stmt->bindParam(':user_id', $user->id);
            $stmt->execute();
            $questionCount = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Get teacher's recent questions
            $stmtQuestions = $db->prepare("SELECT id, question_text, type, difficulty, created_at 
                                          FROM questions 
                                          WHERE created_by = :user_id 
                                          ORDER BY created_at DESC LIMIT 10");
            $stmtQuestions->bindParam(':user_id', $user->id);
            $stmtQuestions->execute();
            $recentQuestions = $stmtQuestions->fetchAll(PDO::FETCH_ASSOC);
            
            // Get exams using teacher's questions
            $stmtExams = $db->prepare("SELECT DISTINCT e.id, e.title, e.status, e.created_at 
                                      FROM exams e 
                                      JOIN questions q ON q.exam_id = e.id 
                                      WHERE q.created_by = :user_id 
                                      ORDER BY e.created_at DESC LIMIT 5");
            $stmtExams->bindParam(':user_id', $user->id);
            $stmtExams->execute();
            $relatedExams = $stmtExams->fetchAll(PDO::FETCH_ASSOC);
            
            $dashboardData = [
                "role" => "teacher",
                "user" => [
                    "id" => $user->id,
                    "name" => $user->name,
                    "email" => $user->email,
                    "username" => $user->username,
                ],
                "stats" => [
                    "question_count" => $questionCount['question_count'],
                    "exams_using_questions" => count($relatedExams)
                ],
                "recentQuestions" => $recentQuestions,
                "relatedExams" => $relatedExams
            ];
            break;
            
        case 'student':
            // For students, we'd typically show available exams, recent activity, etc.
            $stmtExams = $db->prepare("SELECT id, title, description, status, created_at 
                                      FROM exams 
                                      WHERE status = 'published' 
                                      ORDER BY created_at DESC LIMIT 10");
            $stmtExams->execute();
            $availableExams = $stmtExams->fetchAll(PDO::FETCH_ASSOC);
            
            // We would also query student's exam attempts if that table existed
            // For now, just provide available exams
            
            $dashboardData = [
                "role" => "student",
                "user" => [
                    "id" => $user->id,
                    "name" => $user->name,
                    "email" => $user->email,
                    "username" => $user->username,
                ],
                "availableExams" => $availableExams
            ];
            break;
            
        case 'examiner':
            // Get examiner's exams count
            $stmt = $db->prepare("SELECT COUNT(*) AS exam_count FROM exams WHERE created_by = :user_id");
            $stmt->bindParam(':user_id', $user->id);
            $stmt->execute();
            $examCount = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Get examiner's recent exams
            $stmtExams = $db->prepare("SELECT id, title, status, created_at 
                                      FROM exams 
                                      WHERE created_by = :user_id 
                                      ORDER BY created_at DESC LIMIT 10");
            $stmtExams->bindParam(':user_id', $user->id);
            $stmtExams->execute();
            $recentExams = $stmtExams->fetchAll(PDO::FETCH_ASSOC);
            
            $dashboardData = [
                "role" => "examiner",
                "user" => [
                    "id" => $user->id,
                    "name" => $user->name,
                    "email" => $user->email,
                    "username" => $user->username,
                ],
                "stats" => [
                    "exam_count" => $examCount['exam_count']
                ],
                "recentExams" => $recentExams
            ];
            break;
            
        default:
            $dashboardData = [
                "role" => "unknown",
                "user" => [
                    "id" => $user->id,
                    "name" => $user->name,
                    "email" => $user->email,
                    "username" => $user->username,
                ]
            ];
    }
    
    // Return dashboard data
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "data" => $dashboardData
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "error" => "Server error",
        "message" => $e->getMessage()
    ]);
}

// End output buffering
ob_end_flush();
?>
