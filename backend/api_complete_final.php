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

require_once 'config/database.php';

// Helper function to convert string numbers to actual numbers
function formatStudentData($student) {
    if ($student) {
        // Convert numeric string fields to actual numbers
        $numericFields = ['monthlyFees', 'admissionFees', 'feesPaid', 'totalFees'];
        foreach ($numericFields as $field) {
            if (isset($student[$field])) {
                $student[$field] = (float)$student[$field];
            }
        }
        
        // Format fees history if it exists
        if (isset($student['feesHistory']) && is_array($student['feesHistory'])) {
            foreach ($student['feesHistory'] as &$fee) {
                $feeNumericFields = ['amount', 'fineAmount'];
                foreach ($feeNumericFields as $field) {
                    if (isset($fee[$field])) {
                        $fee[$field] = (float)$fee[$field];
                    }
                }
                // Convert paid field to boolean
                if (isset($fee['paid'])) {
                    $fee['paid'] = (bool)$fee['paid'];
                }
            }
        }
    }
    return $student;
}

// Helper function to format multiple students
function formatStudentsData($students) {
    foreach ($students as &$student) {
        $student = formatStudentData($student);
    }
    return $students;
}

// Helper function to convert staff data with salary history
function formatStaffData($staff) {
    if ($staff) {
        // Convert numeric string fields to actual numbers
        $numericFields = ['salary'];
        foreach ($numericFields as $field) {
            if (isset($staff[$field])) {
                $staff[$field] = (float)$staff[$field];
            }
        }
        
        // Format salary history if it exists
        if (isset($staff['salaryHistory']) && is_array($staff['salaryHistory'])) {
            foreach ($staff['salaryHistory'] as &$salary) {
                $salaryNumericFields = ['baseSalary', 'allowances', 'deductions', 'netSalary'];
                foreach ($salaryNumericFields as $field) {
                    if (isset($salary[$field])) {
                        $salary[$field] = (float)$salary[$field];
                    }
                }
            }
        }
    }
    return $staff;
}

// Helper function to format multiple staff members
function formatStaffDataArray($staffArray) {
    foreach ($staffArray as &$staff) {
        $staff = formatStaffData($staff);
    }
    return $staffArray;
}

// Generic helper function to convert specific fields to numbers
function convertFieldsToNumbers($data, $numericFields) {
    if ($data) {
        foreach ($numericFields as $field) {
            if (isset($data[$field])) {
                $data[$field] = (float)$data[$field];
            }
        }
    }
    return $data;
}

// Generic helper function to convert specific fields to booleans
function convertFieldsToBooleans($data, $booleanFields) {
    if ($data) {
        foreach ($booleanFields as $field) {
            if (isset($data[$field])) {
                $data[$field] = (bool)$data[$field];
            }
        }
    }
    return $data;
}

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
            handleStudents($method, $id, $input, $pdo);
            break;
        case 'classes':
            handleClasses($method, $id, $input, $pdo);
            break;
        case 'sections':
            handleSections($method, $id, $input, $pdo);
            break;
        case 'subjects':
            handleSubjects($method, $id, $input, $pdo);
            break;
        case 'expenses':
            handleExpenses($method, $id, $input, $pdo);
            break;
        case 'exams':
            handleExams($method, $id, $input, $pdo);
            break;
        case 'staff':
            handleStaff($method, $id, $input, $pdo);
            break;
        case 'staffAttendance':
            handleStaffAttendance($method, $id, $input, $pdo);
            break;
        case 'attendance':
            handleAttendance($method, $id, $input, $pdo);
            break;
        case 'studentsAttendance':
            handleStudentsAttendance($method, $id, $input, $pdo);
            break;
        case 'marks':
            handleMarks($method, $id, $input, $pdo);
            break;
        case 'subsidies':
            handleSubsidies($method, $id, $input, $pdo);
            break;
        case 'batches':
            handleBatches($method, $id, $input, $pdo);
            break;
        case 'notifications':
            handleNotifications($method, $id, $input, $pdo);
            break;
        case 'settings':
            handleSettings($method, $id, $input, $pdo);
            break;
        case 'events':
            handleEvents($method, $id, $input, $pdo);
            break;
        case 'promotions':
            handlePromotions($method, $id, $input, $pdo);
            break;
        case 'alumni':
            handleAlumni($method, $id, $input, $pdo);
            break;
        case 'photos':
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

