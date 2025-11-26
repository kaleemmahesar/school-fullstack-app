<?php
/**
 * School Management System Installation Script
 * 
 * This script provides step-by-step instructions for setting up the backend.
 */
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>School Management System - Installation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1, h2, h3 {
            color: #333;
        }
        .step {
            background-color: #f8f9fa;
            border-left: 4px solid #007bff;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .step-number {
            display: inline-block;
            background-color: #007bff;
            color: white;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            text-align: center;
            line-height: 30px;
            margin-right: 10px;
            font-weight: bold;
        }
        .command {
            background-color: #2d2d2d;
            color: #f8f8f2;
            padding: 10px;
            border-radius: 4px;
            font-family: monospace;
            overflow-x: auto;
        }
        .note {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .success {
            background-color: #d4edda;
            border-left: 4px solid #28a745;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        a {
            color: #007bff;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>School Management System - Backend Installation</h1>
        
        <div class="success">
            <strong>✅ Installation Status:</strong> The backend files have been successfully created!
        </div>
        
        <p>Follow these steps to complete the installation of the School Management System backend:</p>
        
        <div class="step">
            <h3><span class="step-number">1</span> Database Setup</h3>
            <p>First, you need to create the database and import the schema:</p>
            <ol>
                <li>Open phpMyAdmin in your browser (usually <a href="http://localhost/phpmyadmin" target="_blank">http://localhost/phpmyadmin</a>)</li>
                <li>Create a new database named <code>school_management_system</code></li>
                <li>Select the database and go to the "Import" tab</li>
                <li>Choose the file <code>database/schema.sql</code> from this backend directory</li>
                <li>Click "Go" to import the database schema</li>
            </ol>
        </div>
        
        <div class="step">
            <h3><span class="step-number">2</span> Database Configuration (Optional)</h3>
            <p>If you need to change the default database settings:</p>
            <ol>
                <li>Open the file <code>config/db_config.ini</code></li>
                <li>Modify the database connection settings as needed:
                    <div class="command">
[database]<br>
host = localhost<br>
username = root<br>
password = <br>
database = school_management_system
                    </div>
                </li>
            </ol>
        </div>
        
        <div class="step">
            <h3><span class="step-number">3</span> Verify Installation</h3>
            <p>Test if everything is working correctly:</p>
            <ol>
                <li>Open your browser and navigate to:
                    <div class="command">http://localhost/school-app/backend/test_api.php</div>
                </li>
                <li>You should see a JSON response indicating the API is working</li>
                <li>For a more interactive test, visit:
                    <div class="command">http://localhost/school-app/backend/test_frontend.html</div>
                </li>
            </ol>
        </div>
        
        <div class="step">
            <h3><span class="step-number">4</span> API Usage</h3>
            <p>Your API is now ready to use! The endpoints follow this pattern:</p>
            <div class="command">
GET http://localhost/school-app/backend/api.php?endpoint=students<br>
POST http://localhost/school-app/backend/api.php?endpoint=students<br>
GET http://localhost/school-app/backend/api.php?endpoint=students/1<br>
            </div>
            
            <h4>Available Endpoints:</h4>
            <ul>
                <li><code>students</code> - Student management</li>
                <li><code>classes</code> - Class management</li>
                <li><code>expenses</code> - Expense tracking</li>
                <li><code>exams</code> - Exam management</li>
                <li><code>staff</code> - Staff management</li>
                <li><code>notifications</code> - System notifications</li>
                <li><code>settings</code> - School settings</li>
                <li><code>subsidies</code> - Financial subsidies</li>
                <li><code>batches</code> - Academic batches</li>
                <li><code>events</code> - School events</li>
                <li><code>promotions</code> - Student promotions</li>
                <li><code>alumni</code> - Alumni management</li>
            </ul>
        </div>
        
        <div class="note">
            <strong>💡 Tip:</strong> For cleaner URLs, make sure Apache's mod_rewrite is enabled and the .htaccess file is working. 
            This allows you to use URLs like <code>/api/students</code> instead of <code>/api.php?endpoint=students</code>.
        </div>
        
        <div class="step">
            <h3><span class="step-number">5</span> Troubleshooting</h3>
            <p>If you encounter issues:</p>
            <ul>
                <li>Check that MySQL service is running</li>
                <li>Verify database credentials in <code>config/db_config.ini</code></li>
                <li>Ensure all required PHP extensions are installed (PDO, PDO MySQL)</li>
                <li>Check Apache error logs for any issues</li>
                <li>Run the verification script: <code>verify_setup.php</code></li>
            </ul>
        </div>
        
        <div class="success">
            <h3>🎉 Installation Complete!</h3>
            <p>Your School Management System backend is ready to use. The frontend can now connect to these API endpoints to retrieve and manage data.</p>
            <p>For detailed documentation, see the <a href="README.md">README.md</a> file.</p>
        </div>
    </div>
</body>
</html>