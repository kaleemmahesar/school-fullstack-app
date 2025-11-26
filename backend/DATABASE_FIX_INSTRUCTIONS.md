# Database Fix Instructions

## Problem
You're encountering the error:
```
#1813 - Tablespace for table '`school_management`.`students`' exists. Please DISCARD the tablespace before IMPORT
```

This happens because there's a conflict with existing tables in the database.

## Solutions

You have two options to fix this issue:

### Option 1: Use a New Database Name (Recommended)
We've updated all configuration files to use `school_management_system` instead of `school_management`.

**Steps:**
1. Open phpMyAdmin
2. Create a new database named `school_management_system`
3. Select the new database
4. Go to the "SQL" tab
5. Paste the contents of `backend/database/schema.sql`
6. Execute the SQL commands

### Option 2: Fix the Existing Database
If you want to keep using the existing `school_management` database:

**Steps:**
1. Open phpMyAdmin
2. Select the `school_management` database
3. Go to the "SQL" tab
4. Paste the contents of `backend/database/fix_existing_db.sql`
5. Execute the SQL commands

This will:
- Drop only the conflicting tables (subsidies, batches, notifications, settings)
- Recreate them with the correct structure
- Add sample data

## Files Updated

1. `backend/database/schema.sql` - Updated to use new database name and added new tables
2. `backend/database/update_schema.sql` - Updated to use new database name and added new tables
3. `backend/database/fix_existing_db.sql` - Created to fix existing database with new tables
4. `backend/database/reset_database.sql` - Created to reset entire database with new tables
5. `backend/config/database.php` - Updated to use new database name
6. `backend/config/db_config.ini` - Updated to use new database name
7. `backend/config/db_config.ini.example` - Updated to use new database name

## New API Endpoints Added

1. **Notifications** - `/api/notifications`
2. **Settings** - `/api/settings`
3. **Students Attendance** - `/api/studentsAttendance` (with query parameters for date and classId)

## Verification

After running either solution:
1. Visit `http://localhost/school-app/backend/test_api.html`
2. Test the new endpoints (notifications, settings, studentsAttendance)
3. They should now return proper JSON data instead of "Endpoint not found" errors

## Additional Scripts

- `backend/database/reset_db.bat` - Batch file with instructions to reset database
- `backend/database/fix_existing_db.bat` - Batch file with instructions to fix existing database