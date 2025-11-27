<?php
// Attendance handler
function handleAttendance($method, $id, $input, $pdo) {
    switch ($method) {
        case 'GET':
            // Check if date parameter is provided
            $date = isset($_GET['date']) ? $_GET['date'] : null;
            $classId = isset($_GET['classId']) ? $_GET['classId'] : null;
            $academicYear = isset($_GET['academicYear']) ? $_GET['academicYear'] : null;
            
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
            } else if ($date && $classId && $academicYear) {
                // Get attendance for specific date, class and academic year
                $stmt = $pdo->prepare("SELECT * FROM attendance WHERE date = ? AND classId = ? AND academicYear = ?");
                $stmt->execute([$date, $classId, $academicYear]);
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
            $stmt = $pdo->prepare("INSERT INTO attendance (id, date, classId, academicYear, records) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([
                $id,
                $input['date'] ?? null,
                $input['classId'] ?? '',
                $input['academicYear'] ?? '',
                json_encode($input['records'] ?? [])
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
            $stmt = $pdo->prepare("UPDATE attendance SET date = ?, classId = ?, academicYear = ?, records = ? WHERE id = ?");
            $stmt->execute([
                $input['date'] ?? null,
                $input['classId'] ?? '',
                $input['academicYear'] ?? '',
                json_encode($input['records'] ?? []),
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