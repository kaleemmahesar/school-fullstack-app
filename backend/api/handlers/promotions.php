<?php
// Promotions handler
function handlePromotions($method, $id, $input, $pdo) {
    switch ($method) {
        case 'GET':
            if ($id) {
                // Get specific promotion
                $stmt = $pdo->prepare("SELECT * FROM promotions WHERE id = ?");
                $stmt->execute([$id]);
                $promotion = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($promotion) {
                    // Convert numeric fields to proper numbers
                    $promotion = convertFieldsToNumbers($promotion, ['fromClass', 'toClass', 'promotedStudents', 'totalStudents']);
                    echo json_encode($promotion);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Promotion not found']);
                }
            } else {
                // Get all promotions
                $stmt = $pdo->query("SELECT * FROM promotions");
                $promotions = $stmt->fetchAll(PDO::FETCH_ASSOC);
                // Convert numeric fields to proper numbers
                foreach ($promotions as &$promotion) {
                    $promotion = convertFieldsToNumbers($promotion, ['fromClass', 'toClass', 'promotedStudents', 'totalStudents']);
                }
                echo json_encode($promotions);
            }
            break;
            
        case 'POST':
            // Add new promotion
            $id = $input['id'] ?? uniqid();
            $stmt = $pdo->prepare("INSERT INTO promotions (id, fromClass, toClass, academicYear, status, promotedStudents, totalStudents) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $id,
                $input['fromClass'] ?? 0,
                $input['toClass'] ?? 0,
                $input['academicYear'] ?? '',
                $input['status'] ?? 'pending',
                $input['promotedStudents'] ?? 0,
                $input['totalStudents'] ?? 0
            ]);
            
            // Return the created promotion
            $stmt = $pdo->prepare("SELECT * FROM promotions WHERE id = ?");
            $stmt->execute([$id]);
            $promotion = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Convert numeric fields to proper numbers
            $promotion = convertFieldsToNumbers($promotion, ['fromClass', 'toClass', 'promotedStudents', 'totalStudents']);
            
            echo json_encode($promotion);
            break;
            
        case 'PUT':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Promotion ID is required']);
                return;
            }
            
            // Update promotion
            $stmt = $pdo->prepare("UPDATE promotions SET fromClass = ?, toClass = ?, academicYear = ?, status = ?, promotedStudents = ?, totalStudents = ? WHERE id = ?");
            $stmt->execute([
                $input['fromClass'] ?? 0,
                $input['toClass'] ?? 0,
                $input['academicYear'] ?? '',
                $input['status'] ?? 'pending',
                $input['promotedStudents'] ?? 0,
                $input['totalStudents'] ?? 0,
                $id
            ]);
            
            // Return the updated promotion
            $stmt = $pdo->prepare("SELECT * FROM promotions WHERE id = ?");
            $stmt->execute([$id]);
            $promotion = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Convert numeric fields to proper numbers
            $promotion = convertFieldsToNumbers($promotion, ['fromClass', 'toClass', 'promotedStudents', 'totalStudents']);
            
            echo json_encode($promotion);
            break;
            
        case 'DELETE':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Promotion ID is required']);
                return;
            }
            
            // Delete promotion
            $stmt = $pdo->prepare("DELETE FROM promotions WHERE id = ?");
            $stmt->execute([$id]);
            
            echo json_encode(['message' => 'Promotion deleted successfully']);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
}