<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Test data
$testStudent = [
    'grNo' => '2807',
    'firstName' => 'Aadil',
    'lastName' => 'Chandio',
    'fatherName' => 'Munawar Ali',
    'religion' => 'Islam',
    'address' => 'Larkana',
    'dateOfBirth' => '2017-08-09',
    'birthPlace' => 'Larkana',
    'parentContact' => '03002415234',
    'dateOfAdmission' => '2025-12-12',
    'class' => 'Class 9',
    'section' => 'C',
    'lastSchoolAttended' => '',
    'status' => 'Fresh',
    'academicYear' => '2025-2026'
];

// Convert to JSON
$jsonData = json_encode($testStudent);

// Initialize cURL
$ch = curl_init();

// Set cURL options
curl_setopt($ch, CURLOPT_URL, 'http://localhost/school-app/backend/api.php?endpoint=students');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonData);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Content-Length: ' . strlen($jsonData)
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

// Execute the request
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);

// Close cURL
curl_close($ch);

// Output results
echo "HTTP Code: " . $httpCode . "\n";
echo "Response: " . $response . "\n";
if ($error) {
    echo "cURL Error: " . $error . "\n";
}
?>