// Students handler
function handleStudents($method, $id, $input, $pdo) {
    switch ($method) {
        case 'GET':
            if ($id) {
                // Get specific student
                $stmt = $pdo->prepare("SELECT * FROM students WHERE id = ?");
                $stmt->execute([$id]);
                $student = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($student) {
                    // Get fees history for this student
                    $stmt = $pdo->prepare("SELECT * FROM fees_history WHERE student_id = ? ORDER BY created_at DESC");
                    $stmt->execute([$id]);
                    $feesHistory = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    $student['feesHistory'] = $feesHistory;
                    
                    // Format the student data to ensure proper data types
                    $student = formatStudentData($student);
                    
                    echo json_encode($student);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Student not found']);
                }
            } else {
                // Get all students
                $stmt = $pdo->query("SELECT * FROM students");
                $students = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                // Add fees history to each student
                foreach ($students as &$student) {
                    $stmt = $pdo->prepare("SELECT * FROM fees_history WHERE student_id = ? ORDER BY created_at DESC");
                    $stmt->execute([$student['id']]);
                    $feesHistory = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    $student['feesHistory'] = $feesHistory;
                }
                
                // Format all students data to ensure proper data types
                $students = formatStudentsData($students);
                
                echo json_encode($students);
            }
            break;
            
        case 'POST':
            // Add new student
            // Let the database generate the auto-incrementing ID
            $stmt = $pdo->prepare("INSERT INTO students (photo, grNo, firstName, lastName, fatherName, religion, address, dateOfBirth, birthPlace, lastSchoolAttended, dateOfAdmission, class, section, monthlyFees, admissionFees, feesPaid, totalFees, familyId, relationship, parentId, status, academicYear, admissionTimestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            
            $stmt->execute([
                $input['photo'] ?? '',
                $input['grNo'] ?? '',
                $input['firstName'] ?? '',
                $input['lastName'] ?? '',
                $input['fatherName'] ?? '',
                $input['religion'] ?? '',
                $input['address'] ?? '',
                $input['dateOfBirth'] ?? null,
                $input['birthPlace'] ?? '',
                $input['lastSchoolAttended'] ?? '',
                $input['dateOfAdmission'] ?? null,
                $input['class'] ?? '',
                $input['section'] ?? '',
                $input['monthlyFees'] ?? 0,
                $input['admissionFees'] ?? 0,
                $input['feesPaid'] ?? 0,
                $input['totalFees'] ?? 0,
                $input['familyId'] ?? '',
                $input['relationship'] ?? '',
                $input['parentId'] ?? null,
                $input['status'] ?? 'studying',
                $input['academicYear'] ?? '',
                $input['admissionTimestamp'] ?? date('Y-m-d H:i:s')
            ]);
            
            // Get the auto-generated ID
            $id = $pdo->lastInsertId();
            
            // If fees history is provided, insert it
            if (isset($input['feesHistory']) && is_array($input['feesHistory'])) {
                foreach ($input['feesHistory'] as $fee) {
                    $feeId = $fee['id'] ?? uniqid('challan-');
                    $stmt = $pdo->prepare("INSERT INTO fees_history (id, student_id, month, amount, paid, date, dueDate, status, type, academicYear, paymentTimestamp, generationTimestamp, paymentMethod, fineAmount, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                    $stmt->execute([
                        $feeId,
                        $id,
                        $fee['month'] ?? '',
                        $fee['amount'] ?? 0,
                        $fee['paid'] ?? false,
                        $fee['date'] ?? null,
                        $fee['dueDate'] ?? null,
                        $fee['status'] ?? 'pending',
                        $fee['type'] ?? '',
                        $fee['academicYear'] ?? '',
                        $fee['paymentTimestamp'] ?? null,
                        $fee['generationTimestamp'] ?? null,
                        $fee['paymentMethod'] ?? null,
                        $fee['fineAmount'] ?? 0,
                        $fee['description'] ?? ''
                    ]);
                }
            }
            
            // Return the created student
            $stmt = $pdo->prepare("SELECT * FROM students WHERE id = ?");
            $stmt->execute([$id]);
            $student = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Get fees history for this student
            $stmt = $pdo->prepare("SELECT * FROM fees_history WHERE student_id = ? ORDER BY created_at DESC");
            $stmt->execute([$id]);
            $feesHistory = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $student['feesHistory'] = $feesHistory;
            
            // Format the student data to ensure proper data types
            $student = formatStudentData($student);
            
            echo json_encode($student);
            break;
            
        case 'PUT':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Student ID is required']);
                return;
            }
            
            // Update student
            $stmt = $pdo->prepare("UPDATE students SET photo = ?, grNo = ?, firstName = ?, lastName = ?, fatherName = ?, religion = ?, address = ?, dateOfBirth = ?, birthPlace = ?, lastSchoolAttended = ?, dateOfAdmission = ?, class = ?, section = ?, dateOfLeaving = ?, classInWhichLeft = ?, reasonOfLeaving = ?, remarks = ?, monthlyFees = ?, admissionFees = ?, feesPaid = ?, totalFees = ?, familyId = ?, relationship = ?, parentId = ?, status = ?, academicYear = ? WHERE id = ?");
            
            $stmt->execute([
                $input['photo'] ?? '',
                $input['grNo'] ?? '',
                $input['firstName'] ?? '',
                $input['lastName'] ?? '',
                $input['fatherName'] ?? '',
                $input['religion'] ?? '',
                $input['address'] ?? '',
                $input['dateOfBirth'] ?? null,
                $input['birthPlace'] ?? '',
                $input['lastSchoolAttended'] ?? '',
                $input['dateOfAdmission'] ?? null,
                $input['class'] ?? '',
                $input['section'] ?? '',
                $input['dateOfLeaving'] ?? null,
                $input['classInWhichLeft'] ?? '',
                $input['reasonOfLeaving'] ?? '',
                $input['remarks'] ?? '',
                $input['monthlyFees'] ?? 0,
                $input['admissionFees'] ?? 0,
                $input['feesPaid'] ?? 0,
                $input['totalFees'] ?? 0,
                $input['familyId'] ?? '',
                $input['relationship'] ?? '',
                $input['parentId'] ?? null,
                $input['status'] ?? 'studying',
                $input['academicYear'] ?? '',
                $id
            ]);
            
            // If fees history is provided, update it
            if (isset($input['feesHistory']) && is_array($input['feesHistory'])) {
                // First delete existing fees history for this student
                $stmt = $pdo->prepare("DELETE FROM fees_history WHERE student_id = ?");
                $stmt->execute([$id]);
                
                // Then insert new fees history
                foreach ($input['feesHistory'] as $fee) {
                    $stmt = $pdo->prepare("INSERT INTO fees_history (student_id, month, amount, paid, date, dueDate, status, type, academicYear, paymentTimestamp, generationTimestamp, paymentMethod, fineAmount, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                    $stmt->execute([
                        $id,
                        $fee['month'] ?? '',
                        $fee['amount'] ?? 0,
                        $fee['paid'] ?? false,
                        $fee['date'] ?? null,
                        $fee['dueDate'] ?? null,
                        $fee['status'] ?? 'pending',
                        $fee['type'] ?? '',
                        $fee['academicYear'] ?? '',
                        $fee['paymentTimestamp'] ?? null,
                        $fee['generationTimestamp'] ?? null,
                        $fee['paymentMethod'] ?? null,
                        $fee['fineAmount'] ?? 0,
                        $fee['description'] ?? ''
                    ]);
                }
            }
            
            // Return the updated student
            $stmt = $pdo->prepare("SELECT * FROM students WHERE id = ?");
            $stmt->execute([$id]);
            $student = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Get fees history for this student
            $stmt = $pdo->prepare("SELECT * FROM fees_history WHERE student_id = ? ORDER BY created_at DESC");
            $stmt->execute([$id]);
            $feesHistory = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $student['feesHistory'] = $feesHistory;
            
            // Format the student data to ensure proper data types
            $student = formatStudentData($student);
            
            echo json_encode($student);
            break;
            
        case 'DELETE':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Student ID is required']);
                return;
            }
            
            // Delete student (cascades to fees_history)
            $stmt = $pdo->prepare("DELETE FROM students WHERE id = ?");
            $stmt->execute([$id]);
            
            echo json_encode(['message' => 'Student deleted successfully']);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
}

