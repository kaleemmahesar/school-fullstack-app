<?php
// Test photo upload endpoint with detailed debugging

// Set CORS headers
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Debug information
error_log("=== Photo Upload Debug ===");
error_log("FILES array: " . print_r($_FILES, true));
error_log("POST array: " . print_r($_POST, true));

// Check if photo file is provided
if (!isset($_FILES['photo'])) {
    error_log("No photo file provided");
    http_response_code(400);
    echo json_encode(['error' => 'No photo file provided']);
    exit;
}

$file = $_FILES['photo'];
error_log("File info: " . print_r($file, true));

// Validate file
if ($file['error'] !== UPLOAD_ERR_OK) {
    error_log("File upload error: " . $file['error']);
    http_response_code(400);
    echo json_encode(['error' => 'File upload error: ' . $file['error']]);
    exit;
}

// Check file size (max 5MB)
if ($file['size'] > 5 * 1024 * 1024) {
    error_log("File size exceeds 5MB limit: " . $file['size']);
    http_response_code(400);
    echo json_encode(['error' => 'File size exceeds 5MB limit']);
    exit;
}

// Check file type
$allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
if (!in_array($file['type'], $allowedTypes)) {
    error_log("Invalid file type: " . $file['type']);
    http_response_code(400);
    echo json_encode(['error' => 'Invalid file type. Only JPEG, PNG, and GIF are allowed']);
    exit;
}

// Generate unique filename
$fileExtension = pathinfo($file['name'], PATHINFO_EXTENSION);
$uniqueFilename = uniqid() . '_' . time() . '.' . $fileExtension;
$uploadPath = 'uploads/' . $uniqueFilename;
$fullPath = __DIR__ . '/' . $uploadPath;

error_log("Upload path: " . $fullPath);
error_log("Upload directory writable: " . (is_writable(__DIR__ . '/uploads') ? 'Yes' : 'No'));

// Move uploaded file
if (move_uploaded_file($file['tmp_name'], $fullPath)) {
    error_log("File moved successfully to: " . $fullPath);
    // Return the URL to access the uploaded file
    $fileUrl = 'http://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['PHP_SELF']) . '/' . $uploadPath;
    echo json_encode([
        'success' => true,
        'filename' => $uniqueFilename,
        'url' => $fileUrl,
        'message' => 'Photo uploaded successfully'
    ]);
} else {
    error_log("Failed to move uploaded file");
    error_log("Source: " . $file['tmp_name']);
    error_log("Destination: " . $fullPath);
    http_response_code(500);
    echo json_encode(['error' => 'Failed to move uploaded file']);
}
?>