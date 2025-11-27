<?php
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
            $stmt = $pdo->prepare("INSERT INTO exams (id, name, class, subject, date, totalMarks, academicYear) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $id,
                $input['name'] ?? '',
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
            $stmt = $pdo->prepare("UPDATE exams SET name = ?, class = ?, subject = ?, date = ?, totalMarks = ?, academicYear = ? WHERE id = ?");
            $stmt->execute([
                $input['name'] ?? '',
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