<?php
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
                    $stmt = $pdo->prepare("SELECT id, student_id, month, amount, discountAmount, discountReason, discountedAmount, paid, date, dueDate, status, type, academicYear, paymentTimestamp, generationTimestamp, paymentMethod, fineAmount, description, created_at FROM fees_history WHERE student_id = ? ORDER BY created_at DESC");
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
                    $stmt = $pdo->prepare("SELECT id, student_id, month, amount, discountAmount, discountReason, discountedAmount, paid, date, dueDate, status, type, academicYear, paymentTimestamp, generationTimestamp, paymentMethod, fineAmount, description, created_at FROM fees_history WHERE student_id = ? ORDER BY created_at DESC");
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
            // Check if input data is valid
            if (!$input || !is_array($input)) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid input data']);
                return;
            }
            
            try {
                // Add new student
                // Let the database generate the auto-incrementing ID
                $stmt = $pdo->prepare("INSERT INTO students (photo, grNo, firstName, lastName, fatherName, religion, address, dateOfBirth, birthPlace, lastSchoolAttended, dateOfAdmission, class, section, monthlyFees, admissionFees, feesPaid, totalFees, familyId, relationship, parentId, parentContact, status, academicYear, admissionTimestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                
                $result = $stmt->execute([
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
                    $input['parentContact'] ?? '',
                    $input['status'] ?? 'studying',
                    $input['academicYear'] ?? '',
                    $input['admissionTimestamp'] ?? date('Y-m-d H:i:s')
                ]);
                
                if (!$result) {
                    http_response_code(500);
                    echo json_encode(['error' => 'Failed to insert student into database', 'details' => $stmt->errorInfo()]);
                    return;
                }
                
                // Get the auto-generated ID
                $id = $pdo->lastInsertId();
                
                // If fees history is provided, insert it
                if (isset($input['feesHistory']) && is_array($input['feesHistory'])) {
                    foreach ($input['feesHistory'] as $fee) {
                        $feeId = $fee['id'] ?? uniqid('challan-');
                        $stmt = $pdo->prepare("INSERT INTO fees_history (id, student_id, month, amount, discountAmount, discountReason, discountedAmount, paid, date, dueDate, status, type, academicYear, paymentTimestamp, generationTimestamp, paymentMethod, fineAmount, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                        $stmt->execute([
                            $feeId,
                            $id,
                            $fee['month'] ?? '',
                            $fee['amount'] ?? 0,
                            $fee['discountAmount'] ?? 0,
                            $fee['discountReason'] ?? '',
                            $fee['discountedAmount'] ?? 0,
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
                $stmt = $pdo->prepare("SELECT id, student_id, month, amount, discountAmount, discountReason, discountedAmount, paid, date, dueDate, status, type, academicYear, paymentTimestamp, generationTimestamp, paymentMethod, fineAmount, description, created_at FROM fees_history WHERE student_id = ? ORDER BY created_at DESC");
                $stmt->execute([$id]);
                $feesHistory = $stmt->fetchAll(PDO::FETCH_ASSOC);
                $student['feesHistory'] = $feesHistory;
                
                // Format the student data to ensure proper data types
                $student = formatStudentData($student);
                
                echo json_encode($student);
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Database error occurred while adding student', 'message' => $e->getMessage()]);
            }
            break;
            
        case 'PUT':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Student ID is required']);
                return;
            }
            
            // Check if student is being graduated (status changing to passed_out and moving to graduate batch)
            $stmt = $pdo->prepare("SELECT * FROM students WHERE id = ?");
            $stmt->execute([$id]);
            $oldStudent = $stmt->fetch(PDO::FETCH_ASSOC);
            
            $isBeingGraduated = ($oldStudent['status'] !== 'passed_out' && $input['status'] === 'passed_out');
            $isMovingToGraduateBatch = (strpos($input['academicYear'] ?? '', 'Graduates') !== false);
            
            // If student is being graduated and moved to a graduate batch, create the graduate batch if needed
            if ($isBeingGraduated && $isMovingToGraduateBatch) {
                $graduateBatchName = $input['academicYear'];
                
                // Check if graduate batch already exists
                $stmt = $pdo->prepare("SELECT * FROM batches WHERE name = ?");
                $stmt->execute([$graduateBatchName]);
                $existingBatch = $stmt->fetch(PDO::FETCH_ASSOC);
                
                // If graduate batch doesn't exist, create it
                if (!$existingBatch) {
                    // Extract year from graduate batch name (e.g., "2025 Graduates" -> "2025")
                    $year = explode(' ', $graduateBatchName)[0];
                    $batchId = uniqid('batch-');
                    $startDate = "{$year}-09-01";
                    $endDate = ($year + 1) . "-06-30";
                    
                    $stmt = $pdo->prepare("INSERT INTO batches (id, name, startDate, endDate, status, classes, sections) VALUES (?, ?, ?, ?, ?, ?, ?)");
                    $stmt->execute([
                        $batchId,
                        $graduateBatchName,
                        $startDate,
                        $endDate,
                        'completed', // Mark as completed since these are graduates
                        json_encode([]), // Empty classes for graduate batches
                        json_encode([])  // Empty sections for graduate batches
                    ]);
                }
            }
            
            // Update student
            $stmt = $pdo->prepare("UPDATE students SET photo = ?, grNo = ?, firstName = ?, lastName = ?, fatherName = ?, religion = ?, address = ?, dateOfBirth = ?, birthPlace = ?, lastSchoolAttended = ?, dateOfAdmission = ?, class = ?, section = ?, dateOfLeaving = ?, classInWhichLeft = ?, reasonOfLeaving = ?, remarks = ?, monthlyFees = ?, admissionFees = ?, feesPaid = ?, totalFees = ?, familyId = ?, relationship = ?, parentId = ?, parentContact = ?, status = ?, academicYear = ? WHERE id = ?");
            
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
                $input['parentContact'] ?? '',
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
                    $stmt = $pdo->prepare("INSERT INTO fees_history (id, student_id, month, amount, discountAmount, discountReason, discountedAmount, paid, date, dueDate, status, type, academicYear, paymentTimestamp, generationTimestamp, paymentMethod, fineAmount, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                    $stmt->execute([
                        $fee['id'] ?? uniqid('challan-'), // Use existing ID or generate new one
                        $id,
                        $fee['month'] ?? '',
                        $fee['amount'] ?? 0,
                        $fee['discountAmount'] ?? 0,
                        $fee['discountReason'] ?? '',
                        $fee['discountedAmount'] ?? 0,
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
            $stmt = $pdo->prepare("SELECT id, student_id, month, amount, discountAmount, discountReason, discountedAmount, paid, date, dueDate, status, type, academicYear, paymentTimestamp, generationTimestamp, paymentMethod, fineAmount, description, created_at FROM fees_history WHERE student_id = ? ORDER BY created_at DESC");
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