<?php
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
                    // Decode the records JSON
                    $attendance['records'] = json_decode($attendance['records'], true);
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
                // Decode the records JSON for each record
                foreach ($attendance as &$record) {
                    $record['records'] = json_decode($record['records'], true);
                }
                echo json_encode($attendance);
            } else {
                // Get all staff attendance records
                $stmt = $pdo->query("SELECT * FROM staff_attendance");
                $attendance = $stmt->fetchAll(PDO::FETCH_ASSOC);
                // Decode the records JSON for each record
                foreach ($attendance as &$record) {
                    $record['records'] = json_decode($record['records'], true);
                }
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
            // Decode the records JSON
            $attendance['records'] = json_decode($attendance['records'], true);
            
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
            // Decode the records JSON
            $attendance['records'] = json_decode($attendance['records'], true);
            
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