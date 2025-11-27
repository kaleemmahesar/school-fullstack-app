<?php
// Notifications handler
function handleNotifications($method, $id, $input, $pdo) {
    switch ($method) {
        case 'GET':
            if ($id) {
                // Get specific notification
                $stmt = $pdo->prepare("SELECT * FROM notifications WHERE id = ?");
                $stmt->execute([$id]);
                $notification = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($notification) {
                    echo json_encode($notification);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Notification not found']);
                }
            } else {
                // Get all notifications
                $stmt = $pdo->query("SELECT * FROM notifications ORDER BY createdAt DESC");
                $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($notifications);
            }
            break;
            
        case 'POST':
            // Add new notification
            $id = $input['id'] ?? uniqid();
            $stmt = $pdo->prepare("INSERT INTO notifications (id, title, message, type, is_read, userId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $id,
                $input['title'] ?? '',
                $input['message'] ?? '',
                $input['type'] ?? 'info',
                $input['is_read'] ?? false,
                $input['userId'] ?? null,
                $input['createdAt'] ?? date('Y-m-d H:i:s'),
                $input['updatedAt'] ?? date('Y-m-d H:i:s')
            ]);
            
            // Return the created notification
            $stmt = $pdo->prepare("SELECT * FROM notifications WHERE id = ?");
            $stmt->execute([$id]);
            $notification = $stmt->fetch(PDO::FETCH_ASSOC);
            
            echo json_encode($notification);
            break;
            
        case 'PUT':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Notification ID is required']);
                return;
            }
            
            // Update notification
            $stmt = $pdo->prepare("UPDATE notifications SET title = ?, message = ?, type = ?, is_read = ?, userId = ?, updatedAt = ? WHERE id = ?");
            $stmt->execute([
                $input['title'] ?? '',
                $input['message'] ?? '',
                $input['type'] ?? 'info',
                $input['is_read'] ?? false,
                $input['userId'] ?? null,
                $input['updatedAt'] ?? date('Y-m-d H:i:s'),
                $id
            ]);
            
            // Return the updated notification
            $stmt = $pdo->prepare("SELECT * FROM notifications WHERE id = ?");
            $stmt->execute([$id]);
            $notification = $stmt->fetch(PDO::FETCH_ASSOC);
            
            echo json_encode($notification);
            break;
            
        case 'DELETE':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Notification ID is required']);
                return;
            }
            
            // Delete notification
            $stmt = $pdo->prepare("DELETE FROM notifications WHERE id = ?");
            $stmt->execute([$id]);
            
            echo json_encode(['message' => 'Notification deleted successfully']);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
}