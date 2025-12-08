import React, { useState, useEffect, useMemo } from 'react';
import { FaBook, FaGraduationCap, FaClipboardList, FaCheck, FaCogs, FaTrophy, FaMedal } from 'react-icons/fa';
import { jsPDF } from 'jspdf';
import BulkMarksheetPrintView from './BulkMarksheetPrintView';
import IndividualMarksheetPrintView from './IndividualMarksheetPrintView';
import PrintMarksheetsView from './PrintMarksheetsView';
import { getCurrentAcademicYear } from '../../utils/dateUtils';

const ClassExamMarksheetForm = ({ 
  classes, 
  students, 
  exams, // Add exams prop
  onSubmit, 
  onCancel 
}) => {
  const [step, setStep] = useState(1); // 1: Select class/exam, 2: Enter marks, 3: Configure grades
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [examType, setExamType] = useState('');
  const [selectedExam, setSelectedExam] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [subjectMarks, setSubjectMarks] = useState([]);
  const [studentMarks, setStudentMarks] = useState([]);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [gradeConfig, setGradeConfig] = useState([
    { minPercentage: 90, grade: 'A+', description: 'Excellent' },
    { minPercentage: 80, grade: 'A', description: 'Very Good' },
    { minPercentage: 70, grade: 'B+', description: 'Good' },
    { minPercentage: 60, grade: 'B', description: 'Satisfactory' },
    { minPercentage: 50, grade: 'C', description: 'Average' },
    { minPercentage: 0, grade: 'F', description: 'Fail' }
  ]);
  const [showGradeConfig, setShowGradeConfig] = useState(false);
  
  // Filter students to include all students in the selected class and section
  // Removed the restriction to only show students in current batch who haven't passed out
  const eligibleStudents = useMemo(() => {
    // Return all students - don't filter based on academic year or status
    // This allows creating marksheets for all students regardless of their current status
    return students;
  }, [students]);

  // Get students for selected class and section
  const filteredStudents = useMemo(() => {
    const filtered = eligibleStudents.filter(student => 
      student.class === selectedClass && student.section === selectedSection
    );
    return filtered;
  }, [eligibleStudents, selectedClass, selectedSection]);

  // Get subjects for selected class
  const classSubjects = selectedClass 
    ? classes.find(cls => cls.name === selectedClass)?.subjects || []
    : [];

  // Get sections for selected class
  const classSections = selectedClass 
    ? classes.find(cls => cls.name === selectedClass)?.sections || []
    : [];

  // Get filtered exams for the selected class (memoized to prevent infinite loops)
  const filteredExams = useMemo(() => {
    return exams && exams
      .filter(exam => !selectedClass || exam.class === selectedClass || (exam.classes && exam.classes.includes(selectedClass)))
      .map(exam => {
        // If exam has scheduled subjects for this class, use those; otherwise use class subjects
        const scheduledSubjects = exam.scheduledSubjects?.find(sc => sc.className === selectedClass)?.subjects;
        return {
          ...exam,
          effectiveSubjects: scheduledSubjects || exam.subjects || []
        };
      }) || [];
  }, [exams, selectedClass]);

  // Initialize form when class is selected
  useEffect(() => {
    if (selectedClass && selectedSection && examType) {
      // Get subjects for selected class from the selected exam if available
      const selectedExamForClass = filteredExams.find(exam => exam.examType === examType);
      const subjects = selectedExamForClass?.effectiveSubjects || 
                      classes.find(cls => cls.name === selectedClass)?.subjects || [];
      
      // Initialize subject marks structure
      const initialSubjectMarks = subjects.map(subject => ({
        subjectId: subject.id,
        subjectName: subject.name,
        totalMarks: subject.maxMarks || 100
      }));
      setSubjectMarks(initialSubjectMarks);
      
      // Get students for selected class and section
      const studentsInClass = eligibleStudents.filter(student => 
        student.class === selectedClass && student.section === selectedSection
      );
      
      // Initialize student marks structure with existing data if available
      const initialStudentMarks = studentsInClass.map(student => {
        // Find existing marks for this student and exam type
        const existingMarks = student.marks?.find(mark => mark.examType === examType) || null;
        
        // Create marks structure with existing data or empty values
        const marks = initialSubjectMarks.map(subject => {
          // Try to find existing mark for this subject
          const existingSubjectMark = existingMarks?.marks?.find(m => m.subjectName === subject.subjectName);
          
          return {
            // Include the subject mark ID for proper updates
            id: existingSubjectMark ? existingSubjectMark.id : null,
            subjectId: subject.subjectId,
            subjectName: subject.subjectName,
            marksObtained: existingSubjectMark ? existingSubjectMark.marksObtained : '',
            totalMarks: subject.totalMarks,
            grade: existingSubjectMark ? existingSubjectMark.grade : ''
          };
        });
        
        return {
          studentId: student.id,
          studentName: `${student.firstName} ${student.lastName}`,
          marks: marks,
          // Store reference to existing marks for update purposes
          existingMarksId: existingMarks ? existingMarks.id : null
        };
      });
      
      setStudentMarks(initialStudentMarks);
    }
  }, [selectedClass, selectedSection, examType, eligibleStudents, classes, filteredExams]);

  // Handle marks change for a specific student and subject
  const handleMarksChange = (studentIndex, subjectIndex, value) => {
    const updatedStudentMarks = [...studentMarks];
    const obtained = parseInt(value) || 0;
    const total = updatedStudentMarks[studentIndex].marks[subjectIndex].totalMarks;
    const percentage = total > 0 ? (obtained / total) * 100 : 0;
    
    // Calculate grade based on current configuration
    const grade = calculateGrade(percentage);
    
    updatedStudentMarks[studentIndex].marks[subjectIndex].marksObtained = value;
    updatedStudentMarks[studentIndex].marks[subjectIndex].grade = grade;
    
    setStudentMarks(updatedStudentMarks);
  };

  // Calculate grade based on percentage and grade configuration
  const calculateGrade = (percentage) => {
    // Sort grade config by minPercentage in descending order
    const sortedConfig = [...gradeConfig].sort((a, b) => b.minPercentage - a.minPercentage);
    
    for (let i = 0; i < sortedConfig.length; i++) {
      if (percentage >= sortedConfig[i].minPercentage) {
        return sortedConfig[i].grade;
      }
    }
    
    return 'F'; // Default to fail if no match
  };

  // Calculate totals for a student
  const calculateStudentTotals = (studentMarks) => {
    const totalObtained = studentMarks.reduce((sum, mark) => sum + (parseInt(mark.marksObtained) || 0), 0);
    const totalMarks = studentMarks.reduce((sum, mark) => sum + (parseInt(mark.totalMarks) || 0), 0);
    const percentage = totalMarks > 0 ? ((totalObtained / totalMarks) * 100).toFixed(2) : 0;
    
    // Calculate overall grade
    const overallGrade = calculateGrade(parseFloat(percentage));
    
    return { totalObtained, totalMarks, percentage, overallGrade };
  };

  // Calculate student rankings
  const calculateStudentRankings = (marksheetsData) => {
    // Sort students by percentage in descending order
    const sortedStudents = [...marksheetsData].sort((a, b) => 
      parseFloat(b.percentage) - parseFloat(a.percentage)
    );
    
    // Add position to each student
    return sortedStudents.map((student, index) => ({
      ...student,
      position: index + 1,
      totalStudents: marksheetsData.length
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!selectedClass || !selectedSection || !examType) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Validate that all marks are entered
    const allMarksEntered = studentMarks.every(student => 
      student.marks.every(mark => mark.marksObtained !== '' && mark.marksObtained !== null)
    );
    
    if (!allMarksEntered) {
      alert('Please enter marks for all students and subjects');
      return;
    }
    
    // Prepare data for submission
    const marksheetsData = studentMarks.map(student => {
      const totals = calculateStudentTotals(student.marks);
      return {
        // Use existing ID if available, otherwise generate a new one
        id: student.existingMarksId || `${student.studentId}_${examType}_${Date.now()}`,
        studentId: student.studentId,
        studentName: student.studentName,
        class: selectedClass,
        section: selectedSection,
        examType: examType,
        year: year,
        marks: student.marks,
        ...totals
      };
    });
    
    // Show print preview before saving
    setPreviewData(marksheetsData);
    setShowPrintPreview(true);
  };

  // Handle actual submission after print preview
  const handleFinalSubmit = (marksheetsData) => {
    onSubmit(marksheetsData);
    setShowPrintPreview(false);
    setPreviewData(null);
    // Reset form after submission
    setStep(1);
    setSelectedClass('');
    setSelectedSection('');
    setExamType('');
    setSelectedExam(null);
    setYear(new Date().getFullYear().toString());
    setSubjectMarks([]);
    setStudentMarks([]);
  };

  // Handle print action
  const handlePrint = () => {
    window.print();
  };  // Handle download action (simplified for now)
  const handleDownload = () => {
    // Create a PDF for each student's marksheet
    previewData.forEach((marksheet, index) => {
      // Delay each PDF generation to avoid conflicts
      setTimeout(() => {
        const doc = new jsPDF();
        
        // Add school header
        doc.setFontSize(16);
        doc.text('School Management System', 105, 20, null, null, 'center');
        doc.setFontSize(12);
        doc.text('Student Marksheet', 105, 30, null, null, 'center');
        
        // Add student information
        const student = students.find(s => s.id === marksheet.studentId);
        const studentName = student ? `${student.firstName} ${student.lastName}` : marksheet.studentName;
        
        doc.setFontSize(11);
        doc.text(`Student Name: ${studentName}`, 20, 45);
        doc.text(`Student ID: ${marksheet.studentId}`, 20, 55);
        doc.text(`Class: ${marksheet.class} - Section ${marksheet.section}`, 20, 65);
        doc.text(`Exam: ${marksheet.examType} ${marksheet.year}`, 20, 75);
        
        // Add marks table
        const startY = 85;
        doc.setFontSize(10);
        
        // Table headers
        doc.setFillColor(240, 240, 240);
        doc.rect(20, startY, 170, 10, 'F');
        doc.text('Subject', 25, startY + 7);
        doc.text('Obtained', 85, startY + 7);
        doc.text('Total', 115, startY + 7);
        doc.text('Grade', 145, startY + 7);
        
        // Table rows
        let yPosition = startY + 10;
        marksheet.marks.forEach((subject) => {
          doc.text(subject.subjectName, 25, yPosition + 7);
          doc.text(subject.marksObtained.toString(), 85, yPosition + 7);
          doc.text(subject.totalMarks.toString(), 115, yPosition + 7);
          doc.text(subject.grade, 145, yPosition + 7);
          yPosition += 10;
        });
        
        // Add summary
        yPosition += 10;
        doc.text(`Total Obtained: ${marksheet.totalObtained}`, 20, yPosition);
        doc.text(`Total Marks: ${marksheet.totalMarks}`, 80, yPosition);
        doc.text(`Percentage: ${marksheet.percentage}%`, 140, yPosition);
        
        yPosition += 10;
        doc.text(`Overall Grade: ${marksheet.overallGrade}`, 20, yPosition);
        
        // Save the PDF
        const fileName = `${studentName.replace(/\s+/g, '_')}_${marksheet.examType}_${marksheet.year}_Marksheet.pdf`;
        doc.save(fileName);
      }, index * 1000); // Delay each download by 1 second
    });
  };

  // Handle grade configuration change
  const handleGradeConfigChange = (index, field, value) => {
    const updatedConfig = [...gradeConfig];
    updatedConfig[index][field] = field === 'minPercentage' ? parseFloat(value) : value;
    setGradeConfig(updatedConfig);
  };

  // Add new grade configuration
  const addGradeConfig = () => {
    setGradeConfig([
      ...gradeConfig,
      { minPercentage: 0, grade: '', description: '' }
    ]);
  };

  // Remove grade configuration
  const removeGradeConfig = (index) => {
    if (gradeConfig.length > 1) {
      const updatedConfig = [...gradeConfig];
      updatedConfig.splice(index, 1);
      setGradeConfig(updatedConfig);
    }
  };

  if (showPrintPreview && previewData) {
    // Calculate rankings for preview
    const rankedMarksheets = calculateStudentRankings(previewData);
    
    // Show dedicated print page instead of modal
    return (
      <div className="w-full mx-auto bg-white p-6 max-h-screen flex flex-col">
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <h1 className="text-2xl font-bold text-gray-900 print:hidden">Print Preview - Bulk Marksheets</h1>
          <div className="flex space-x-3">
            <button
              onClick={handlePrint}
              className="print:hidden inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Marksheets
            </button>
            <button
              onClick={handleDownload}
              className="print:hidden inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDFs
            </button>
            <button
              onClick={() => setShowPrintPreview(false)}
              className="print:hidden inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Edit
            </button>
          </div>
        </div>
        
        <div className="flex-grow overflow-y-auto mb-6">
          <BulkMarksheetPrintView
            marksheetsData={previewData}
            studentsData={students}
            classesData={classes}
          />
        </div>
        
        <div className="flex justify-center space-x-4 pt-6 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={() => setShowPrintPreview(false)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Back to Edit
          </button>
          <button
            onClick={() => handleFinalSubmit(previewData)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Save All Marksheets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        Class Exam Marksheet Entry
      </h3>
      
      {/* Step 1: Select class, section, exam type */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaBook className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setSelectedSection('');
                  }}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Class</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.name}>{cls.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaGraduationCap className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={!selectedClass}
                >
                  <option value="">Select Section</option>
                  {classSections.map(section => (
                    <option key={section.id} value={section.name}>{section.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaClipboardList className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={examType}
                  onChange={(e) => {
                    const selectedExamObj = filteredExams.find(exam => exam.examType === e.target.value);
                    setExamType(e.target.value);
                    setSelectedExam(selectedExamObj);
                    if (selectedExamObj) {
                      setYear(selectedExamObj.year || new Date().getFullYear().toString());
                    }
                  }}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Exam Type</option>
                  {filteredExams.map(exam => (
                    <option key={exam.id} value={exam.examType}>
                      {exam.examType} - {exam.class} ({exam.startDate} to {exam.endDate})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input
                type="text"
                value={year}
                readOnly
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
              />
            </div>
          </div>
          
          {selectedClass && selectedSection && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="text-md font-medium text-gray-900 mb-2">
                Students in {selectedClass} - Section {selectedSection}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {filteredStudents.map(student => (
                  <div key={student.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center">
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8" />
                      <div className="ml-2">
                        <div className="text-sm font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="text-xs text-gray-500">ID: {student.id}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {filteredStudents.length === 0 && (
                <p className="text-sm text-gray-600 mt-2">No students found in this class and section</p>
              )}
            </div>
          )}
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (selectedClass && selectedSection && examType && year) {
                  setStep(2);
                } else {
                  alert('Please fill in all required fields');
                }
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={!selectedClass || !selectedSection || !examType || !year}
            >
              Next: Enter Marks
            </button>
          </div>
        </div>
      )}
      
      {/* Step 2: Enter marks for all students */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-lg font-medium text-gray-900">
                Enter Marks for {selectedClass} - Section {selectedSection}
              </h4>
              <p className="text-sm text-gray-600">
                {examType} {year} - {filteredStudents.length} students
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowGradeConfig(!showGradeConfig)}
                className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
              >
                <FaCogs className="mr-1" /> Grade Settings
              </button>
              <button
                onClick={() => setStep(1)}
                className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            </div>
          </div>
          
          {/* Grade Configuration Panel */}
          {showGradeConfig && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h5 className="text-md font-medium text-gray-900 mb-3">Grade Configuration</h5>
              <div className="space-y-3">
                {gradeConfig.map((config, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-3">
                      <label className="text-xs text-gray-600">Min Percentage</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={config.minPercentage}
                        onChange={(e) => handleGradeConfigChange(index, 'minPercentage', e.target.value)}
                        className="block w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="text-xs text-gray-600">Grade</label>
                      <input
                        type="text"
                        value={config.grade}
                        onChange={(e) => handleGradeConfigChange(index, 'grade', e.target.value)}
                        className="block w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div className="col-span-5">
                      <label className="text-xs text-gray-600">Description</label>
                      <input
                        type="text"
                        value={config.description}
                        onChange={(e) => handleGradeConfigChange(index, 'description', e.target.value)}
                        className="block w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div className="col-span-1 flex items-end">
                      <button
                        onClick={() => removeGradeConfig(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                        disabled={gradeConfig.length <= 1}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addGradeConfig}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Add Grade Configuration
                </button>
              </div>
            </div>
          )}
          
          {studentMarks.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50">
                        Student
                      </th>
                      {subjectMarks.map((subject, index) => (
                        <th key={subject.subjectId} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div>{subject.subjectName}</div>
                          <div className="text-xs font-normal text-gray-500">({subject.totalMarks} marks)</div>
                        </th>
                      ))}
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Grade
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {studentMarks.map((student, studentIndex) => {
                      const totals = calculateStudentTotals(student.marks);
                      return (
                        <tr key={student.studentId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-white">
                            <div className="text-sm font-medium text-gray-900">{student.studentName}</div>
                            <div className="text-xs text-gray-500">ID: {student.studentId}</div>
                          </td>
                          {student.marks.map((mark, subjectIndex) => (
                            <td key={mark.subjectId} className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="number"
                                min="0"
                                max={mark.totalMarks}
                                value={mark.marksObtained}
                                onChange={(e) => handleMarksChange(studentIndex, subjectIndex, e.target.value)}
                                className="block w-20 px-2 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                              />
                            </td>
                          ))}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {totals.totalObtained}/{totals.totalMarks}
                            </div>
                            <div className="text-xs text-gray-500">
                              {totals.percentage}%
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              totals.overallGrade === 'A+' ? 'bg-yellow-100 text-yellow-800' :
                              totals.overallGrade === 'A' ? 'bg-green-100 text-green-800' :
                              totals.overallGrade === 'B+' ? 'bg-blue-100 text-blue-800' :
                              totals.overallGrade === 'B' ? 'bg-indigo-100 text-indigo-800' :
                              totals.overallGrade === 'C' ? 'bg-purple-100 text-purple-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {totals.overallGrade}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Next: Configure Grades
            </button>
          </div>
        </div>
      )}
      
      {/* Step 3: Configure grades and review */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-lg font-medium text-gray-900">
                Review and Configure Grades
              </h4>
              <p className="text-sm text-gray-600">
                {examType} {year} - {selectedClass} - Section {selectedSection}
              </p>
            </div>
            <button
              onClick={() => setStep(2)}
              className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          </div>
          
          {/* Grade Configuration Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="text-md font-medium text-gray-900 mb-3">Current Grade Configuration</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {gradeConfig.map((config, index) => (
                <div key={index} className="bg-white p-3 rounded border">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">{config.grade}</span>
                    <span className="text-sm text-gray-600">{config.minPercentage}%+</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{config.description}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Student Rankings Preview */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h5 className="text-md font-medium text-gray-900 mb-4">Student Rankings Preview</h5>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Obtained</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {studentMarks
                    .map(student => {
                      const totals = calculateStudentTotals(student.marks);
                      return {
                        ...student,
                        ...totals
                      };
                    })
                    .sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage))
                    .map((student, index) => (
                      <tr key={student.studentId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {index === 0 && <FaTrophy className="text-yellow-500 mr-2" />}
                            {index === 1 && <FaMedal className="text-gray-400 mr-2" />}
                            {index === 2 && <FaMedal className="text-amber-700 mr-2" />}
                            <span className="font-medium">{index + 1}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{student.studentName}</div>
                          <div className="text-xs text-gray-500">ID: {student.studentId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.totalObtained}/{student.totalMarks}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.percentage}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            student.overallGrade === 'A+' ? 'bg-yellow-100 text-yellow-800' :
                            student.overallGrade === 'A' ? 'bg-green-100 text-green-800' :
                            student.overallGrade === 'B+' ? 'bg-blue-100 text-blue-800' :
                            student.overallGrade === 'B' ? 'bg-indigo-100 text-indigo-800' :
                            student.overallGrade === 'C' ? 'bg-purple-100 text-purple-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {student.overallGrade}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <FaCheck className="mr-2" /> Save and Preview Marksheets
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassExamMarksheetForm;