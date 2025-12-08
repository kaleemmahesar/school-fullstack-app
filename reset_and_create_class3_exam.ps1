# Script to reset and create Class 3 Midterm exam with marksheets

Write-Host "=== Resetting and Creating Class 3 Midterm Exam ===" -ForegroundColor Green

# 1. Delete all existing exams
Write-Host "`n1. Deleting all existing exams..." -ForegroundColor Yellow
try {
    $exams = Invoke-RestMethod -Uri "http://localhost/school-app/backend/api.php?endpoint=exams"
    Write-Host "Found $($exams.Count) exams to delete"
    
    foreach ($exam in $exams) {
        try {
            Invoke-RestMethod -Uri "http://localhost/school-app/backend/api.php?endpoint=exams/$($exam.id)" -Method DELETE
            Write-Host "Deleted exam: $($exam.name) ($($exam.id))" -ForegroundColor Green
        } catch {
            Write-Host "Failed to delete exam: $($exam.name) ($($exam.id))" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "No exams to delete or error occurred" -ForegroundColor Yellow
}

# 2. Delete all existing marks
Write-Host "`n2. Deleting all existing marks..." -ForegroundColor Yellow
try {
    $marks = Invoke-RestMethod -Uri "http://localhost/school-app/backend/api.php?endpoint=marks"
    Write-Host "Found $($marks.Count) marks to delete"
    
    foreach ($mark in $marks) {
        try {
            Invoke-RestMethod -Uri "http://localhost/school-app/backend/api.php?endpoint=marks/$($mark.id)" -Method DELETE
            #Write-Host "Deleted mark: $($mark.id)" -ForegroundColor Green
        } catch {
            Write-Host "Failed to delete mark: $($mark.id)" -ForegroundColor Red
        }
    }
    Write-Host "Deleted all marks" -ForegroundColor Green
} catch {
    Write-Host "No marks to delete or error occurred" -ForegroundColor Yellow
}

# 3. Create Class 3 Midterm exam
Write-Host "`n3. Creating Class 3 Midterm exam..." -ForegroundColor Yellow
$examBody = @{
    id = "class3-midterm-$(Get-Date -Format 'yyyyMMddHHmmss')"
    name = "Midterm Examination"
    examType = "Midterm"
    class = "Class 3"
    startDate = "2025-12-01"
    endDate = "2025-12-10"
    totalMarks = 100
    subjects = @(
        @{
            id = "subj-3-english"
            name = "English"
            date = "2025-12-01"
            time = "10:00"
            duration = 180
        },
        @{
            id = "subj-3-mathematics"
            name = "Mathematics"
            date = "2025-12-02"
            time = "10:00"
            duration = 180
        },
        @{
            id = "subj-3-science"
            name = "Science"
            date = "2025-12-03"
            time = "10:00"
            duration = 180
        }
    )
    academicYear = "2025-2026"
} | ConvertTo-Json -Depth 10

try {
    $newExam = Invoke-RestMethod -Uri "http://localhost/school-app/backend/api.php?endpoint=exams" -Method POST -Body $examBody -ContentType "application/json"
    Write-Host "Created exam: $($newExam.name) for $($newExam.class)" -ForegroundColor Green
    Write-Host "Exam ID: $($newExam.id)" -ForegroundColor Cyan
} catch {
    Write-Host "Failed to create exam: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Get Class 3 students
Write-Host "`n4. Getting Class 3 students..." -ForegroundColor Yellow
$students = Invoke-RestMethod -Uri "http://localhost/school-app/backend/api.php?endpoint=students"
$class3Students = $students | Where-Object { $_.class -eq "Class 3" -and $_.status -eq "studying" } | Select-Object -First 3
Write-Host "Found $($class3Students.Count) Class 3 students"

# 5. Generate marksheets for Class 3 students
Write-Host "`n5. Generating marksheets for Class 3 students..." -ForegroundColor Yellow

$examId = $newExam.id
$counter = 1

foreach ($student in $class3Students) {
    Write-Host "Generating marks for student: $($student.firstName) $($student.lastName) (ID: $($student.id))" -ForegroundColor Cyan
    
    # Generate random marks for each subject
    $englishMarks = Get-Random -Minimum 70 -Maximum 95
    $mathMarks = Get-Random -Minimum 70 -Maximum 95
    $scienceMarks = Get-Random -Minimum 70 -Maximum 95
    
    # English marks
    $engBody = @{
        id = "mark-$($student.id)-eng-$counter"
        studentId = $student.id
        studentName = "$($student.firstName) $($student.lastName)"
        class = "Class 3"
        section = $student.section
        examId = $examId
        examName = "Midterm Examination"
        examType = "Midterm"
        subject = "English"
        marksObtained = $englishMarks
        totalMarks = 100
        academicYear = "2025-2026"
        year = "2025"
    } | ConvertTo-Json

    Invoke-RestMethod -Uri "http://localhost/school-app/backend/api.php?endpoint=marks" -Method POST -Body $engBody -ContentType "application/json"
    
    # Mathematics marks
    $mathBody = @{
        id = "mark-$($student.id)-math-$counter"
        studentId = $student.id
        studentName = "$($student.firstName) $($student.lastName)"
        class = "Class 3"
        section = $student.section
        examId = $examId
        examName = "Midterm Examination"
        examType = "Midterm"
        subject = "Mathematics"
        marksObtained = $mathMarks
        totalMarks = 100
        academicYear = "2025-2026"
        year = "2025"
    } | ConvertTo-Json

    Invoke-RestMethod -Uri "http://localhost/school-app/backend/api.php?endpoint=marks" -Method POST -Body $mathBody -ContentType "application/json"
    
    # Science marks
    $sciBody = @{
        id = "mark-$($student.id)-sci-$counter"
        studentId = $student.id
        studentName = "$($student.firstName) $($student.lastName)"
        class = "Class 3"
        section = $student.section
        examId = $examId
        examName = "Midterm Examination"
        examType = "Midterm"
        subject = "Science"
        marksObtained = $scienceMarks
        totalMarks = 100
        academicYear = "2025-2026"
        year = "2025"
    } | ConvertTo-Json

    Invoke-RestMethod -Uri "http://localhost/school-app/backend/api.php?endpoint=marks" -Method POST -Body $sciBody -ContentType "application/json"
    
    Write-Host "Generated marks for $($student.firstName) $($student.lastName) - English: $englishMarks, Math: $mathMarks, Science: $scienceMarks" -ForegroundColor Green
    $counter++
}

# 6. Verify results
Write-Host "`n6. Verifying results..." -ForegroundColor Yellow
$finalMarks = Invoke-RestMethod -Uri "http://localhost/school-app/backend/api.php?endpoint=marks"
$class3Marks = $finalMarks | Where-Object { $_.class -eq "Class 3" }
Write-Host "Total Class 3 marks created: $($class3Marks.Count)" -ForegroundColor Green

Write-Host "`n=== Process Complete ===" -ForegroundColor Green
Write-Host "You should now be able to see:" -ForegroundColor Cyan
Write-Host "- Class 3 Midterm exam in the examinations section" -ForegroundColor Cyan
Write-Host "- Marksheets for Class 3 students" -ForegroundColor Cyan
Write-Host "- Class results in the examination results section" -ForegroundColor Cyan