// Classes handler
function handleClasses($method, $id, $input, $pdo) {
    switch ($method) {
        case 'GET':
            if ($id) {
                // Get specific class by ID
                $stmt = $pdo->prepare("SELECT * FROM classes WHERE id = ?");
                $stmt->execute([$id]);
                $class = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($class) {
                    // Get subjects for this class
                    $stmt = $pdo->prepare("SELECT * FROM subjects WHERE class_id = ?");
                    $stmt->execute([$id]);
                    $subjects = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    $class['subjects'] = $subjects;
                    
                    // Get sections for this class
                    $stmt = $pdo->prepare("SELECT * FROM sections WHERE class_id = ?");
                    $stmt->execute([$id]);
                    $sections = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    $class['sections'] = $sections;
                    
                    echo json_encode($class);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Class not found']);
                }
            } else {
                // Check if name parameter is provided
                $className = isset($_GET['name']) ? $_GET['name'] : null;
                
                if ($className) {
                    // Get specific class by name
                    $stmt = $pdo->prepare("SELECT * FROM classes WHERE name = ?");
                    $stmt->execute([$className]);
                    $class = $stmt->fetch(PDO::FETCH_ASSOC);
                    
                    if ($class) {
                        // Get subjects for this class
                        $stmt = $pdo->prepare("SELECT * FROM subjects WHERE class_id = ?");
                        $stmt->execute([$class['id']]);
                        $subjects = $stmt->fetchAll(PDO::FETCH_ASSOC);
                        $class['subjects'] = $subjects;
                        
                        // Get sections for this class
                        $stmt = $pdo->prepare("SELECT * FROM sections WHERE class_id = ?");
                        $stmt->execute([$class['id']]);
                        $sections = $stmt->fetchAll(PDO::FETCH_ASSOC);
                        $class['sections'] = $sections;
                        
                        echo json_encode([$class]); // Return as array to match frontend expectation
                    } else {
                        echo json_encode([]); // Return empty array if not found
                    }
                } else {
                    // Get all classes
                    $stmt = $pdo->query("SELECT * FROM classes");
                    $classes = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    
                    // Add subjects and sections to each class
                    foreach ($classes as &$class) {
                        // Get subjects for this class
                        $stmt = $pdo->prepare("SELECT * FROM subjects WHERE class_id = ?");
                        $stmt->execute([$class['id']]);
                        $subjects = $stmt->fetchAll(PDO::FETCH_ASSOC);
                        $class['subjects'] = $subjects;
                        
                        // Get sections for this class
                        $stmt = $pdo->prepare("SELECT * FROM sections WHERE class_id = ?");
                        $stmt->execute([$class['id']]);
                        $sections = $stmt->fetchAll(PDO::FETCH_ASSOC);
                        $class['sections'] = $sections;
                    }
                    
                    echo json_encode($classes);
                }
            }
            break;
            
        case 'POST':
            // Add new class
            $id = $input['id'] ?? uniqid();
            $stmt = $pdo->prepare("INSERT INTO classes (id, name, monthlyFees, admissionFees) VALUES (?, ?, ?, ?)");
            $stmt->execute([
                $id,
                $input['name'] ?? '',
                $input['monthlyFees'] ?? 0,
                $input['admissionFees'] ?? 0
            ]);
            
            // Handle sections if provided
            if (isset($input['sections']) && is_array($input['sections'])) {
                foreach ($input['sections'] as $section) {
                    $sectionId = $section['id'] ?? uniqid();
                    $stmt = $pdo->prepare("INSERT INTO sections (id, class_id, name) VALUES (?, ?, ?)");
                    $stmt->execute([
                        $sectionId,
                        $id,
                        $section['name'] ?? ''
                    ]);
                }
            }
            
            // Return the created class with sections
            $stmt = $pdo->prepare("SELECT * FROM classes WHERE id = ?");
            $stmt->execute([$id]);
            $class = $stmt->fetch(PDO::FETCH_ASSOC);
            $class['subjects'] = [];
            
            // Get sections for this class
            $stmt = $pdo->prepare("SELECT * FROM sections WHERE class_id = ?");
            $stmt->execute([$id]);
            $sections = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $class['sections'] = $sections;
            
            echo json_encode($class);
            break;
            
        case 'PUT':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Class ID is required']);
                return;
            }
            
            // Update class
            $stmt = $pdo->prepare("UPDATE classes SET name = ?, monthlyFees = ?, admissionFees = ? WHERE id = ?");
            $stmt->execute([
                $input['name'] ?? '',
                $input['monthlyFees'] ?? 0,
                $input['admissionFees'] ?? 0,
                $id
            ]);
            
            // Handle sections if provided
            if (isset($input['sections']) && is_array($input['sections'])) {
                // First, delete existing sections for this class
                $stmt = $pdo->prepare("DELETE FROM sections WHERE class_id = ?");
                $stmt->execute([$id]);
                
                // Then add the new sections
                foreach ($input['sections'] as $section) {
                    $sectionId = $section['id'] ?? uniqid();
                    $stmt = $pdo->prepare("INSERT INTO sections (id, class_id, name) VALUES (?, ?, ?)");
                    $stmt->execute([
                        $sectionId,
                        $id,
                        $section['name'] ?? ''
                    ]);
                }
            }
            
            // Return the updated class
            $stmt = $pdo->prepare("SELECT * FROM classes WHERE id = ?");
            $stmt->execute([$id]);
            $class = $stmt->fetch(PDO::FETCH_ASSOC);
            $class['subjects'] = [];
            
            // Get sections for this class
            $stmt = $pdo->prepare("SELECT * FROM sections WHERE class_id = ?");
            $stmt->execute([$id]);
            $sections = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $class['sections'] = $sections;
            
            echo json_encode($class);
            break;
            
        case 'DELETE':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Class ID is required']);
                return;
            }
            
            // Delete class (cascades to sections)
            $stmt = $pdo->prepare("DELETE FROM classes WHERE id = ?");
            $stmt->execute([$id]);
            
            echo json_encode(['message' => 'Class deleted successfully']);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
}

// Sections handler
function handleSections($method, $id, $input, $pdo) {
    switch ($method) {
        case 'GET':
            if ($id) {
                // Get specific section
                $stmt = $pdo->prepare("SELECT * FROM sections WHERE id = ?");
                $stmt->execute([$id]);
                $section = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($section) {
                    echo json_encode($section);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Section not found']);
                }
            } else {
                // Check if class_id parameter is provided
                $classId = isset($_GET['classId']) ? $_GET['classId'] : null;
                
                if ($classId) {
                    // Get sections for specific class
                    $stmt = $pdo->prepare("SELECT * FROM sections WHERE class_id = ?");
                    $stmt->execute([$classId]);
                    $sections = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    echo json_encode($sections);
                } else {
                    // Get all sections
                    $stmt = $pdo->query("SELECT * FROM sections");
                    $sections = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    echo json_encode($sections);
                }
            }
            break;
            
        case 'POST':
            // Add new section
            $id = $input['id'] ?? uniqid();
            $stmt = $pdo->prepare("INSERT INTO sections (id, class_id, name) VALUES (?, ?, ?)");
            $stmt->execute([
                $id,
                $input['class_id'] ?? '',
                $input['name'] ?? ''
            ]);
            
            // Return the created section
            $stmt = $pdo->prepare("SELECT * FROM sections WHERE id = ?");
            $stmt->execute([$id]);
            $section = $stmt->fetch(PDO::FETCH_ASSOC);
            
            echo json_encode($section);
            break;
            
        case 'PUT':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Section ID is required']);
                return;
            }
            
            // Update section
            $stmt = $pdo->prepare("UPDATE sections SET class_id = ?, name = ? WHERE id = ?");
            $stmt->execute([
                $input['class_id'] ?? '',
                $input['name'] ?? '',
                $id
            ]);
            
            // Return the updated section
            $stmt = $pdo->prepare("SELECT * FROM sections WHERE id = ?");
            $stmt->execute([$id]);
            $section = $stmt->fetch(PDO::FETCH_ASSOC);
            
            echo json_encode($section);
            break;
            
        case 'DELETE':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Section ID is required']);
                return;
            }
            
            // Delete section
            $stmt = $pdo->prepare("DELETE FROM sections WHERE id = ?");
            $stmt->execute([$id]);
            
            echo json_encode(['message' => 'Section deleted successfully']);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
}

