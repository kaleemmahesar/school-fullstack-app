<?php
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