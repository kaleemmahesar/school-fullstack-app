<?php
// Photo Upload handler
function handlePhotoUpload($method, $id, $input, $pdo) {
    // Set CORS headers
    header("Access-Control-Allow-Origin: http://localhost:5173");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    header("Vary: Origin");
    header("Content-Type: application/json");
    
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
            
            // Generate unique filename without spaces or special characters
            $fileExtension = pathinfo($file['name'], PATHINFO_EXTENSION);
            $uniqueFilename = uniqid() . '_' . time() . '.' . $fileExtension;
            // Remove any spaces and special characters from filename
            $uniqueFilename = preg_replace('/[^A-Za-z0-9._-]/', '', $uniqueFilename);
            
            // Ensure uploads directory exists with proper permissions
            // Correct path: c:\xampp\htdocs\school-app\backend\uploads
            $uploadsDir = __DIR__ . '/../../uploads';
            if (!is_dir($uploadsDir)) {
                if (!mkdir($uploadsDir, 0755, true)) {
                    http_response_code(500);
                    echo json_encode(['error' => 'Failed to create uploads directory']);
                    return;
                }
            }
            
            // Set proper permissions if needed
            if (!is_writable($uploadsDir)) {
                if (!chmod($uploadsDir, 0755)) {
                    error_log("Failed to set permissions on uploads directory");
                }
            }
            
            $fullPath = $uploadsDir . '/' . $uniqueFilename;
            
            // Log upload details for debugging
            error_log("Attempting to upload file: " . $file['name']);
            error_log("File size: " . $file['size']);
            error_log("File type: " . $file['type']);
            error_log("Target path: " . $fullPath);
            error_log("Uploads directory writable: " . (is_writable($uploadsDir) ? 'Yes' : 'No'));
            
            // Move uploaded file
            if (move_uploaded_file($file['tmp_name'], $fullPath)) {
                // Verify file was actually moved
                if (file_exists($fullPath)) {
                    // Return the correct URL to access the uploaded file
                    // The uploads directory is directly under the backend directory
                    $fileUrl = 'http://' . $_SERVER['HTTP_HOST'] . '/school-app/backend/uploads/' . $uniqueFilename;
                    echo json_encode([
                        'success' => true,
                        'filename' => $uniqueFilename,
                        'url' => $fileUrl,
                        'message' => 'Photo uploaded successfully'
                    ]);
                } else {
                    http_response_code(500);
                    echo json_encode(['error' => 'File was not saved to target location']);
                }
            } else {
                // Get more detailed error information
                $error = error_get_last();
                error_log("Failed to move uploaded file. Error: " . ($error ? $error['message'] : 'Unknown error'));
                http_response_code(500);
                echo json_encode(['error' => 'Failed to move uploaded file: ' . ($error ? $error['message'] : 'Unknown error')]);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
}
?>