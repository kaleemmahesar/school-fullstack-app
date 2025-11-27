<?php
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