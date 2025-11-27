<?php
// Staff handler
function handleStaff($method, $id, $input, $pdo) {
    switch ($method) {
        case 'GET':
            if ($id) {
                // Get specific staff member
                $stmt = $pdo->prepare("SELECT * FROM staff WHERE id = ?");
                $stmt->execute([$id]);
                $staff = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($staff) {
                    // Get salary history for this staff member
                    $stmt = $pdo->prepare("SELECT * FROM staff_salary_history WHERE staff_id = ? ORDER BY created_at DESC");
                    $stmt->execute([$id]);
                    $salaryHistory = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    $staff['salaryHistory'] = $salaryHistory;
                    
                    // Format the staff data to ensure proper data types
                    $staff = formatStaffData($staff);
                    
                    echo json_encode($staff);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Staff member not found']);
                }
            } else {
                // Get all staff members
                $stmt = $pdo->query("SELECT * FROM staff");
                $staffMembers = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                // Add salary history to each staff member
                foreach ($staffMembers as &$staff) {
                    $stmt = $pdo->prepare("SELECT * FROM staff_salary_history WHERE staff_id = ? ORDER BY created_at DESC");
                    $stmt->execute([$staff['id']]);
                    $salaryHistory = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    $staff['salaryHistory'] = $salaryHistory;
                }
                
                // Format all staff data to ensure proper data types
                $staffMembers = formatStaffDataArray($staffMembers);
                
                echo json_encode($staffMembers);
            }
            break;
            
        case 'POST':
            // Add new staff member
            $stmt = $pdo->prepare("INSERT INTO staff (photo, firstName, lastName, fatherName, cnic, gender, dateOfBirth, contactNumber, emergencyContact, email, address, department, designation, salary, dateOfJoining, jobType, subject, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            
            $stmt->execute([
                $input['photo'] ?? '',
                $input['firstName'] ?? '',
                $input['lastName'] ?? '',
                $input['fatherName'] ?? '',
                $input['cnic'] ?? '',
                $input['gender'] ?? '',
                $input['dateOfBirth'] ?? null,
                $input['contactNumber'] ?? '',
                $input['emergencyContact'] ?? '',
                $input['email'] ?? '',
                $input['address'] ?? '',
                $input['department'] ?? '',
                $input['designation'] ?? '',
                $input['salary'] ?? 0,
                $input['dateOfJoining'] ?? null,
                $input['jobType'] ?? 'Teaching',
                $input['subject'] ?? null,
                $input['status'] ?? 'active'
            ]);
            
            // Get the auto-generated ID
            $id = $pdo->lastInsertId();
            
            // If salary history is provided, insert it
            if (isset($input['salaryHistory']) && is_array($input['salaryHistory'])) {
                foreach ($input['salaryHistory'] as $salary) {
                    $stmt = $pdo->prepare("INSERT INTO staff_salary_history (id, staff_id, month, baseSalary, allowances, deductions, netSalary, status, paymentDate, paymentMethod, reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                    $stmt->execute([
                        uniqid(),
                        $id,
                        $salary['month'] ?? '',
                        $salary['baseSalary'] ?? 0,
                        $salary['allowances'] ?? 0,
                        $salary['deductions'] ?? 0,
                        $salary['netSalary'] ?? 0,
                        $salary['status'] ?? 'pending',
                        $salary['paymentDate'] ?? null,
                        $salary['paymentMethod'] ?? '',
                        $salary['reason'] ?? ''
                    ]);
                }
            }
            
            // Return the created staff member
            $stmt = $pdo->prepare("SELECT * FROM staff WHERE id = ?");
            $stmt->execute([$id]);
            $staff = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Get salary history for this staff member
            $stmt = $pdo->prepare("SELECT * FROM staff_salary_history WHERE staff_id = ? ORDER BY created_at DESC");
            $stmt->execute([$id]);
            $salaryHistory = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $staff['salaryHistory'] = $salaryHistory;
            
            echo json_encode($staff);
            break;
            
        case 'PUT':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Staff ID is required']);
                return;
            }
            
            // Update staff member
            $stmt = $pdo->prepare("UPDATE staff SET photo = ?, firstName = ?, lastName = ?, fatherName = ?, cnic = ?, gender = ?, dateOfBirth = ?, contactNumber = ?, emergencyContact = ?, email = ?, address = ?, department = ?, designation = ?, salary = ?, dateOfJoining = ?, jobType = ?, subject = ?, status = ? WHERE id = ?");
            
            $stmt->execute([
                $input['photo'] ?? '',
                $input['firstName'] ?? '',
                $input['lastName'] ?? '',
                $input['fatherName'] ?? '',
                $input['cnic'] ?? '',
                $input['gender'] ?? '',
                $input['dateOfBirth'] ?? null,
                $input['contactNumber'] ?? '',
                $input['emergencyContact'] ?? '',
                $input['email'] ?? '',
                $input['address'] ?? '',
                $input['department'] ?? '',
                $input['designation'] ?? '',
                $input['salary'] ?? 0,
                $input['dateOfJoining'] ?? null,
                $input['jobType'] ?? 'Teaching',
                $input['subject'] ?? null,
                $input['status'] ?? 'active',
                $id
            ]);
            
            // If salary history is provided, update it
            if (isset($input['salaryHistory']) && is_array($input['salaryHistory'])) {
                // First delete existing salary history for this staff member
                $stmt = $pdo->prepare("DELETE FROM staff_salary_history WHERE staff_id = ?");
                $stmt->execute([$id]);
                
                // Then insert new salary history
                foreach ($input['salaryHistory'] as $salary) {
                    $stmt = $pdo->prepare("INSERT INTO staff_salary_history (id, staff_id, month, baseSalary, allowances, deductions, netSalary, status, paymentDate, paymentMethod, reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                    $stmt->execute([
                        uniqid(),
                        $id,
                        $salary['month'] ?? '',
                        $salary['baseSalary'] ?? 0,
                        $salary['allowances'] ?? 0,
                        $salary['deductions'] ?? 0,
                        $salary['netSalary'] ?? 0,
                        $salary['status'] ?? 'pending',
                        $salary['paymentDate'] ?? null,
                        $salary['paymentMethod'] ?? '',
                        $salary['reason'] ?? ''
                    ]);
                }
            }
            
            // Return the updated staff member
            $stmt = $pdo->prepare("SELECT * FROM staff WHERE id = ?");
            $stmt->execute([$id]);
            $staff = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Get salary history for this staff member
            $stmt = $pdo->prepare("SELECT * FROM staff_salary_history WHERE staff_id = ? ORDER BY created_at DESC");
            $stmt->execute([$id]);
            $salaryHistory = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $staff['salaryHistory'] = $salaryHistory;
            
            echo json_encode($staff);
            break;
            
        case 'DELETE':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Staff ID is required']);
                return;
            }
            
            // Delete staff member (cascades to staff_salary_history)
            $stmt = $pdo->prepare("DELETE FROM staff WHERE id = ?");
            $stmt->execute([$id]);
            
            echo json_encode(['message' => 'Staff member deleted successfully']);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
}