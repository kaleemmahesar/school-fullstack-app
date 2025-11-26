# School Management System - Backend API

This is the backend API for the School Management System, built with PHP and MySQL.

## Setup Instructions

### 1. Database Setup

1. Open phpMyAdmin in your browser (typically http://localhost/phpmyadmin)
2. Create a new database named `school_management_system`
3. Import the database schema:
   - Go to the "Import" tab
   - Choose the `database/schema.sql` file
   - Click "Go" to execute the SQL script

### 2. Configuration

The database configuration is set in `config/database.php`. By default, it uses:
- Host: localhost
- Username: root
- Password: (empty)
- Database: school_management_system

If you need to change these settings, you can either:
1. Modify the `config/db_config.ini` file
2. Or update the constants directly in `config/database.php`

### 3. API Endpoints

All API endpoints are accessed through the `api.php` file with the following pattern:
```
http://localhost/school-app/backend/api.php?endpoint=[resource]/[id]
```

#### Available Endpoints:

- **Students**: `/students`
  - GET `/students` - Get all students
  - GET `/students/{id}` - Get specific student
  - POST `/students` - Create new student
  - PUT `/students/{id}` - Update student
  - DELETE `/students/{id}` - Delete student

- **Classes**: `/classes`
  - GET `/classes` - Get all classes
  - GET `/classes/{id}` - Get specific class
  - POST `/classes` - Create new class
  - PUT `/classes/{id}` - Update class
  - DELETE `/classes/{id}` - Delete class

- **Expenses**: `/expenses`
  - GET `/expenses` - Get all expenses
  - GET `/expenses/{id}` - Get specific expense
  - POST `/expenses` - Create new expense
  - PUT `/expenses/{id}` - Update expense
  - DELETE `/expenses/{id}` - Delete expense

- **Exams**: `/exams`
  - GET `/exams` - Get all exams
  - GET `/exams/{id}` - Get specific exam
  - POST `/exams` - Create new exam
  - PUT `/exams/{id}` - Update exam
  - DELETE `/exams/{id}` - Delete exam

- **Staff**: `/staff`
  - GET `/staff` - Get all staff
  - GET `/staff/{id}` - Get specific staff
  - POST `/staff` - Create new staff
  - PUT `/staff/{id}` - Update staff
  - DELETE `/staff/{id}` - Delete staff

- **Staff Attendance**: `/staffAttendance`
  - GET `/staffAttendance` - Get all staff attendance records
  - GET `/staffAttendance?date={date}` - Get staff attendance for specific date
  - GET `/staffAttendance/{id}` - Get specific staff attendance record
  - POST `/staffAttendance` - Create new staff attendance record
  - PUT `/staffAttendance/{id}` - Update staff attendance record
  - DELETE `/staffAttendance/{id}` - Delete staff attendance record

- **Attendance**: `/attendance`
  - GET `/attendance` - Get all attendance records
  - GET `/attendance?date={date}` - Get attendance for specific date
  - GET `/attendance?date={date}&classId={classId}` - Get attendance for specific date and class
  - GET `/attendance/{id}` - Get specific attendance record
  - POST `/attendance` - Create new attendance record
  - PUT `/attendance/{id}` - Update attendance record
  - DELETE `/attendance/{id}` - Delete attendance record

- **Students Attendance**: `/studentsAttendance`
  - GET `/studentsAttendance?date={date}&classId={classId}` - Get student attendance for specific date and class
  - POST `/studentsAttendance` - Create new student attendance record
  - PUT `/studentsAttendance/{id}` - Update student attendance record
  - DELETE `/studentsAttendance/{id}` - Delete student attendance record

- **Marks**: `/marks`
  - GET `/marks` - Get all marks
  - GET `/marks/{id}` - Get specific mark record
  - POST `/marks` - Create new mark record
  - PUT `/marks/{id}` - Update mark record
  - DELETE `/marks/{id}` - Delete mark record

- **Subsidies**: `/subsidies`
  - GET `/subsidies` - Get all subsidies
  - GET `/subsidies/{id}` - Get specific subsidy
  - POST `/subsidies` - Create new subsidy
  - PUT `/subsidies/{id}` - Update subsidy
  - DELETE `/subsidies/{id}` - Delete subsidy

- **Batches**: `/batches`
  - GET `/batches` - Get all batches
  - GET `/batches/{id}` - Get specific batch
  - POST `/batches` - Create new batch
  - PUT `/batches/{id}` - Update batch
  - DELETE `/batches/{id}` - Delete batch

- **Notifications**: `/notifications`
  - GET `/notifications` - Get all notifications
  - GET `/notifications/{id}` - Get specific notification
  - POST `/notifications` - Create new notification
  - PUT `/notifications/{id}` - Update notification
  - DELETE `/notifications/{id}` - Delete notification

- **Settings**: `/settings`
  - GET `/settings` - Get all settings
  - GET `/settings/{id}` - Get specific setting
  - POST `/settings` - Create new setting
  - PUT `/settings/{id}` - Update setting
  - DELETE `/settings/{id}` - Delete setting

- **Events**: `/events`
  - GET `/events` - Get all events
  - GET `/events/{id}` - Get specific event
  - POST `/events` - Create new event
  - PUT `/events/{id}` - Update event
  - DELETE `/events/{id}` - Delete event

- **Promotions**: `/promotions`
  - GET `/promotions` - Get all promotions
  - GET `/promotions/{id}` - Get specific promotion
  - POST `/promotions` - Create new promotion
  - PUT `/promotions/{id}` - Update promotion
  - DELETE `/promotions/{id}` - Delete promotion

- **Alumni**: `/alumni`
  - GET `/alumni` - Get all alumni
  - GET `/alumni/{id}` - Get specific alumni
  - POST `/alumni` - Create new alumni
  - PUT `/alumni/{id}` - Update alumni
  - DELETE `/alumni/{id}` - Delete alumni

### 4. Testing the API

You can test the API using tools like:
- Postman
- curl
- Browser (for GET requests)

Example GET request:
```
http://localhost/school-app/backend/api.php?endpoint=students
```

Example POST request (using curl):
```bash
curl -X POST \
  http://localhost/school-app/backend/api.php?endpoint=students \
  -H 'Content-Type: application/json' \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "class": "Class 10"
  }'
```

### 5. Database Schema

The complete database schema is in the `database/schema.sql` file. This file contains:
- All table definitions
- Sample data for testing
- Proper foreign key relationships

### 6. Error Handling

The API returns appropriate HTTP status codes:
- 200: Success
- 404: Resource not found
- 405: Method not allowed
- 500: Internal server error

Error responses are returned as JSON:
```json
{
  "error": "Error message"
}
```

### 7. CORS Support

The API includes CORS headers to allow cross-origin requests from any domain.

## Troubleshooting

1. **Database Connection Issues**:
   - Verify database credentials in `config/db_config.ini`
   - Ensure MySQL service is running
   - Check if the database `school_management_system` exists

2. **API Endpoints Not Found**:
   - Make sure the URL path is correct
   - Verify the endpoint name is spelled correctly
   - Check Apache mod_rewrite is enabled (if using clean URLs)

3. **PHP Errors**:
   - Check PHP error logs
   - Ensure all required PHP extensions are installed (PDO, MySQL)