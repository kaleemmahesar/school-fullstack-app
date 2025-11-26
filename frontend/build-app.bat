@echo off
REM Batch script to build the school management application
REM This script will generate the configuration and build the application

echo ========================================
echo School Management Application Builder
echo ========================================

REM Generate the school configuration
echo Generating school configuration...
node scripts/generate-config.js school-config.json

if %errorlevel% neq 0 (
    echo Error: Failed to generate school configuration
    pause
    exit /b %errorlevel%
)

REM Build the application
echo Building the application...
npm run build

if %errorlevel% neq 0 (
    echo Error: Failed to build the application
    pause
    exit /b %errorlevel%
)

echo.
echo ========================================
echo Build completed successfully!
echo.
echo The built application is located in the 'dist' folder
echo You can now distribute this folder to schools
echo ========================================
echo.
pause