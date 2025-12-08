<?php
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
            $stmt = $pdo->prepare("INSERT INTO marks (id, studentId, studentName, class, examId, examName, examType, subject, marksObtained, totalMarks, academicYear, year) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $id,
                $input['studentId'] ?? '',
                $input['studentName'] ?? '',
                $input['class'] ?? '',
                $input['examId'] ?? '',
                $input['examName'] ?? '',
                $input['examType'] ?? '',
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
            $stmt = $pdo->prepare("UPDATE marks SET studentId = ?, studentName = ?, class = ?, examId = ?, examName = ?, examType = ?, subject = ?, marksObtained = ?, totalMarks = ?, academicYear = ?, year = ? WHERE id = ?");
            $stmt->execute([
                $input['studentId'] ?? '',
                $input['studentName'] ?? '',
                $input['class'] ?? '',
                $input['examId'] ?? '',
                $input['examName'] ?? '',
                $input['examType'] ?? '',
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
