<?php
// Subsidies handler
function handleSubsidies($method, $id, $input, $pdo) {
    switch ($method) {
        case 'GET':
            if ($id) {
                // Get specific subsidy
                $stmt = $pdo->prepare("SELECT * FROM subsidies WHERE id = ?");
                $stmt->execute([$id]);
                $subsidy = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($subsidy) {
                    // Convert numeric fields to proper numbers
                    $subsidy = convertFieldsToNumbers($subsidy, ['amount']);
                    echo json_encode($subsidy);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Subsidy not found']);
                }
            } else {
                // Get all subsidies
                $stmt = $pdo->query("SELECT * FROM subsidies");
                $subsidies = $stmt->fetchAll(PDO::FETCH_ASSOC);
                // Convert numeric fields to proper numbers
                foreach ($subsidies as &$subsidy) {
                    $subsidy = convertFieldsToNumbers($subsidy, ['amount']);
                }
                echo json_encode($subsidies);
            }
            break;
            
        case 'POST':
            // Add new subsidy
            $id = $input['id'] ?? uniqid();
            $stmt = $pdo->prepare("INSERT INTO subsidies (id, quarter, year, amount, ngoName, description, receivedDate, expectedDate, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $id,
                $input['quarter'] ?? '',
                $input['year'] ?? 0,
                $input['amount'] ?? 0,
                $input['ngoName'] ?? '',
                $input['description'] ?? '',
                $input['receivedDate'] ?? null,
                $input['expectedDate'] ?? null,
                $input['status'] ?? 'expected'
            ]);
            
            // Return the created subsidy
            $stmt = $pdo->prepare("SELECT * FROM subsidies WHERE id = ?");
            $stmt->execute([$id]);
            $subsidy = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Convert numeric fields to proper numbers
            $subsidy = convertFieldsToNumbers($subsidy, ['amount']);
            
            echo json_encode($subsidy);
            break;
            
        case 'PUT':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Subsidy ID is required']);
                return;
            }
            
            // Update subsidy
            $stmt = $pdo->prepare("UPDATE subsidies SET quarter = ?, year = ?, amount = ?, ngoName = ?, description = ?, receivedDate = ?, expectedDate = ?, status = ? WHERE id = ?");
            $stmt->execute([
                $input['quarter'] ?? '',
                $input['year'] ?? 0,
                $input['amount'] ?? 0,
                $input['ngoName'] ?? '',
                $input['description'] ?? '',
                $input['receivedDate'] ?? null,
                $input['expectedDate'] ?? null,
                $input['status'] ?? 'expected',
                $id
            ]);
            
            // Return the updated subsidy
            $stmt = $pdo->prepare("SELECT * FROM subsidies WHERE id = ?");
            $stmt->execute([$id]);
            $subsidy = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Convert numeric fields to proper numbers
            $subsidy = convertFieldsToNumbers($subsidy, ['amount']);
            
            echo json_encode($subsidy);
            break;
            
        case 'DELETE':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Subsidy ID is required']);
                return;
            }
            
            // Delete subsidy
            $stmt = $pdo->prepare("DELETE FROM subsidies WHERE id = ?");
            $stmt->execute([$id]);
            
            echo json_encode(['message' => 'Subsidy deleted successfully']);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
}