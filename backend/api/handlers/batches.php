<?php
// Batches handler
function handleBatches($method, $id, $input, $pdo) {
    switch ($method) {
        case 'GET':
            if ($id) {
                // Get specific batch
                $stmt = $pdo->prepare("SELECT * FROM batches WHERE id = ?");
                $stmt->execute([$id]);
                $batch = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($batch) {
                    // Convert numeric fields to proper numbers
                    $batch = convertFieldsToNumbers($batch, ['capacity']);
                    echo json_encode($batch);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Batch not found']);
                }
            } else {
                // Get all batches
                $stmt = $pdo->query("SELECT * FROM batches");
                $batches = $stmt->fetchAll(PDO::FETCH_ASSOC);
                // Convert numeric fields to proper numbers
                foreach ($batches as &$batch) {
                    $batch = convertFieldsToNumbers($batch, ['capacity']);
                }
                echo json_encode($batches);
            }
            break;
            
        case 'POST':
            // Add new batch
            $id = $input['id'] ?? uniqid();
            $stmt = $pdo->prepare("INSERT INTO batches (id, name, startDate, endDate, status, classes, sections) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $id,
                $input['name'] ?? '',
                $input['startDate'] ?? null,
                $input['endDate'] ?? null,
                $input['status'] ?? 'active',
                json_encode($input['classes'] ?? []),
                json_encode($input['sections'] ?? [])
            ]);
            
            // Return the created batch
            $stmt = $pdo->prepare("SELECT * FROM batches WHERE id = ?");
            $stmt->execute([$id]);
            $batch = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Convert numeric fields to proper numbers
            $batch = convertFieldsToNumbers($batch, ['capacity']);
            
            echo json_encode($batch);
            break;
            
        case 'PUT':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Batch ID is required']);
                return;
            }
            
            // Update batch
            $stmt = $pdo->prepare("UPDATE batches SET name = ?, startDate = ?, endDate = ?, status = ?, classes = ?, sections = ? WHERE id = ?");
            $stmt->execute([
                $input['name'] ?? '',
                $input['startDate'] ?? null,
                $input['endDate'] ?? null,
                $input['status'] ?? 'active',
                json_encode($input['classes'] ?? []),
                json_encode($input['sections'] ?? []),
                $id
            ]);
            
            // Return the updated batch
            $stmt = $pdo->prepare("SELECT * FROM batches WHERE id = ?");
            $stmt->execute([$id]);
            $batch = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Convert numeric fields to proper numbers
            $batch = convertFieldsToNumbers($batch, ['capacity']);
            
            echo json_encode($batch);
            break;
            
        case 'DELETE':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Batch ID is required']);
                return;
            }
            
            // Delete batch
            $stmt = $pdo->prepare("DELETE FROM batches WHERE id = ?");
            $stmt->execute([$id]);
            
            echo json_encode(['message' => 'Batch deleted successfully']);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
}