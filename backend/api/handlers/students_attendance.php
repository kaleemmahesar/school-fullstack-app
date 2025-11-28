<?php
// Students Attendance handler
function handleStudentsAttendance($method, $id, $input, $pdo) {
    switch ($method) {
        case 'GET':
            // Check if date parameter is provided
            $date = isset($_GET['date']) ? $_GET['date'] : null;
            $classId = isset($_GET['classId']) ? $_GET['classId'] : null;
            $section = isset($_GET['section']) ? $_GET['section'] : null;
            
            if ($id) {
                // Get specific students attendance record
                $stmt = $pdo->prepare("SELECT * FROM attendance WHERE id = ?");
                $stmt->execute([$id]);
                $attendance = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($attendance) {
                    // Decode JSON records
                    $attendance['records'] = json_decode($attendance['records'], true) ?: [];
                    echo json_encode($attendance);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Students attendance record not found']);
                }
            } else if ($date && $classId && $section) {
                // Get students attendance for specific date, class and section
                $stmt = $pdo->prepare("SELECT * FROM attendance WHERE date = ? AND classId = ? AND section = ?");
                $stmt->execute([$date, $classId, $section]);
                $attendance = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                // Decode JSON records for each attendance record
                foreach ($attendance as &$record) {
                    $record['records'] = json_decode($record['records'], true) ?: [];
                }
                
                echo json_encode($attendance);
            } else if ($date && $classId) {
                // Get students attendance for specific date and class
                $stmt = $pdo->prepare("SELECT * FROM attendance WHERE date = ? AND classId = ?");
                $stmt->execute([$date, $classId]);
                $attendance = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                // Decode JSON records for each attendance record
                foreach ($attendance as &$record) {
                    $record['records'] = json_decode($record['records'], true) ?: [];
                }
                
                echo json_encode($attendance);
            } else if ($date) {
                // Get students attendance for specific date
                $stmt = $pdo->prepare("SELECT * FROM attendance WHERE date = ?");
                $stmt->execute([$date]);
                $attendance = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                // Decode JSON records for each attendance record
                foreach ($attendance as &$record) {
                    $record['records'] = json_decode($record['records'], true) ?: [];
                }
                
                echo json_encode($attendance);
            } else {
                // Get all students attendance records
                $stmt = $pdo->query("SELECT * FROM attendance");
                $attendance = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                // Decode JSON records for each attendance record
                foreach ($attendance as &$record) {
                    $record['records'] = json_decode($record['records'], true) ?: [];
                }
                
                echo json_encode($attendance);
            }
            break;
            
        case 'POST':
            // Add new students attendance record
            $id = $input['id'] ?? uniqid();
            $stmt = $pdo->prepare("INSERT INTO attendance (id, date, classId, section, subject, academicYear, records) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $id,
                $input['date'] ?? null,
                $input['classId'] ?? '',
                $input['section'] ?? null,
                $input['subject'] ?? null,
                $input['academicYear'] ?? '',
                json_encode($input['records'] ?? [])
            ]);
            
            // Return the created students attendance record
            $stmt = $pdo->prepare("SELECT * FROM attendance WHERE id = ?");
            $stmt->execute([$id]);
            $attendance = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Decode JSON records
            $attendance['records'] = json_decode($attendance['records'], true) ?: [];
            
            echo json_encode($attendance);
            break;
            
        case 'PUT':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Students attendance ID is required']);
                return;
            }
            
            // Update students attendance record
            $stmt = $pdo->prepare("UPDATE attendance SET date = ?, classId = ?, section = ?, subject = ?, academicYear = ?, records = ? WHERE id = ?");
            $stmt->execute([
                $input['date'] ?? null,
                $input['classId'] ?? '',
                $input['section'] ?? null,
                $input['subject'] ?? null,
                $input['academicYear'] ?? '',
                json_encode($input['records'] ?? []),
                $id
            ]);
            
            // Return the updated students attendance record
            $stmt = $pdo->prepare("SELECT * FROM attendance WHERE id = ?");
            $stmt->execute([$id]);
            $attendance = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Decode JSON records
            $attendance['records'] = json_decode($attendance['records'], true) ?: [];
            
            echo json_encode($attendance);
            break;
            
        case 'DELETE':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Students attendance ID is required']);
                return;
            }
            
            // Delete students attendance record
            $stmt = $pdo->prepare("DELETE FROM attendance WHERE id = ?");
            $stmt->execute([$id]);
            
            echo json_encode(['message' => 'Students attendance record deleted successfully']);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
}
?>