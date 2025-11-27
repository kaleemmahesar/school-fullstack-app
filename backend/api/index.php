<?php
// Handle preflight requests first, before any other processing
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    header("Access-Control-Allow-Origin: http://localhost:5173");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    header("Access-Control-Max-Age: 86400"); // Cache preflight request for 24 hours
    header("Vary: Origin");
    http_response_code(200);
    exit();
}

// Set CORS headers for all other requests
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Vary: Origin");

require_once __DIR__ . '/../config/database.php';

// Helper functions
require_once __DIR__ . '/helpers.php';

// Get the request method
$method = $_SERVER['REQUEST_METHOD'];

// Get the endpoint from the URL
$endpoint = isset($_GET['endpoint']) ? $_GET['endpoint'] : '';
$endpoint_parts = explode('/', trim($endpoint, '/'));

// Get the resource (first part of the endpoint)
$resource = isset($endpoint_parts[0]) ? $endpoint_parts[0] : '';

// Get the ID if provided (second part of the endpoint)
$id = isset($endpoint_parts[1]) ? $endpoint_parts[1] : null;

// Get the request data
$input = json_decode(file_get_contents('php://input'), true);

try {
    $pdo = getDBConnection();
    
    switch ($resource) {
        case 'students':
            require_once __DIR__ . '/handlers/students.php';
            handleStudents($method, $id, $input, $pdo);
            break;
        case 'classes':
            require_once __DIR__ . '/handlers/classes.php';
            handleClasses($method, $id, $input, $pdo);
            break;
        case 'sections':
            require_once __DIR__ . '/handlers/sections.php';
            handleSections($method, $id, $input, $pdo);
            break;
        case 'subjects':
            require_once __DIR__ . '/handlers/subjects.php';
            handleSubjects($method, $id, $input, $pdo);
            break;
        case 'expenses':
            require_once __DIR__ . '/handlers/expenses.php';
            handleExpenses($method, $id, $input, $pdo);
            break;
        case 'exams':
            require_once __DIR__ . '/handlers/exams.php';
            handleExams($method, $id, $input, $pdo);
            break;
        case 'staff':
            require_once __DIR__ . '/handlers/staff.php';
            handleStaff($method, $id, $input, $pdo);
            break;
        case 'staffAttendance':
            require_once __DIR__ . '/handlers/staff_attendance.php';
            handleStaffAttendance($method, $id, $input, $pdo);
            break;
        case 'attendance':
            require_once __DIR__ . '/handlers/attendance.php';
            handleAttendance($method, $id, $input, $pdo);
            break;
        case 'studentsAttendance':
            require_once __DIR__ . '/handlers/students_attendance.php';
            handleStudentsAttendance($method, $id, $input, $pdo);
            break;
        case 'marks':
            require_once __DIR__ . '/handlers/marks.php';
            handleMarks($method, $id, $input, $pdo);
            break;
        case 'subsidies':
            require_once __DIR__ . '/handlers/subsidies.php';
            handleSubsidies($method, $id, $input, $pdo);
            break;
        case 'batches':
            require_once __DIR__ . '/handlers/batches.php';
            handleBatches($method, $id, $input, $pdo);
            break;
        case 'notifications':
            require_once __DIR__ . '/handlers/notifications.php';
            handleNotifications($method, $id, $input, $pdo);
            break;
        case 'settings':
            require_once __DIR__ . '/handlers/settings.php';
            handleSettings($method, $id, $input, $pdo);
            break;
        case 'events':
            require_once __DIR__ . '/handlers/events.php';
            handleEvents($method, $id, $input, $pdo);
            break;
        case 'promotions':
            require_once __DIR__ . '/handlers/promotions.php';
            handlePromotions($method, $id, $input, $pdo);
            break;
        case 'alumni':
            require_once __DIR__ . '/handlers/alumni.php';
            handleAlumni($method, $id, $input, $pdo);
            break;
        case 'photos':
            require_once __DIR__ . '/handlers/photo_upload.php';
            handlePhotoUpload($method, $id, $input, $pdo);
            break;
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Endpoint not found']);
            break;
    }
} catch (Exception $e) {
    // Set CORS headers for error responses
    header("Content-Type: application/json");
    header("Access-Control-Allow-Origin: http://localhost:5173");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    header("Vary: Origin");
    
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}