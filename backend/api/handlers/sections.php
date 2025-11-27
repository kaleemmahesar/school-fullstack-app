<?php
// Sections handler
function handleSections($method, $id, $input, $pdo) {
    switch ($method) {
        case 'GET':
            if ($id) {
                // Get specific section
                $stmt = $pdo->prepare("SELECT * FROM sections WHERE id = ?");
                $stmt->execute([$id]);
                $section = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($section) {
                    echo json_encode($section);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Section not found']);
                }
            } else {
                // Check if class_id parameter is provided
                $classId = isset($_GET['classId']) ? $_GET['classId'] : null;
                
                if ($classId) {
                    // Get sections for specific class
                    $stmt = $pdo->prepare("SELECT * FROM sections WHERE class_id = ?");
                    $stmt->execute([$classId]);
                    $sections = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    echo json_encode($sections);
                } else {
                    // Get all sections
                    $stmt = $pdo->query("SELECT * FROM sections");
                    $sections = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    echo json_encode($sections);
                }
            }
            break;
            
        case 'POST':
            // Add new section
            $id = $input['id'] ?? uniqid();
            $stmt = $pdo->prepare("INSERT INTO sections (id, class_id, name) VALUES (?, ?, ?)");
            $stmt->execute([
                $id,
                $input['class_id'] ?? '',
                $input['name'] ?? ''
            ]);
            
            // Return the created section
            $stmt = $pdo->prepare("SELECT * FROM sections WHERE id = ?");
            $stmt->execute([$id]);
            $section = $stmt->fetch(PDO::FETCH_ASSOC);
            
            echo json_encode($section);
            break;
            
        case 'PUT':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Section ID is required']);
                return;
            }
            
            // Update section
            $stmt = $pdo->prepare("UPDATE sections SET class_id = ?, name = ? WHERE id = ?");
            $stmt->execute([
                $input['class_id'] ?? '',
                $input['name'] ?? '',
                $id
            ]);
            
            // Return the updated section
            $stmt = $pdo->prepare("SELECT * FROM sections WHERE id = ?");
            $stmt->execute([$id]);
            $section = $stmt->fetch(PDO::FETCH_ASSOC);
            
            echo json_encode($section);
            break;
            
        case 'DELETE':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Section ID is required']);
                return;
            }
            
            // Delete section
            $stmt = $pdo->prepare("DELETE FROM sections WHERE id = ?");
            $stmt->execute([$id]);
            
            echo json_encode(['message' => 'Section deleted successfully']);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
}