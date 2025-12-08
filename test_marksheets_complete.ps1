# Test script to verify complete marksheets functionality

Write-Host "=== Testing Marksheets Management System ===" -ForegroundColor Green

# 1. Verify exams are available
Write-Host "`n1. Checking available exams..." -ForegroundColor Yellow
$exams = Invoke-RestMethod -Uri "http://localhost/school-app/backend/api.php?endpoint=exams"
$class2Exams = $exams | Where-Object { $_.class -eq "Class 2" }
Write-Host "Found $($class2Exams.Count) Class 2 exams:"
$class2Exams | Format-Table id, name, examType, class, academicYear

# 2. Verify students are available
Write-Host "`n2. Checking available students..." -ForegroundColor Yellow
$students = Invoke-RestMethod -Uri "http://localhost/school-app/backend/api.php?endpoint=students"
$class2Students = $students | Where-Object { $_.class -eq "Class 2" -and $_.status -eq "studying" }
Write-Host "Found $($class2Students.Count) Class 2 students:"
$class2Students | Select-Object -First 3 | Format-Table id, firstName, lastName, class, section

# 3. Verify existing marks
Write-Host "`n3. Checking existing marks..." -ForegroundColor Yellow
$marks = Invoke-RestMethod -Uri "http://localhost/school-app/backend/api.php?endpoint=marks"
$class2Marks = $marks | Where-Object { $_.class -eq "Class 2" }
Write-Host "Found $($class2Marks.Count) Class 2 marks"

# 4. Add new marks for testing (if needed)
Write-Host "`n4. Adding test marks..." -ForegroundColor Yellow

# Get first 2 Class 2 students for testing
$testStudents = $class2Students | Select-Object -First 2

foreach ($student in $testStudents) {
    Write-Host "Adding marks for student: $($student.firstName) $($student.lastName) (ID: $($student.id))" -ForegroundColor Cyan
    
    # English marks
    $engBody = @{
        id = "test-mark-$($student.id)-eng"
        studentId = $student.id
        studentName = "$($student.firstName) $($student.lastName)"
        class = "Class 2"
        section = $student.section
        examId = $class2Exams[0].id
        examName = $class2Exams[0].name
        examType = $class2Exams[0].examType
        subject = "English"
        marksObtained = 85
        totalMarks = 100
        academicYear = "2025-2026"
        year = "2025"
    } | ConvertTo-Json

    Invoke-RestMethod -Uri "http://localhost/school-app/backend/api.php?endpoint=marks" -Method POST -Body $engBody -ContentType "application/json"
    
    # Mathematics marks
    $mathBody = @{
        id = "test-mark-$($student.id)-math"
        studentId = $student.id
        studentName = "$($student.firstName) $($student.lastName)"
        class = "Class 2"
        section = $student.section
        examId = $class2Exams[0].id
        examName = $class2Exams[0].name
        examType = $class2Exams[0].examType
        subject = "Mathematics"
        marksObtained = 92
        totalMarks = 100
        academicYear = "2025-2026"
        year = "2025"
    } | ConvertTo-Json

    Invoke-RestMethod -Uri "http://localhost/school-app/backend/api.php?endpoint=marks" -Method POST -Body $mathBody -ContentType "application/json"
    
    # Science marks
    $sciBody = @{
        id = "test-mark-$($student.id)-sci"
        studentId = $student.id
        studentName = "$($student.firstName) $($student.lastName)"
        class = "Class 2"
        section = $student.section
        examId = $class2Exams[0].id
        examName = $class2Exams[0].name
        examType = $class2Exams[0].examType
        subject = "Science"
        marksObtained = 78
        totalMarks = 100
        academicYear = "2025-2026"
        year = "2025"
    } | ConvertTo-Json

    Invoke-RestMethod -Uri "http://localhost/school-app/backend/api.php?endpoint=marks" -Method POST -Body $sciBody -ContentType "application/json"
    
    Write-Host "Added marks for student $($student.id)" -ForegroundColor Green
}

# 5. Verify marks were added
Write-Host "`n5. Verifying added marks..." -ForegroundColor Yellow
$updatedMarks = Invoke-RestMethod -Uri "http://localhost/school-app/backend/api.php?endpoint=marks"
$newClass2Marks = $updatedMarks | Where-Object { $_.class -eq "Class 2" -and $_.examType -eq "Midterm" }
Write-Host "Now found $($newClass2Marks.Count) Class 2 midterm marks:"
$newClass2Marks | Format-Table studentName, subject, marksObtained, totalMarks, examType

Write-Host "`n=== Test Complete ===" -ForegroundColor Green
Write-Host "You should now see exam types in the Marksheets Management page." -ForegroundColor Cyan
Write-Host "Refresh the frontend and navigate to Marksheets Management -> Add Marksheet" -ForegroundColor Cyan