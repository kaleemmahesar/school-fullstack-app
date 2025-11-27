<?php
// Alumni handler
function handleAlumni($method, $id, $input, $pdo) {
    switch ($method) {
        case 'GET':
            if ($id) {
                // Get specific alumni
                $stmt = $pdo->prepare("SELECT * FROM alumni WHERE id = ?");
                $stmt->execute([$id]);
                $alumnus = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($alumnus) {
                    // Convert numeric fields to proper numbers
                    $alumnus = convertFieldsToNumbers($alumnus, ['graduationYear']);
                    echo json_encode($alumnus);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Alumnus not found']);
                }
            } else {
                // Get all alumni
                $stmt = $pdo->query("SELECT * FROM alumni");
                $alumni = $stmt->fetchAll(PDO::FETCH_ASSOC);
                // Convert numeric fields to proper numbers
                foreach ($alumni as &$alumnus) {
                    $alumnus = convertFieldsToNumbers($alumnus, ['graduationYear']);
                }
                echo json_encode($alumni);
            }
            break;
            
        case 'POST':
            // Add new alumnus
            $id = $input['id'] ?? uniqid();
            $stmt = $pdo->prepare("INSERT INTO alumni (id, firstName, lastName, fatherName, grNo, class, section, graduationYear, contactNumber, email, address, profession, companyName, achievements, linkedIn, facebook, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $id,
                $input['firstName'] ?? '',
                $input['lastName'] ?? '',
                $input['fatherName'] ?? '',
                $input['grNo'] ?? '',
                $input['class'] ?? '',
                $input['section'] ?? '',
                $input['graduationYear'] ?? 0,
                $input['contactNumber'] ?? '',
                $input['email'] ?? '',
                $input['address'] ?? '',
                $input['profession'] ?? '',
                $input['companyName'] ?? '',
                $input['achievements'] ?? '',
                $input['linkedIn'] ?? '',
                $input['facebook'] ?? '',
                $input['status'] ?? 'active',
                $input['notes'] ?? ''
            ]);
            
            // Return the created alumnus
            $stmt = $pdo->prepare("SELECT * FROM alumni WHERE id = ?");
            $stmt->execute([$id]);
            $alumnus = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Convert numeric fields to proper numbers
            $alumnus = convertFieldsToNumbers($alumnus, ['graduationYear']);
            
            echo json_encode($alumnus);
            break;
            
        case 'PUT':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Alumnus ID is required']);
                return;
            }
            
            // Update alumnus
            $stmt = $pdo->prepare("UPDATE alumni SET firstName = ?, lastName = ?, fatherName = ?, grNo = ?, class = ?, section = ?, graduationYear = ?, contactNumber = ?, email = ?, address = ?, profession = ?, companyName = ?, achievements = ?, linkedIn = ?, facebook = ?, status = ?, notes = ? WHERE id = ?");
            $stmt->execute([
                $input['firstName'] ?? '',
                $input['lastName'] ?? '',
                $input['fatherName'] ?? '',
                $input['grNo'] ?? '',
                $input['class'] ?? '',
                $input['section'] ?? '',
                $input['graduationYear'] ?? 0,
                $input['contactNumber'] ?? '',
                $input['email'] ?? '',
                $input['address'] ?? '',
                $input['profession'] ?? '',
                $input['companyName'] ?? '',
                $input['achievements'] ?? '',
                $input['linkedIn'] ?? '',
                $input['facebook'] ?? '',
                $input['status'] ?? 'active',
                $input['notes'] ?? '',
                $id
            ]);
            
            // Return the updated alumnus
            $stmt = $pdo->prepare("SELECT * FROM alumni WHERE id = ?");
            $stmt->execute([$id]);
            $alumnus = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Convert numeric fields to proper numbers
            $alumnus = convertFieldsToNumbers($alumnus, ['graduationYear']);
            
            echo json_encode($alumnus);
            break;
            
        case 'DELETE':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Alumnus ID is required']);
                return;
            }
            
            // Delete alumnus
            $stmt = $pdo->prepare("DELETE FROM alumni WHERE id = ?");
            $stmt->execute([$id]);
            
            echo json_encode(['message' => 'Alumnus deleted successfully']);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
}