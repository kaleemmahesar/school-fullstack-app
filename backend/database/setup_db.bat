@echo off
echo School Management System - Database Setup
echo ========================================
echo.

echo Please follow these steps to set up the database:
echo 1. Open phpMyAdmin or your MySQL client
echo 2. Create a new database named 'school_management'
echo 3. Import the schema.sql file into the database
echo.
echo Alternatively, you can run this command in MySQL:
echo CREATE DATABASE IF NOT EXISTS school_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
echo USE school_management;
echo Then execute the SQL statements from schema.sql
echo.
echo Press any key to open the schema.sql file...
pause >nul
notepad database\schema.sql