// Subjects handler
function handleSubjects($method, $id, $input, $pdo) {
    switch ($method) {
        case 'GET':
            if ($id) {
                // Get specific subject
                $stmt = $pdo->prepare("SELECT s.*, st.firstName as teacherFirstName, st.lastName as teacherLastName FROM subjects s LEFT JOIN staff st ON s.teacher_id = st.id WHERE s.id = ?");
                $stmt->execute([$id]);
                $subject = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($subject) {
                    echo json_encode($subject);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Subject not found']);
                }
            } else {
                // Check if class_id parameter is provided
                $classId = isset($_GET['classId']) ? $_GET['classId'] : null;
                
                if ($classId) {
                    // Get subjects for specific class
                    $stmt = $pdo->prepare("SELECT s.*, st.firstName as teacherFirstName, st.lastName as teacherLastName FROM subjects s LEFT JOIN staff st ON s.teacher_id = st.id WHERE s.class_id = ?");
                    $stmt->execute([$classId]);
                    $subjects = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    echo json_encode($subjects);
                } else {
                    // Get all subjects
                    $stmt = $pdo->prepare("SELECT s.*, st.firstName as teacherFirstName, st.lastName as teacherLastName FROM subjects s LEFT JOIN staff st ON s.teacher_id = st.id");
                    $stmt->execute();
                    $subjects = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    echo json_encode($subjects);
                }
            }
            break;
            
        case 'POST':
            // Add new subject
            $stmt = $pdo->prepare("INSERT INTO subjects (id, class_id, name, code, teacher_id, maxMarks) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $input['id'] ?? uniqid(),
                $input['class_id'] ?? '',
                $input['name'] ?? '',
                $input['code'] ?? '',
                $input['teacher_id'] ?? null,
                $input['maxMarks'] ?? 100
            ]);
            
            // Return the created subject with teacher info
            $id = $pdo->lastInsertId() ? $pdo->lastInsertId() : $input['id'];
            $stmt = $pdo->prepare("SELECT s.*, st.firstName as teacherFirstName, st.lastName as teacherLastName FROM subjects s LEFT JOIN staff st ON s.teacher_id = st.id WHERE s.id = ?");
            $stmt->execute([$id]);
            $subject = $stmt->fetch(PDO::FETCH_ASSOC);
            
            echo json_encode($subject);
            break;
            
        case 'PUT':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Subject ID is required']);
                return;
            }
            
            // Update subject
            $stmt = $pdo->prepare("UPDATE subjects SET class_id = ?, name = ?, code = ?, teacher_id = ?, maxMarks = ? WHERE id = ?");
            $stmt->execute([
                $input['class_id'] ?? '',
                $input['name'] ?? '',
                $input['code'] ?? '',
                $input['teacher_id'] ?? null,
                $input['maxMarks'] ?? 100,
                $id
            ]);
            
            // Return the updated subject with teacher info
            $stmt = $pdo->prepare("SELECT s.*, st.firstName as teacherFirstName, st.lastName as teacherLastName FROM subjects s LEFT JOIN staff st ON s.teacher_id = st.id WHERE s.id = ?");
            $stmt->execute([$id]);
            $subject = $stmt->fetch(PDO::FETCH_ASSOC);
            
            echo json_encode($subject);
            break;
            
        case 'DELETE':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Subject ID is required']);
                return;
            }
            
            // Delete subject
            $stmt = $pdo->prepare("DELETE FROM subjects WHERE id = ?");
            $stmt->execute([$id]);
            
            echo json_encode(['message' => 'Subject deleted successfully']);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
}

// Expenses handler
function handleExpenses($method, $id, $input, $pdo) {
    switch ($method) {
        case 'GET':
            if ($id) {
                // Get specific expense
                $stmt = $pdo->prepare("SELECT * FROM expenses WHERE id = ?");
                $stmt->execute([$id]);
                $expense = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($expense) {
                    // Convert numeric fields to proper numbers
                    $expense = convertFieldsToNumbers($expense, ['amount']);
                    echo json_encode($expense);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Expense not found']);
                }
            } else {
                // Get all expenses
                $stmt = $pdo->query("SELECT * FROM expenses");
                $expenses = $stmt->fetchAll(PDO::FETCH_ASSOC);
                // Convert numeric fields to proper numbers
                foreach ($expenses as &$expense) {
                    $expense = convertFieldsToNumbers($expense, ['amount']);
                }
                echo json_encode($expenses);
            }
            break;
            
        case 'POST':
            // Add new expense
            $id = $input['id'] ?? uniqid();
            $stmt = $pdo->prepare("INSERT INTO expenses (id, category, description, amount, date, academicYear, addedTimestamp) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $id,
                $input['category'] ?? '',
                $input['description'] ?? '',
                $input['amount'] ?? 0,
                $input['date'] ?? null,
                $input['academicYear'] ?? '',
                $input['addedTimestamp'] ?? date('Y-m-d H:i:s')
            ]);
            
            // Return the created expense
            $stmt = $pdo->prepare("SELECT * FROM expenses WHERE id = ?");
            $stmt->execute([$id]);
            $expense = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Convert numeric fields to proper numbers
            $expense = convertFieldsToNumbers($expense, ['amount']);
            
            echo json_encode($expense);
            break;
            
        case 'PUT':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Expense ID is required']);
                return;
            }
            
            // Update expense
            $stmt = $pdo->prepare("UPDATE expenses SET category = ?, description = ?, amount = ?, date = ?, academicYear = ? WHERE id = ?");
            $stmt->execute([
                $input['category'] ?? '',
                $input['description'] ?? '',
                $input['amount'] ?? 0,
                $input['date'] ?? null,
                $input['academicYear'] ?? '',
                $id
            ]);
            
            // Return the updated expense
            $stmt = $pdo->prepare("SELECT * FROM expenses WHERE id = ?");
            $stmt->execute([$id]);
            $expense = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Convert numeric fields to proper numbers
            $expense = convertFieldsToNumbers($expense, ['amount']);
            
            echo json_encode($expense);
            break;
            
        case 'DELETE':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Expense ID is required']);
                return;
            }
            
            // Delete expense
            $stmt = $pdo->prepare("DELETE FROM expenses WHERE id = ?");
            $stmt->execute([$id]);
            
            echo json_encode(['message' => 'Expense deleted successfully']);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
}

// Exams handler
function handleExams($method, $id, $input, $pdo) {
    switch ($method) {
        case 'GET':
            if ($id) {
                // Get specific exam
                $stmt = $pdo->prepare("SELECT * FROM exams WHERE id = ?");
                $stmt->execute([$id]);
                $exam = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($exam) {
                    // Convert numeric fields to proper numbers
                    $exam = convertFieldsToNumbers($exam, ['totalMarks']);
                    echo json_encode($exam);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Exam not found']);
                }
            } else {
                // Get all exams
                $stmt = $pdo->query("SELECT * FROM exams");
                $exams = $stmt->fetchAll(PDO::FETCH_ASSOC);
                // Convert numeric fields to proper numbers
                foreach ($exams as &$exam) {
                    $exam = convertFieldsToNumbers($exam, ['totalMarks']);
                }
                echo json_encode($exams);
            }
            break;
            
        case 'POST':
            // Add new exam
            $id = $input['id'] ?? uniqid();
            $stmt = $pdo->prepare("INSERT INTO exams (id, name, examType, class, subject, date, totalMarks, academicYear) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $id,
                $input['name'] ?? '',
                $input['examType'] ?? '',
                $input['class'] ?? '',
                $input['subject'] ?? '',
                $input['date'] ?? null,
                $input['totalMarks'] ?? 0,
                $input['academicYear'] ?? ''
            ]);
            
            // Return the created exam
            $stmt = $pdo->prepare("SELECT * FROM exams WHERE id = ?");
            $stmt->execute([$id]);
            $exam = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Convert numeric fields to proper numbers
            $exam = convertFieldsToNumbers($exam, ['totalMarks']);
            
            echo json_encode($exam);
            break;
            
        case 'PUT':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Exam ID is required']);
                return;
            }
            
            // Update exam
            $stmt = $pdo->prepare("UPDATE exams SET name = ?, examType = ?, class = ?, subject = ?, date = ?, totalMarks = ?, academicYear = ? WHERE id = ?");
            $stmt->execute([
                $input['name'] ?? '',
                $input['examType'] ?? '',
                $input['class'] ?? '',
                $input['subject'] ?? '',
                $input['date'] ?? null,
                $input['totalMarks'] ?? 0,
                $input['academicYear'] ?? '',
                $id
            ]);
            
            // Return the updated exam
            $stmt = $pdo->prepare("SELECT * FROM exams WHERE id = ?");
            $stmt->execute([$id]);
            $exam = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Convert numeric fields to proper numbers
            $exam = convertFieldsToNumbers($exam, ['totalMarks']);
            
            echo json_encode($exam);
            break;
            
        case 'DELETE':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Exam ID is required']);
                return;
            }
            
            // Delete exam
            $stmt = $pdo->prepare("DELETE FROM exams WHERE id = ?");
            $stmt->execute([$id]);
            
            echo json_encode(['message' => 'Exam deleted successfully']);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
}

