@echo off
REM Batch script to build the application for a specific school

REM Check if a school config file was provided
if "%~1"=="" (
    echo Usage: build-for-school.bat ^<school-config-file.json^>
    echo Example: build-for-school.bat school-config.json
    exit /b 1
)

REM Check if the config file exists
if not exist "%~1" (
    echo Error: Configuration file not found: %~1
    exit /b 1
)

REM Copy the provided config file to the main config file
copy "%~1" school-config.json

REM Run the build process
npm run build:school

echo.
echo Build completed successfully!
echo The built application is in the 'dist' folder