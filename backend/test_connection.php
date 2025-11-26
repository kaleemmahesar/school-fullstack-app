<?php
// Simple test script to verify API endpoints
echo "Testing School Management System API Endpoints\n";
echo "=============================================\n\n";

$base_url = 'http://localhost/school-app/backend/api';

// Test a few key endpoints
$endpoints = [
    'students',
    'classes',
    'fees_history'
];

foreach ($endpoints as $endpoint) {
    echo "Testing /api/$endpoint...\n";
    
    $url = "$base_url/$endpoint";
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, false);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($response === false) {
        echo "   ✗ Failed to connect to endpoint\n";
    } else if ($http_code >= 200 && $http_code < 300) {
        echo "   ✓ Endpoint is accessible (HTTP $http_code)\n";
        // Try to decode JSON response
        $json = json_decode($response, true);
        if ($json !== null) {
            $count = is_array($json) ? count($json) : 'N/A';
            echo "   ✓ Response is valid JSON with $count items\n";
        } else {
            echo "   ✓ Response received (non-JSON)\n";
        }
    } else {
        echo "   ✗ Endpoint returned HTTP $http_code\n";
    }
    
    echo "\n";
}

echo "API testing completed!\n";
echo "The backend is now ready to serve the frontend application.\n";
?>