// Staff handler
function handleStaff($method, $id, $input, $pdo) {
    switch ($method) {
        case 'GET':
            if ($id) {
                // Get specific staff member
                $stmt = $pdo->prepare("SELECT * FROM staff WHERE id = ?");
                $stmt->execute([$id]);
                $staff = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($staff) {
                    // Get salary history for this staff member
                    $stmt = $pdo->prepare("SELECT * FROM staff_salary_history WHERE staff_id = ? ORDER BY created_at DESC");
                    $stmt->execute([$id]);
                    $salaryHistory = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    $staff['salaryHistory'] = $salaryHistory;
                    
                    // Format the staff data to ensure proper data types
                    $staff = formatStaffData($staff);
                    
                    echo json_encode($staff);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Staff member not found']);
                }
            } else {
                // Get all staff members
                $stmt = $pdo->query("SELECT * FROM staff");
                $staffMembers = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                // Add salary history to each staff member
                foreach ($staffMembers as &$staff) {
                    $stmt = $pdo->prepare("SELECT * FROM staff_salary_history WHERE staff_id = ? ORDER BY created_at DESC");
                    $stmt->execute([$staff['id']]);
                    $salaryHistory = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    $staff['salaryHistory'] = $salaryHistory;
                }
                
                // Format all staff data to ensure proper data types
                $staffMembers = formatStaffDataArray($staffMembers);
                
                echo json_encode($staffMembers);
            }
            break;
            
        case 'POST':
            // Add new staff member
            $stmt = $pdo->prepare("INSERT INTO staff (photo, firstName, lastName, fatherName, cnic, gender, dateOfBirth, contactNumber, emergencyContact, email, address, department, designation, salary, dateOfJoining, jobType, subject, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            
            $stmt->execute([
                $input['photo'] ?? '',
                $input['firstName'] ?? '',
                $input['lastName'] ?? '',
                $input['fatherName'] ?? '',
                $input['cnic'] ?? '',
                $input['gender'] ?? '',
                $input['dateOfBirth'] ?? null,
                $input['contactNumber'] ?? '',
                $input['emergencyContact'] ?? '',
                $input['email'] ?? '',
                $input['address'] ?? '',
                $input['department'] ?? '',
                $input['designation'] ?? '',
                $input['salary'] ?? 0,
                $input['dateOfJoining'] ?? null,
                $input['jobType'] ?? 'Teaching',
                $input['subject'] ?? null,
                $input['status'] ?? 'active'
            ]);
            
            // Get the auto-generated ID
            $id = $pdo->lastInsertId();
            
            // If salary history is provided, insert it
            if (isset($input['salaryHistory']) && is_array($input['salaryHistory'])) {
                foreach ($input['salaryHistory'] as $salary) {
                    $stmt = $pdo->prepare("INSERT INTO staff_salary_history (id, staff_id, month, baseSalary, allowances, deductions, netSalary, status, paymentDate, paymentMethod, reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                    $stmt->execute([
                        uniqid(),
                        $id,
                        $salary['month'] ?? '',
                        $salary['baseSalary'] ?? 0,
                        $salary['allowances'] ?? 0,
                        $salary['deductions'] ?? 0,
                        $salary['netSalary'] ?? 0,
                        $salary['status'] ?? 'pending',
                        $salary['paymentDate'] ?? null,
                        $salary['paymentMethod'] ?? '',
                        $salary['reason'] ?? ''
                    ]);
                }
            }
            
            // Return the created staff member
            $stmt = $pdo->prepare("SELECT * FROM staff WHERE id = ?");
            $stmt->execute([$id]);
            $staff = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Get salary history for this staff member
            $stmt = $pdo->prepare("SELECT * FROM staff_salary_history WHERE staff_id = ? ORDER BY created_at DESC");
            $stmt->execute([$id]);
            $salaryHistory = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $staff['salaryHistory'] = $salaryHistory;
            
            echo json_encode($staff);
            break;
            
        case 'PUT':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Staff ID is required']);
                return;
            }
            
            // Update staff member
            $stmt = $pdo->prepare("UPDATE staff SET photo = ?, firstName = ?, lastName = ?, fatherName = ?, cnic = ?, gender = ?, dateOfBirth = ?, contactNumber = ?, emergencyContact = ?, email = ?, address = ?, department = ?, designation = ?, salary = ?, dateOfJoining = ?, jobType = ?, subject = ?, status = ? WHERE id = ?");
            
            $stmt->execute([
                $input['photo'] ?? '',
                $input['firstName'] ?? '',
                $input['lastName'] ?? '',
                $input['fatherName'] ?? '',
                $input['cnic'] ?? '',
                $input['gender'] ?? '',
                $input['dateOfBirth'] ?? null,
                $input['contactNumber'] ?? '',
                $input['emergencyContact'] ?? '',
                $input['email'] ?? '',
                $input['address'] ?? '',
                $input['department'] ?? '',
                $input['designation'] ?? '',
                $input['salary'] ?? 0,
                $input['dateOfJoining'] ?? null,
                $input['jobType'] ?? 'Teaching',
                $input['subject'] ?? null,
                $input['status'] ?? 'active',
                $id
            ]);
            
            // If salary history is provided, update it
            if (isset($input['salaryHistory']) && is_array($input['salaryHistory'])) {
                // First delete existing salary history for this staff member
                $stmt = $pdo->prepare("DELETE FROM staff_salary_history WHERE staff_id = ?");
                $stmt->execute([$id]);
                
                // Then insert new salary history
                foreach ($input['salaryHistory'] as $salary) {
                    $stmt = $pdo->prepare("INSERT INTO staff_salary_history (id, staff_id, month, baseSalary, allowances, deductions, netSalary, status, paymentDate, paymentMethod, reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                    $stmt->execute([
                        uniqid(),
                        $id,
                        $salary['month'] ?? '',
                        $salary['baseSalary'] ?? 0,
                        $salary['allowances'] ?? 0,
                        $salary['deductions'] ?? 0,
                        $salary['netSalary'] ?? 0,
                        $salary['status'] ?? 'pending',
                        $salary['paymentDate'] ?? null,
                        $salary['paymentMethod'] ?? '',
                        $salary['reason'] ?? ''
                    ]);
                }
            }
            
            // Return the updated staff member
            $stmt = $pdo->prepare("SELECT * FROM staff WHERE id = ?");
            $stmt->execute([$id]);
            $staff = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Get salary history for this staff member
            $stmt = $pdo->prepare("SELECT * FROM staff_salary_history WHERE staff_id = ? ORDER BY created_at DESC");
            $stmt->execute([$id]);
            $salaryHistory = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $staff['salaryHistory'] = $salaryHistory;
            
            echo json_encode($staff);
            break;
            
        case 'DELETE':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Staff ID is required']);
                return;
            }
            
            // Delete staff member (cascades to staff_salary_history)
            $stmt = $pdo->prepare("DELETE FROM staff WHERE id = ?");
            $stmt->execute([$id]);
            
            echo json_encode(['message' => 'Staff member deleted successfully']);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
}

