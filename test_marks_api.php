<?php
// Test the marks API endpoint
$url = 'http://localhost/school-app/backend/api.php?endpoint=marks';
echo "Testing marks API endpoint: $url\n";

// Use cURL to fetch the data
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Status Code: $httpCode\n";
echo "Response:\n";
echo $response . "\n";

// Try to decode JSON
$data = json_decode($response, true);
if ($data) {
    echo "Parsed JSON data:\n";
    echo "Total marks records: " . count($data) . "\n";
    
    // Find marks for student 4825
    $student4825Marks = array_filter($data, function($mark) {
        return isset($mark['studentId']) && $mark['studentId'] == 4825;
    });
    
    echo "Marks for student 4825:\n";
    foreach ($student4825Marks as $mark) {
        echo "- Subject: " . ($mark['subject'] ?? 'N/A') . 
             ", Obtained: " . ($mark['marksObtained'] ?? 'N/A') . 
             ", Total: " . ($mark['totalMarks'] ?? 'N/A') . 
             ", Exam: " . ($mark['examType'] ?? 'N/A') . "\n";
    }
} else {
    echo "Failed to parse JSON response\n";
}
?>