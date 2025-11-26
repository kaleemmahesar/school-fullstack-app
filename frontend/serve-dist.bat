@echo off
REM Batch script to serve the built application
REM This script serves the files in the dist folder using a simple HTTP server

echo ========================================
echo School Management Application - Production Server
echo ========================================

REM Check if dist folder exists
if not exist "dist" (
    echo Error: Cannot find 'dist' folder.
    echo Please run 'build-app.bat' first to create the production build.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: npm is not installed or not in PATH.
    echo Please install Node.js which includes npm.
    pause
    exit /b 1
)

REM Serve the dist folder using vite preview
echo Starting production server...
echo.
echo The application will be available at http://localhost:4173
echo Press CTRL+C to stop the server
echo.
start http://localhost:4173
npx vite preview --outDir dist