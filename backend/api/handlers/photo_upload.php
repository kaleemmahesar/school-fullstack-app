<?php
// Photo Upload handler
function handlePhotoUpload($method, $id, $input, $pdo) {
    switch ($method) {
        case 'POST':
            // Handle file upload
            if (!isset($_FILES['photo'])) {
                http_response_code(400);
                echo json_encode(['error' => 'No photo file provided']);
                return;
            }
            
            $file = $_FILES['photo'];
            
            // Validate file
            if ($file['error'] !== UPLOAD_ERR_OK) {
                http_response_code(400);
                echo json_encode(['error' => 'File upload error: ' . $file['error']]);
                return;
            }
            
            // Check file size (max 5MB)
            if ($file['size'] > 5 * 1024 * 1024) {
                http_response_code(400);
                echo json_encode(['error' => 'File size exceeds 5MB limit']);
                return;
            }
            
            // Check file type
            $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!in_array($file['type'], $allowedTypes)) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid file type. Only JPEG, PNG, and GIF are allowed']);
                return;
            }
            
            // Generate unique filename
            $fileExtension = pathinfo($file['name'], PATHINFO_EXTENSION);
            $uniqueFilename = uniqid() . '_' . time() . '.' . $fileExtension;
            $uploadPath = '../uploads/' . $uniqueFilename;
            $fullPath = __DIR__ . '/../uploads/' . $uniqueFilename;
            
            // Move uploaded file
            if (move_uploaded_file($file['tmp_name'], $fullPath)) {
                // Return the URL to access the uploaded file
                $fileUrl = 'http://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['PHP_SELF']) . '/../uploads/' . $uniqueFilename;
                echo json_encode([
                    'success' => true,
                    'filename' => $uniqueFilename,
                    'url' => $fileUrl,
                    'message' => 'Photo uploaded successfully'
                ]);
            } else {
                // Set CORS headers for error responses
                header("Content-Type: application/json");
                header("Access-Control-Allow-Origin: http://localhost:5173");
                header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
                header("Access-Control-Allow-Headers: Content-Type, Authorization");
                header("Vary: Origin");
                
                http_response_code(500);
                echo json_encode(['error' => 'Failed to move uploaded file']);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
}