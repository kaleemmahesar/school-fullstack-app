@echo off
REM Simple script to run the built application
REM This script serves the dist folder using Python's built-in HTTP server

echo ========================================
echo School Management Application
echo ========================================

REM Check if dist folder exists
if not exist "dist" (
    echo Error: Cannot find 'dist' folder.
    echo Please run 'build-app.bat' first to create the production build.
    pause
    exit /b 1
)

REM Try to use Python to serve the files
python -m http.server 8000 -d dist 2>nul
if %errorlevel% equ 0 (
    echo Starting server on http://localhost:8000
    echo Press CTRL+C to stop the server
    start http://localhost:8000
    python -m http.server 8000 -d dist
    exit /b 0
)

REM If Python is not available, try using Node.js http-server if installed
npx http-server dist -p 8000 2>nul
if %errorlevel% equ 0 (
    echo Starting server on http://localhost:8000
    echo Press CTRL+C to stop the server
    start http://localhost:8000
    npx http-server dist -p 8000
    exit /b 0
)

REM If neither Python nor http-server is available, use Vite preview
npx vite preview --outDir dist --port 8000 2>nul
if %errorlevel% equ 0 (
    echo Starting server on http://localhost:8000
    echo Press CTRL+C to stop the server
    start http://localhost:8000
    npx vite preview --outDir dist --port 8000
    exit /b 0
)

echo Error: No suitable HTTP server found.
echo Please install one of the following:
echo 1. Python (comes with built-in HTTP server)
echo 2. Node.js with http-server (npm install -g http-server)
echo 3. Node.js with Vite (npm install -g vite)
pause
exit /b 1