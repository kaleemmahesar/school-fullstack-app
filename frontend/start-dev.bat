@echo off
title Run React Build
cd /d "%~dp0"

REM Check if serve is installed
where serve >nul 2>nul
if %errorlevel% neq 0 (
    echo Installing 'serve' package...
    npm install -g serve
)

echo Starting app on http://localhost:3000
serve -s dist -l 3000

echo.
echo Press any key to close...
pause >nul
