<?php
// Simple test script to verify API functionality
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

echo json_encode([
    "status" => "success",
    "message" => "API is working correctly",
    "timestamp" => date('Y-m-d H:i:s'),
    "endpoints" => [
        "students" => "/api.php?endpoint=students",
        "classes" => "/api.php?endpoint=classes",
        "expenses" => "/api.php?endpoint=expenses",
        "exams" => "/api.php?endpoint=exams",
        "staff" => "/api.php?endpoint=staff",
        "notifications" => "/api.php?endpoint=notifications",
        "settings" => "/api.php?endpoint=settings",
        "subsidies" => "/api.php?endpoint=subsidies",
        "batches" => "/api.php?endpoint=batches",
        "events" => "/api.php?endpoint=events",
        "promotions" => "/api.php?endpoint=promotions",
        "alumni" => "/api.php?endpoint=alumni"
    ]
]);
?>