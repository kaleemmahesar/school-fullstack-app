<?php
// Settings handler
function handleSettings($method, $id, $input, $pdo) {
    switch ($method) {
        case 'GET':
            if ($id) {
                // Get specific setting
                $stmt = $pdo->prepare("SELECT * FROM settings WHERE id = ?");
                $stmt->execute([$id]);
                $setting = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($setting) {
                    // Ensure holidays is properly formatted as JSON array
                    if (isset($setting['holidays']) && is_string($setting['holidays'])) {
                        $setting['holidays'] = json_decode($setting['holidays'], true) ?: [];
                    }
                    
                    // Ensure vacations is properly formatted as JSON array
                    if (isset($setting['vacations']) && is_string($setting['vacations'])) {
                        $setting['vacations'] = json_decode($setting['vacations'], true) ?: [];
                    }
                    
                    // Ensure weekendDays is properly formatted as JSON array
                    if (isset($setting['weekendDays']) && is_string($setting['weekendDays'])) {
                        $setting['weekendDays'] = json_decode($setting['weekendDays'], true) ?: [];
                    }
                    
                    echo json_encode($setting);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Setting not found']);
                }
            } else {
                // Get all settings
                $stmt = $pdo->query("SELECT * FROM settings");
                $settings = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                // Ensure holidays, vacations, and weekendDays are properly formatted for all settings
                foreach ($settings as &$setting) {
                    // Ensure holidays is properly formatted as JSON array
                    if (isset($setting['holidays']) && is_string($setting['holidays'])) {
                        $setting['holidays'] = json_decode($setting['holidays'], true) ?: [];
                    }
                    
                    // Ensure vacations is properly formatted as JSON array
                    if (isset($setting['vacations']) && is_string($setting['vacations'])) {
                        $setting['vacations'] = json_decode($setting['vacations'], true) ?: [];
                    }
                    
                    // Ensure weekendDays is properly formatted as JSON array
                    if (isset($setting['weekendDays']) && is_string($setting['weekendDays'])) {
                        $setting['weekendDays'] = json_decode($setting['weekendDays'], true) ?: [];
                    }
                }
                
                echo json_encode($settings);
            }
            break;
            
        case 'POST':
            // Add new setting
            $id = $input['id'] ?? uniqid();
            
            // Ensure holidays, vacations, and weekendDays are properly encoded as JSON
            $holidays = isset($input['holidays']) ? json_encode($input['holidays']) : null;
            $vacations = isset($input['vacations']) ? json_encode($input['vacations']) : null;
            $weekendDays = isset($input['weekendDays']) ? json_encode($input['weekendDays']) : null;
            
            $stmt = $pdo->prepare("INSERT INTO settings (id, schoolName, schoolAddress, schoolPhone, schoolEmail, schoolWebsite, academicYear, currency, timezone, level, hasPG, hasNursery, hasKG, holidays, vacations, weekendDays) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $id,
                $input['schoolName'] ?? '',
                $input['schoolAddress'] ?? '',
                $input['schoolPhone'] ?? '',
                $input['schoolEmail'] ?? '',
                $input['schoolWebsite'] ?? '',
                $input['academicYear'] ?? '',
                $input['currency'] ?? '',
                $input['timezone'] ?? '',
                $input['level'] ?? 'primary',
                $input['hasPG'] ?? false,
                $input['hasNursery'] ?? false,
                $input['hasKG'] ?? false,
                $holidays,
                $vacations,
                $weekendDays
            ]);
            
            // Return the created setting
            $stmt = $pdo->prepare("SELECT * FROM settings WHERE id = ?");
            $stmt->execute([$id]);
            $setting = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Ensure holidays, vacations, and weekendDays are properly formatted
            if (isset($setting['holidays']) && is_string($setting['holidays'])) {
                $setting['holidays'] = json_decode($setting['holidays'], true) ?: [];
            }
            
            if (isset($setting['vacations']) && is_string($setting['vacations'])) {
                $setting['vacations'] = json_decode($setting['vacations'], true) ?: [];
            }
            
            if (isset($setting['weekendDays']) && is_string($setting['weekendDays'])) {
                $setting['weekendDays'] = json_decode($setting['weekendDays'], true) ?: [];
            }
            
            echo json_encode($setting);
            break;
            
        case 'PUT':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Setting ID is required']);
                return;
            }
            
            // Ensure holidays, vacations, and weekendDays are properly encoded as JSON
            $holidays = isset($input['holidays']) ? json_encode($input['holidays']) : null;
            $vacations = isset($input['vacations']) ? json_encode($input['vacations']) : null;
            $weekendDays = isset($input['weekendDays']) ? json_encode($input['weekendDays']) : null;
            
            // Update setting
            $stmt = $pdo->prepare("UPDATE settings SET schoolName = ?, schoolAddress = ?, schoolPhone = ?, schoolEmail = ?, schoolWebsite = ?, academicYear = ?, currency = ?, timezone = ?, level = ?, hasPG = ?, hasNursery = ?, hasKG = ?, holidays = ?, vacations = ?, weekendDays = ? WHERE id = ?");
            $stmt->execute([
                $input['schoolName'] ?? '',
                $input['schoolAddress'] ?? '',
                $input['schoolPhone'] ?? '',
                $input['schoolEmail'] ?? '',
                $input['schoolWebsite'] ?? '',
                $input['academicYear'] ?? '',
                $input['currency'] ?? '',
                $input['timezone'] ?? '',
                $input['level'] ?? 'primary',
                $input['hasPG'] ?? false,
                $input['hasNursery'] ?? false,
                $input['hasKG'] ?? false,
                $holidays,
                $vacations,
                $weekendDays,
                $id
            ]);
            
            // Return the updated setting
            $stmt = $pdo->prepare("SELECT * FROM settings WHERE id = ?");
            $stmt->execute([$id]);
            $setting = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Ensure holidays, vacations, and weekendDays are properly formatted
            if (isset($setting['holidays']) && is_string($setting['holidays'])) {
                $setting['holidays'] = json_decode($setting['holidays'], true) ?: [];
            }
            
            if (isset($setting['vacations']) && is_string($setting['vacations'])) {
                $setting['vacations'] = json_decode($setting['vacations'], true) ?: [];
            }
            
            if (isset($setting['weekendDays']) && is_string($setting['weekendDays'])) {
                $setting['weekendDays'] = json_decode($setting['weekendDays'], true) ?: [];
            }
            
            echo json_encode($setting);
            break;
            
        case 'DELETE':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Setting ID is required']);
                return;
            }
            
            // Delete setting
            $stmt = $pdo->prepare("DELETE FROM settings WHERE id = ?");
            $stmt->execute([$id]);
            
            echo json_encode(['message' => 'Setting deleted successfully']);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
}