// Staff Attendance handler
function handleStaffAttendance($method, $id, $input, $pdo) {
    switch ($method) {
        case 'GET':
            // Check if date parameter is provided
            $date = isset($_GET['date']) ? $_GET['date'] : null;
            
            if ($id) {
                // Get specific staff attendance record
                $stmt = $pdo->prepare("SELECT * FROM staff_attendance WHERE id = ?");
                $stmt->execute([$id]);
                $attendance = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($attendance) {
                    echo json_encode($attendance);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Staff attendance record not found']);
                }
            } else if ($date) {
                // Get staff attendance for specific date
                $stmt = $pdo->prepare("SELECT * FROM staff_attendance WHERE date = ?");
                $stmt->execute([$date]);
                $attendance = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($attendance);
            } else {
                // Get all staff attendance records
                $stmt = $pdo->query("SELECT * FROM staff_attendance");
                $attendance = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($attendance);
            }
            break;
            
        case 'POST':
            // Add new staff attendance record
            $id = $input['id'] ?? uniqid();
            $stmt = $pdo->prepare("INSERT INTO staff_attendance (id, date, records) VALUES (?, ?, ?)");
            $stmt->execute([
                $id,
                $input['date'] ?? null,
                json_encode($input['records'] ?? [])
            ]);
            
            // Return the created staff attendance record
            $stmt = $pdo->prepare("SELECT * FROM staff_attendance WHERE id = ?");
            $stmt->execute([$id]);
            $attendance = $stmt->fetch(PDO::FETCH_ASSOC);
            
            echo json_encode($attendance);
            break;
            
        case 'PUT':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Staff attendance ID is required']);
                return;
            }
            
            // Update staff attendance record
            $stmt = $pdo->prepare("UPDATE staff_attendance SET date = ?, records = ? WHERE id = ?");
            $stmt->execute([
                $input['date'] ?? null,
                json_encode($input['records'] ?? []),
                $id
            ]);
            
            // Return the updated staff attendance record
            $stmt = $pdo->prepare("SELECT * FROM staff_attendance WHERE id = ?");
            $stmt->execute([$id]);
            $attendance = $stmt->fetch(PDO::FETCH_ASSOC);
            
            echo json_encode($attendance);
            break;
            
        case 'DELETE':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Staff attendance ID is required']);
                return;
            }
            
            // Delete staff attendance record
            $stmt = $pdo->prepare("DELETE FROM staff_attendance WHERE id = ?");
            $stmt->execute([$id]);
            
            echo json_encode(['message' => 'Staff attendance record deleted successfully']);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
}

// Attendance handler
function handleAttendance($method, $id, $input, $pdo) {
    switch ($method) {
        case 'GET':
            // Check if date parameter is provided
            $date = isset($_GET['date']) ? $_GET['date'] : null;
            $class = isset($_GET['class']) ? $_GET['class'] : null;
            $section = isset($_GET['section']) ? $_GET['section'] : null;
            
            if ($id) {
                // Get specific attendance record
                $stmt = $pdo->prepare("SELECT * FROM attendance WHERE id = ?");
                $stmt->execute([$id]);
                $attendance = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($attendance) {
                    echo json_encode($attendance);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Attendance record not found']);
                }
            } else if ($date && $class && $section) {
                // Get attendance for specific date, class and section
                $stmt = $pdo->prepare("SELECT * FROM attendance WHERE date = ? AND class = ? AND section = ?");
                $stmt->execute([$date, $class, $section]);
                $attendance = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($attendance);
            } else if ($date) {
                // Get attendance for specific date
                $stmt = $pdo->prepare("SELECT * FROM attendance WHERE date = ?");
                $stmt->execute([$date]);
                $attendance = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($attendance);
            } else {
                // Get all attendance records
                $stmt = $pdo->query("SELECT * FROM attendance");
                $attendance = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($attendance);
            }
            break;
            
        case 'POST':
            // Add new attendance record
            $id = $input['id'] ?? uniqid();
            $stmt = $pdo->prepare("INSERT INTO attendance (id, date, class, section, subject, records, academicYear) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $id,
                $input['date'] ?? null,
                $input['class'] ?? '',
                $input['section'] ?? '',
                $input['subject'] ?? '',
                json_encode($input['records'] ?? []),
                $input['academicYear'] ?? ''
            ]);
            
            // Return the created attendance record
            $stmt = $pdo->prepare("SELECT * FROM attendance WHERE id = ?");
            $stmt->execute([$id]);
            $attendance = $stmt->fetch(PDO::FETCH_ASSOC);
            
            echo json_encode($attendance);
            break;
            
        case 'PUT':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Attendance ID is required']);
                return;
            }
            
            // Update attendance record
            $stmt = $pdo->prepare("UPDATE attendance SET date = ?, class = ?, section = ?, subject = ?, records = ?, academicYear = ? WHERE id = ?");
            $stmt->execute([
                $input['date'] ?? null,
                $input['class'] ?? '',
                $input['section'] ?? '',
                $input['subject'] ?? '',
                json_encode($input['records'] ?? []),
                $input['academicYear'] ?? '',
                $id
            ]);
            
            // Return the updated attendance record
            $stmt = $pdo->prepare("SELECT * FROM attendance WHERE id = ?");
            $stmt->execute([$id]);
            $attendance = $stmt->fetch(PDO::FETCH_ASSOC);
            
            echo json_encode($attendance);
            break;
            
        case 'DELETE':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Attendance ID is required']);
                return;
            }
            
            // Delete attendance record
            $stmt = $pdo->prepare("DELETE FROM attendance WHERE id = ?");
            $stmt->execute([$id]);
            
            echo json_encode(['message' => 'Attendance record deleted successfully']);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
}

