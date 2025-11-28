<?php
// Classes handler
function handleClasses($method, $id, $input, $pdo) {
    switch ($method) {
        case 'GET':
            // Check if name parameter is provided
            $name = isset($_GET['name']) ? $_GET['name'] : null;
            
            if ($id) {
                // Get specific class
                $stmt = $pdo->prepare("SELECT * FROM classes WHERE id = ?");
                $stmt->execute([$id]);
                $class = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($class) {
                    // Get subjects for this class with teacher info
                    $stmt = $pdo->prepare("SELECT s.*, st.firstName as teacherFirstName, st.lastName as teacherLastName FROM subjects s LEFT JOIN staff st ON s.teacher_id = st.id WHERE s.class_id = ?");
                    $stmt->execute([$id]);
                    $subjects = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    $class['subjects'] = $subjects;
                    
                    // Get sections for this class
                    $stmt = $pdo->prepare("SELECT * FROM sections WHERE class_id = ?");
                    $stmt->execute([$id]);
                    $sections = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    $class['sections'] = $sections;
                    
                    echo json_encode($class);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Class not found']);
                }
            } else if ($name) {
                // Get specific class by name
                $stmt = $pdo->prepare("SELECT * FROM classes WHERE name = ?");
                $stmt->execute([$name]);
                $class = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($class) {
                    // Get subjects for this class with teacher info
                    $stmt = $pdo->prepare("SELECT s.*, st.firstName as teacherFirstName, st.lastName as teacherLastName FROM subjects s LEFT JOIN staff st ON s.teacher_id = st.id WHERE s.class_id = ?");
                    $stmt->execute([$class['id']]);
                    $subjects = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    $class['subjects'] = $subjects;
                    
                    // Get sections for this class
                    $stmt = $pdo->prepare("SELECT * FROM sections WHERE class_id = ?");
                    $stmt->execute([$class['id']]);
                    $sections = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    $class['sections'] = $sections;
                    
                    echo json_encode($class);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Class not found']);
                }
            } else {
                // Get all classes
                $stmt = $pdo->query("SELECT * FROM classes");
                $classes = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                // Add subjects and sections to each class
                foreach ($classes as &$class) {
                    // Get subjects for this class with teacher info
                    $stmt = $pdo->prepare("SELECT s.*, st.firstName as teacherFirstName, st.lastName as teacherLastName FROM subjects s LEFT JOIN staff st ON s.teacher_id = st.id WHERE s.class_id = ?");
                    $stmt->execute([$class['id']]);
                    $subjects = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    $class['subjects'] = $subjects;
                    
                    // Get sections for this class
                    $stmt = $pdo->prepare("SELECT * FROM sections WHERE class_id = ?");
                    $stmt->execute([$class['id']]);
                    $sections = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    $class['sections'] = $sections;
                }
                
                echo json_encode($classes);
            }
            break;
            
        case 'POST':
            // Add new class
            $id = $input['id'] ?? uniqid();
            $stmt = $pdo->prepare("INSERT INTO classes (id, name, monthlyFees, admissionFees) VALUES (?, ?, ?, ?)");
            $stmt->execute([
                $id,
                $input['name'] ?? '',
                $input['monthlyFees'] ?? 0,
                $input['admissionFees'] ?? 0
            ]);
            
            // Handle sections if provided
            if (isset($input['sections']) && is_array($input['sections'])) {
                foreach ($input['sections'] as $section) {
                    $sectionId = $section['id'] ?? uniqid();
                    $stmt = $pdo->prepare("INSERT INTO sections (id, class_id, name) VALUES (?, ?, ?)");
                    $stmt->execute([
                        $sectionId,
                        $id,
                        $section['name'] ?? ''
                    ]);
                }
            }
            
            // Return the created class with sections
            $stmt = $pdo->prepare("SELECT * FROM classes WHERE id = ?");
            $stmt->execute([$id]);
            $class = $stmt->fetch(PDO::FETCH_ASSOC);
            $class['subjects'] = [];
            
            // Get sections for this class
            $stmt = $pdo->prepare("SELECT * FROM sections WHERE class_id = ?");
            $stmt->execute([$id]);
            $sections = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $class['sections'] = $sections;
            
            echo json_encode($class);
            break;
            
        case 'PUT':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Class ID is required']);
                return;
            }
            
            // Update class
            $stmt = $pdo->prepare("UPDATE classes SET name = ?, monthlyFees = ?, admissionFees = ? WHERE id = ?");
            $stmt->execute([
                $input['name'] ?? '',
                $input['monthlyFees'] ?? 0,
                $input['admissionFees'] ?? 0,
                $id
            ]);
            
            // Handle sections if provided
            if (isset($input['sections']) && is_array($input['sections'])) {
                // First, delete existing sections for this class
                $stmt = $pdo->prepare("DELETE FROM sections WHERE class_id = ?");
                $stmt->execute([$id]);
                
                // Then add the new sections
                foreach ($input['sections'] as $section) {
                    $sectionId = $section['id'] ?? uniqid();
                    $stmt = $pdo->prepare("INSERT INTO sections (id, class_id, name) VALUES (?, ?, ?)");
                    $stmt->execute([
                        $sectionId,
                        $id,
                        $section['name'] ?? ''
                    ]);
                }
            }
            
            // Return the updated class
            $stmt = $pdo->prepare("SELECT * FROM classes WHERE id = ?");
            $stmt->execute([$id]);
            $class = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Get subjects for this class with teacher info
            $stmt = $pdo->prepare("SELECT s.*, st.firstName as teacherFirstName, st.lastName as teacherLastName FROM subjects s LEFT JOIN staff st ON s.teacher_id = st.id WHERE s.class_id = ?");
            $stmt->execute([$id]);
            $subjects = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $class['subjects'] = $subjects;
            
            // Get sections for this class
            $stmt = $pdo->prepare("SELECT * FROM sections WHERE class_id = ?");
            $stmt->execute([$id]);
            $sections = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $class['sections'] = $sections;
            
            echo json_encode($class);
            break;
            
        case 'DELETE':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Class ID is required']);
                return;
            }
            
            // Delete class (cascades to subjects and sections)
            $stmt = $pdo->prepare("DELETE FROM classes WHERE id = ?");
            $stmt->execute([$id]);
            
            echo json_encode(['message' => 'Class deleted successfully']);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
}