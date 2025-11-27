<?php
// Expenses handler
function handleExpenses($method, $id, $input, $pdo) {
    switch ($method) {
        case 'GET':
            if ($id) {
                // Get specific expense
                $stmt = $pdo->prepare("SELECT * FROM expenses WHERE id = ?");
                $stmt->execute([$id]);
                $expense = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($expense) {
                    // Convert numeric fields to proper numbers
                    $expense = convertFieldsToNumbers($expense, ['amount']);
                    echo json_encode($expense);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Expense not found']);
                }
            } else {
                // Get all expenses
                $stmt = $pdo->query("SELECT * FROM expenses");
                $expenses = $stmt->fetchAll(PDO::FETCH_ASSOC);
                // Convert numeric fields to proper numbers
                foreach ($expenses as &$expense) {
                    $expense = convertFieldsToNumbers($expense, ['amount']);
                }
                echo json_encode($expenses);
            }
            break;
            
        case 'POST':
            // Add new expense
            $id = $input['id'] ?? uniqid();
            $stmt = $pdo->prepare("INSERT INTO expenses (id, category, description, amount, date, academicYear, addedTimestamp) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $id,
                $input['category'] ?? '',
                $input['description'] ?? '',
                $input['amount'] ?? 0,
                $input['date'] ?? null,
                $input['academicYear'] ?? '',
                $input['addedTimestamp'] ?? date('Y-m-d H:i:s')
            ]);
            
            // Return the created expense
            $stmt = $pdo->prepare("SELECT * FROM expenses WHERE id = ?");
            $stmt->execute([$id]);
            $expense = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Convert numeric fields to proper numbers
            $expense = convertFieldsToNumbers($expense, ['amount']);
            
            echo json_encode($expense);
            break;
            
        case 'PUT':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Expense ID is required']);
                return;
            }
            
            // Update expense
            $stmt = $pdo->prepare("UPDATE expenses SET category = ?, description = ?, amount = ?, date = ?, academicYear = ? WHERE id = ?");
            $stmt->execute([
                $input['category'] ?? '',
                $input['description'] ?? '',
                $input['amount'] ?? 0,
                $input['date'] ?? null,
                $input['academicYear'] ?? '',
                $id
            ]);
            
            // Return the updated expense
            $stmt = $pdo->prepare("SELECT * FROM expenses WHERE id = ?");
            $stmt->execute([$id]);
            $expense = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Convert numeric fields to proper numbers
            $expense = convertFieldsToNumbers($expense, ['amount']);
            
            echo json_encode($expense);
            break;
            
        case 'DELETE':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Expense ID is required']);
                return;
            }
            
            // Delete expense
            $stmt = $pdo->prepare("DELETE FROM expenses WHERE id = ?");
            $stmt->execute([$id]);
            
            echo json_encode(['message' => 'Expense deleted successfully']);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
}