// Students Attendance handler
function handleStudentsAttendance($method, $id, $input, $pdo) {
    switch ($method) {
        case 'GET':
            // Check if date parameter is provided
            $date = isset($_GET['date']) ? $_GET['date'] : null;
            $class = isset($_GET['class']) ? $_GET['class'] : null;
            $section = isset($_GET['section']) ? $_GET['section'] : null;
            
            if ($id) {
                // Get specific students attendance record
                $stmt = $pdo->prepare("SELECT * FROM students_attendance WHERE id = ?");
                $stmt->execute([$id]);
                $attendance = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($attendance) {
                    echo json_encode($attendance);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Students attendance record not found']);
                }
            } else if ($date && $class && $section) {
                // Get students attendance for specific date, class and section
                $stmt = $pdo->prepare("SELECT * FROM students_attendance WHERE date = ? AND class = ? AND section = ?");
                $stmt->execute([$date, $class, $section]);
                $attendance = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($attendance);
            } else if ($date) {
                // Get students attendance for specific date
                $stmt = $pdo->prepare("SELECT * FROM students_attendance WHERE date = ?");
                $stmt->execute([$date]);
                $attendance = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($attendance);
            } else {
                // Get all students attendance records
                $stmt = $pdo->query("SELECT * FROM students_attendance");
                $attendance = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($attendance);
            }
            break;
            
        case 'POST':
            // Add new students attendance record
            $id = $input['id'] ?? uniqid();
            $stmt = $pdo->prepare("INSERT INTO students_attendance (id, date, class, section, subject, records, academicYear) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $id,
                $input['date'] ?? null,
                $input['class'] ?? '',
                $input['section'] ?? '',
                $input['subject'] ?? '',
                json_encode($input['records'] ?? []),
                $input['academicYear'] ?? ''
            ]);
            
            // Return the created students attendance record
            $stmt = $pdo->prepare("SELECT * FROM students_attendance WHERE id = ?");
            $stmt->execute([$id]);
            $attendance = $stmt->fetch(PDO::FETCH_ASSOC);
            
            echo json_encode($attendance);
            break;
            
        case 'PUT':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Students attendance ID is required']);
                return;
            }
            
            // Update students attendance record
            $stmt = $pdo->prepare("UPDATE students_attendance SET date = ?, class = ?, section = ?, subject = ?, records = ?, academicYear = ? WHERE id = ?");
            $stmt->execute([
                $input['date'] ?? null,
                $input['class'] ?? '',
                $input['section'] ?? '',
                $input['subject'] ?? '',
                json_encode($input['records'] ?? []),
                $input['academicYear'] ?? '',
                $id
            ]);
            
            // Return the updated students attendance record
            $stmt = $pdo->prepare("SELECT * FROM students_attendance WHERE id = ?");
            $stmt->execute([$id]);
            $attendance = $stmt->fetch(PDO::FETCH_ASSOC);
            
            echo json_encode($attendance);
            break;
            
        case 'DELETE':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Students attendance ID is required']);
                return;
            }
            
            // Delete students attendance record
            $stmt = $pdo->prepare("DELETE FROM students_attendance WHERE id = ?");
            $stmt->execute([$id]);
            
            echo json_encode(['message' => 'Students attendance record deleted successfully']);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
}

// Marks handler
function handleMarks($method, $id, $input, $pdo) {
    switch ($method) {
        case 'GET':
            if ($id) {
                // Get specific mark record
                $stmt = $pdo->prepare("SELECT * FROM marks WHERE id = ?");
                $stmt->execute([$id]);
                $mark = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($mark) {
                    // Convert numeric fields to proper numbers
                    $mark = convertFieldsToNumbers($mark, ['marksObtained', 'totalMarks']);
                    echo json_encode($mark);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Mark record not found']);
                }
            } else {
                // Get all mark records
                $stmt = $pdo->query("SELECT * FROM marks");
                $marks = $stmt->fetchAll(PDO::FETCH_ASSOC);
                // Convert numeric fields to proper numbers
                foreach ($marks as &$mark) {
                    $mark = convertFieldsToNumbers($mark, ['marksObtained', 'totalMarks']);
                }
                echo json_encode($marks);
            }
            break;
            
        case 'POST':
            // Add new mark record
            $id = $input['id'] ?? uniqid();
            $stmt = $pdo->prepare("INSERT INTO marks (id, studentId, studentName, class, examId, examName, subject, marksObtained, totalMarks, academicYear, year) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $id,
                $input['studentId'] ?? '',
                $input['studentName'] ?? '',
                $input['class'] ?? '',
                $input['examId'] ?? '',
                $input['examName'] ?? '',
                $input['subject'] ?? '',
                $input['marksObtained'] ?? 0,
                $input['totalMarks'] ?? 0,
                $input['academicYear'] ?? '',
                $input['year'] ?? ''
            ]);
            
            // Return the created mark record
            $stmt = $pdo->prepare("SELECT * FROM marks WHERE id = ?");
            $stmt->execute([$id]);
            $mark = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Convert numeric fields to proper numbers
            $mark = convertFieldsToNumbers($mark, ['marksObtained', 'totalMarks']);
            
            echo json_encode($mark);
            break;
            
        case 'PUT':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Mark ID is required']);
                return;
            }
            
            // Update mark record
            $stmt = $pdo->prepare("UPDATE marks SET studentId = ?, studentName = ?, class = ?, examId = ?, examName = ?, subject = ?, marksObtained = ?, totalMarks = ?, academicYear = ?, year = ? WHERE id = ?");
            $stmt->execute([
                $input['studentId'] ?? '',
                $input['studentName'] ?? '',
                $input['class'] ?? '',
                $input['examId'] ?? '',
                $input['examName'] ?? '',
                $input['subject'] ?? '',
                $input['marksObtained'] ?? 0,
                $input['totalMarks'] ?? 0,
                $input['academicYear'] ?? '',
                $input['year'] ?? '',
                $id
            ]);
            
            // Return the updated mark record
            $stmt = $pdo->prepare("SELECT * FROM marks WHERE id = ?");
            $stmt->execute([$id]);
            $mark = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Convert numeric fields to proper numbers
            $mark = convertFieldsToNumbers($mark, ['marksObtained', 'totalMarks']);
            
            echo json_encode($mark);
            break;
            
        case 'DELETE':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Mark ID is required']);
                return;
            }
            
            // Delete mark record
            $stmt = $pdo->prepare("DELETE FROM marks WHERE id = ?");
            $stmt->execute([$id]);
            
            echo json_encode(['message' => 'Mark record deleted successfully']);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
}

