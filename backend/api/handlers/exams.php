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
                    
                    // Decode subjects JSON if present
                    if (isset($exam['subjects']) && $exam['subjects']) {
                        $decodedSubjects = json_decode($exam['subjects'], true);
                        if ($decodedSubjects !== null) {
                            $exam['subjects'] = $decodedSubjects;
                        }
                    }
                    
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
                    
                    // Decode subjects JSON if present
                    if (isset($exam['subjects']) && $exam['subjects']) {
                        $decodedSubjects = json_decode($exam['subjects'], true);
                        if ($decodedSubjects !== null) {
                            $exam['subjects'] = $decodedSubjects;
                        }
                    }
                }
                echo json_encode($exams);
            }
            break;
            
        case 'POST':
            // Add new exam
            $id = $input['id'] ?? uniqid();
            
            // Handle subjects data as JSON
            $subjectsJson = null;
            if (isset($input['subjects']) && is_array($input['subjects'])) {
                $subjectsJson = json_encode($input['subjects']);
            }
            
            // For individual subject exams, use the subject field
            $subject = $input['subject'] ?? '';
            // For multi-subject exams, we can use examType in the name or leave subject empty
            if (isset($input['examType']) && $input['examType']) {
                $subject = ''; // Leave subject empty for multi-subject exams
            }
            
            // Prepare INSERT statement
            $stmt = $pdo->prepare("INSERT INTO exams (id, name, examType, class, startDate, endDate, subject, date, totalMarks, subjects, academicYear) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $result = $stmt->execute([
                $id,
                $input['name'] ?? '',
                $input['examType'] ?? '',
                $input['class'] ?? '',
                $input['startDate'] ?? null,
                $input['endDate'] ?? null,
                $subject, // Use subject field appropriately
                $input['date'] ?? null,
                $input['totalMarks'] ?? 0,
                $subjectsJson,
                $input['academicYear'] ?? ''
            ]);
            
            if (!$result) {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to insert exam into database']);
                return;
            }
            
            // Return the created exam
            $stmt = $pdo->prepare("SELECT * FROM exams WHERE id = ?");
            $stmt->execute([$id]);
            $exam = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$exam) {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to retrieve created exam']);
                return;
            }
            
            // Convert numeric fields to proper numbers
            $exam = convertFieldsToNumbers($exam, ['totalMarks']);
            
            // Decode subjects JSON if present
            if (isset($exam['subjects']) && $exam['subjects']) {
                $decodedSubjects = json_decode($exam['subjects'], true);
                if ($decodedSubjects !== null) {
                    $exam['subjects'] = $decodedSubjects;
                }
            }
            
            echo json_encode($exam);
            break;
            
        case 'PUT':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Exam ID is required']);
                return;
            }
            
            // Handle subjects data as JSON
            $subjectsJson = null;
            if (isset($input['subjects']) && is_array($input['subjects'])) {
                $subjectsJson = json_encode($input['subjects']);
            }
            
            // For individual subject exams, use the subject field
            $subject = $input['subject'] ?? '';
            // For multi-subject exams, we can use examType in the name or leave subject empty
            if (isset($input['examType']) && $input['examType']) {
                $subject = ''; // Leave subject empty for multi-subject exams
            }
            
            // Update exam
            $stmt = $pdo->prepare("UPDATE exams SET name = ?, examType = ?, class = ?, startDate = ?, endDate = ?, subject = ?, date = ?, totalMarks = ?, subjects = ?, academicYear = ? WHERE id = ?");
            $result = $stmt->execute([
                $input['name'] ?? '',
                $input['examType'] ?? '',
                $input['class'] ?? '',
                $input['startDate'] ?? null,
                $input['endDate'] ?? null,
                $subject, // Use subject field appropriately
                $input['date'] ?? null,
                $input['totalMarks'] ?? 0,
                $subjectsJson,
                $input['academicYear'] ?? '',
                $id
            ]);
            
            if (!$result) {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to update exam in database']);
                return;
            }
            
            // Return the updated exam
            $stmt = $pdo->prepare("SELECT * FROM exams WHERE id = ?");
            $stmt->execute([$id]);
            $exam = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$exam) {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to retrieve updated exam']);
                return;
            }
            
            // Convert numeric fields to proper numbers
            $exam = convertFieldsToNumbers($exam, ['totalMarks']);
            
            // Decode subjects JSON if present
            if (isset($exam['subjects']) && $exam['subjects']) {
                $decodedSubjects = json_decode($exam['subjects'], true);
                if ($decodedSubjects !== null) {
                    $exam['subjects'] = $decodedSubjects;
                }
            }
            
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
            $result = $stmt->execute([$id]);
            
            if (!$result) {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to delete exam from database']);
                return;
            }
            
            echo json_encode(['message' => 'Exam deleted successfully']);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
}
?>