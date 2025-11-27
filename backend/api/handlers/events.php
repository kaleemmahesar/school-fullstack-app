<?php
// Events handler
function handleEvents($method, $id, $input, $pdo) {
    switch ($method) {
        case 'GET':
            if ($id) {
                // Get specific event
                $stmt = $pdo->prepare("SELECT * FROM events WHERE id = ?");
                $stmt->execute([$id]);
                $event = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($event) {
                    // Convert date fields to proper format
                    $event['date'] = $event['date'] ? date('Y-m-d H:i:s', strtotime($event['date'])) : null;
                    echo json_encode($event);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Event not found']);
                }
            } else {
                // Get all events
                $stmt = $pdo->query("SELECT * FROM events ORDER BY date DESC");
                $events = $stmt->fetchAll(PDO::FETCH_ASSOC);
                // Convert date fields to proper format
                foreach ($events as &$event) {
                    $event['date'] = $event['date'] ? date('Y-m-d H:i:s', strtotime($event['date'])) : null;
                }
                echo json_encode($events);
            }
            break;
            
        case 'POST':
            // Add new event
            $id = $input['id'] ?? uniqid();
            $stmt = $pdo->prepare("INSERT INTO events (id, title, description, date, startTime, endTime, type) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $id,
                $input['title'] ?? '',
                $input['description'] ?? '',
                $input['date'] ?? null,
                $input['startTime'] ?? null,
                $input['endTime'] ?? null,
                $input['type'] ?? 'event'
            ]);
            
            // Return the created event
            $stmt = $pdo->prepare("SELECT * FROM events WHERE id = ?");
            $stmt->execute([$id]);
            $event = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Convert date fields to proper format
            $event['date'] = $event['date'] ? date('Y-m-d H:i:s', strtotime($event['date'])) : null;
            
            echo json_encode($event);
            break;
            
        case 'PUT':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Event ID is required']);
                return;
            }
            
            // Update event
            $stmt = $pdo->prepare("UPDATE events SET title = ?, description = ?, date = ?, startTime = ?, endTime = ?, type = ? WHERE id = ?");
            $stmt->execute([
                $input['title'] ?? '',
                $input['description'] ?? '',
                $input['date'] ?? null,
                $input['startTime'] ?? null,
                $input['endTime'] ?? null,
                $input['type'] ?? 'event',
                $id
            ]);
            
            // Return the updated event
            $stmt = $pdo->prepare("SELECT * FROM events WHERE id = ?");
            $stmt->execute([$id]);
            $event = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Convert date fields to proper format
            $event['date'] = $event['date'] ? date('Y-m-d H:i:s', strtotime($event['date'])) : null;
            
            echo json_encode($event);
            break;
            
        case 'DELETE':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Event ID is required']);
                return;
            }
            
            // Delete event
            $stmt = $pdo->prepare("DELETE FROM events WHERE id = ?");
            $stmt->execute([$id]);
            
            echo json_encode(['message' => 'Event deleted successfully']);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
}