// Subsidies handler
function handleSubsidies($method, $id, $input, $pdo) {
    switch ($method) {
        case 'GET':
            if ($id) {
                // Get specific subsidy
                $stmt = $pdo->prepare("SELECT * FROM subsidies WHERE id = ?");
                $stmt->execute([$id]);
                $subsidy = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($subsidy) {
                    // Convert numeric fields to proper numbers
                    $subsidy = convertFieldsToNumbers($subsidy, ['amount']);
                    echo json_encode($subsidy);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Subsidy not found']);
                }
            } else {
                // Get all subsidies
                $stmt = $pdo->query("SELECT * FROM subsidies");
                $subsidies = $stmt->fetchAll(PDO::FETCH_ASSOC);
                // Convert numeric fields to proper numbers
                foreach ($subsidies as &$subsidy) {
                    $subsidy = convertFieldsToNumbers($subsidy, ['amount']);
                }
                echo json_encode($subsidies);
            }
            break;
            
        case 'POST':
            // Add new subsidy
            $id = $input['id'] ?? uniqid();
            $stmt = $pdo->prepare("INSERT INTO subsidies (id, studentId, studentName, class, section, fatherName, cnic, contactNumber, description, amount, date, academicYear, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $id,
                $input['studentId'] ?? '',
                $input['studentName'] ?? '',
                $input['class'] ?? '',
                $input['section'] ?? '',
                $input['fatherName'] ?? '',
                $input['cnic'] ?? '',
                $input['contactNumber'] ?? '',
                $input['description'] ?? '',
                $input['amount'] ?? 0,
                $input['date'] ?? null,
                $input['academicYear'] ?? '',
                $input['status'] ?? 'pending'
            ]);
            
            // Return the created subsidy
            $stmt = $pdo->prepare("SELECT * FROM subsidies WHERE id = ?");
            $stmt->execute([$id]);
            $subsidy = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Convert numeric fields to proper numbers
            $subsidy = convertFieldsToNumbers($subsidy, ['amount']);
            
            echo json_encode($subsidy);
            break;
            
        case 'PUT':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Subsidy ID is required']);
                return;
            }
            
            // Update subsidy
            $stmt = $pdo->prepare("UPDATE subsidies SET studentId = ?, studentName = ?, class = ?, section = ?, fatherName = ?, cnic = ?, contactNumber = ?, description = ?, amount = ?, date = ?, academicYear = ?, status = ? WHERE id = ?");
            $stmt->execute([
                $input['studentId'] ?? '',
                $input['studentName'] ?? '',
                $input['class'] ?? '',
                $input['section'] ?? '',
                $input['fatherName'] ?? '',
                $input['cnic'] ?? '',
                $input['contactNumber'] ?? '',
                $input['description'] ?? '',
                $input['amount'] ?? 0,
                $input['date'] ?? null,
                $input['academicYear'] ?? '',
                $input['status'] ?? 'pending',
                $id
            ]);
            
            // Return the updated subsidy
            $stmt = $pdo->prepare("SELECT * FROM subsidies WHERE id = ?");
            $stmt->execute([$id]);
            $subsidy = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Convert numeric fields to proper numbers
            $subsidy = convertFieldsToNumbers($subsidy, ['amount']);
            
            echo json_encode($subsidy);
            break;
            
        case 'DELETE':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Subsidy ID is required']);
                return;
            }
            
            // Delete subsidy
            $stmt = $pdo->prepare("DELETE FROM subsidies WHERE id = ?");
            $stmt->execute([$id]);
            
            echo json_encode(['message' => 'Subsidy deleted successfully']);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
}

// Batches handler
function handleBatches($method, $id, $input, $pdo) {
    switch ($method) {
        case 'GET':
            if ($id) {
                // Get specific batch
                $stmt = $pdo->prepare("SELECT * FROM batches WHERE id = ?");
                $stmt->execute([$id]);
                $batch = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($batch) {
                    // Convert numeric fields to proper numbers
                    $batch = convertFieldsToNumbers($batch, ['capacity']);
                    echo json_encode($batch);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Batch not found']);
                }
            } else {
                // Get all batches
                $stmt = $pdo->query("SELECT * FROM batches");
                $batches = $stmt->fetchAll(PDO::FETCH_ASSOC);
                // Convert numeric fields to proper numbers
                foreach ($batches as &$batch) {
                    $batch = convertFieldsToNumbers($batch, ['capacity']);
                }
                echo json_encode($batches);
            }
            break;
            
        case 'POST':
            // Add new batch
            $id = $input['id'] ?? uniqid();
            $stmt = $pdo->prepare("INSERT INTO batches (id, name, program, startDate, endDate, capacity, status, description, academicYear) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $id,
                $input['name'] ?? '',
                $input['program'] ?? '',
                $input['startDate'] ?? null,
                $input['endDate'] ?? null,
                $input['capacity'] ?? 0,
                $input['status'] ?? 'active',
                $input['description'] ?? '',
                $input['academicYear'] ?? ''
            ]);
            
            // Return the created batch
            $stmt = $pdo->prepare("SELECT * FROM batches WHERE id = ?");
            $stmt->execute([$id]);
            $batch = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Convert numeric fields to proper numbers
            $batch = convertFieldsToNumbers($batch, ['capacity']);
            
            echo json_encode($batch);
            break;
            
        case 'PUT':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Batch ID is required']);
                return;
            }
            
            // Update batch
            $stmt = $pdo->prepare("UPDATE batches SET name = ?, program = ?, startDate = ?, endDate = ?, capacity = ?, status = ?, description = ?, academicYear = ? WHERE id = ?");
            $stmt->execute([
                $input['name'] ?? '',
                $input['program'] ?? '',
                $input['startDate'] ?? null,
                $input['endDate'] ?? null,
                $input['capacity'] ?? 0,
                $input['status'] ?? 'active',
                $input['description'] ?? '',
                $input['academicYear'] ?? '',
                $id
            ]);
            
            // Return the updated batch
            $stmt = $pdo->prepare("SELECT * FROM batches WHERE id = ?");
            $stmt->execute([$id]);
            $batch = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Convert numeric fields to proper numbers
            $batch = convertFieldsToNumbers($batch, ['capacity']);
            
            echo json_encode($batch);
            break;
            
        case 'DELETE':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Batch ID is required']);
                return;
            }
            
            // Delete batch
            $stmt = $pdo->prepare("DELETE FROM batches WHERE id = ?");
            $stmt->execute([$id]);
            
            echo json_encode(['message' => 'Batch deleted successfully']);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
}

// Notifications handler
function handleNotifications($method, $id, $input, $pdo) {
    switch ($method) {
        case 'GET':
            if ($id) {
                // Get specific notification
                $stmt = $pdo->prepare("SELECT * FROM notifications WHERE id = ?");
                $stmt->execute([$id]);
                $notification = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($notification) {
                    echo json_encode($notification);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Notification not found']);
                }
            } else {
                // Get all notifications
                $stmt = $pdo->query("SELECT * FROM notifications ORDER BY created_at DESC");
                $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($notifications);
            }
            break;
            
        case 'POST':
            // Add new notification
            $id = $input['id'] ?? uniqid();
            $stmt = $pdo->prepare("INSERT INTO notifications (id, title, message, type, priority, recipientType, recipients, status, scheduledTime, sentTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $id,
                $input['title'] ?? '',
                $input['message'] ?? '',
                $input['type'] ?? 'info',
                $input['priority'] ?? 'normal',
                $input['recipientType'] ?? 'all',
                json_encode($input['recipients'] ?? []),
                $input['status'] ?? 'draft',
                $input['scheduledTime'] ?? null,
                $input['sentTime'] ?? null
            ]);
            
            // Return the created notification
            $stmt = $pdo->prepare("SELECT * FROM notifications WHERE id = ?");
            $stmt->execute([$id]);
            $notification = $stmt->fetch(PDO::FETCH_ASSOC);
            
            echo json_encode($notification);
            break;
            
        case 'PUT':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Notification ID is required']);
                return;
            }
            
            // Update notification
            $stmt = $pdo->prepare("UPDATE notifications SET title = ?, message = ?, type = ?, priority = ?, recipientType = ?, recipients = ?, status = ?, scheduledTime = ?, sentTime = ? WHERE id = ?");
            $stmt->execute([
                $input['title'] ?? '',
                $input['message'] ?? '',
                $input['type'] ?? 'info',
                $input['priority'] ?? 'normal',
                $input['recipientType'] ?? 'all',
                json_encode($input['recipients'] ?? []),
                $input['status'] ?? 'draft',
                $input['scheduledTime'] ?? null,
                $input['sentTime'] ?? null,
                $id
            ]);
            
            // Return the updated notification
            $stmt = $pdo->prepare("SELECT * FROM notifications WHERE id = ?");
            $stmt->execute([$id]);
            $notification = $stmt->fetch(PDO::FETCH_ASSOC);
            
            echo json_encode($notification);
            break;
            
        case 'DELETE':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Notification ID is required']);
