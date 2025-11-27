<?php
// Debug script to capture exactly what's being sent to the backend
$rawInput = file_get_contents('php://input');
$headers = getallheaders();

// Log the raw input and headers
file_put_contents('debug_log.txt', "=== " . date('Y-m-d H:i:s') . " ===\n", FILE_APPEND);
file_put_contents('debug_log.txt', "Headers:\n", FILE_APPEND);
foreach ($headers as $key => $value) {
    file_put_contents('debug_log.txt', "$key: $value\n", FILE_APPEND);
}
file_put_contents('debug_log.txt', "Raw Input:\n$rawInput\n\n", FILE_APPEND);

// Also output to screen
echo "Headers:\n";
print_r($headers);
echo "\nRaw Input:\n";
echo $rawInput;

// Parse and pretty print JSON if it's JSON
if (!empty($rawInput)) {
    $jsonData = json_decode($rawInput, true);
    if ($jsonData) {
        echo "\nParsed JSON:\n";
        echo json_encode($jsonData, JSON_PRETTY_PRINT);
    }
}
?>