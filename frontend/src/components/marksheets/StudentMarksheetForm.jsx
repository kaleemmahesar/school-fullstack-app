import React, { useState, useEffect, useMemo } from 'react';
import { FaBook, FaGraduationCap, FaClipboardList, FaCheck, FaCogs } from 'react-icons/fa';
import MarksheetPrintView from './MarksheetPrintView';
import { getCurrentAcademicYear } from '../../utils/dateUtils';

const StudentMarksheetForm = ({ 
  classes, 
  students, 
  exams, // Add exams prop
  onSubmit, 
  onCancel,
  currentMarks
}) => {
  const [step, setStep] = useState(1); // 1: Select student, 2: Enter marks
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [examType, setExamType] = useState('');
  const [selectedExam, setSelectedExam] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [subjectMarks, setSubjectMarks] = useState([]);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  
  // Filter students to only include those in current batch who haven't passed out
  const currentAcademicYear = getCurrentAcademicYear();
  const eligibleStudents = useMemo(() => {
    return students.filter(student => 
      student.academicYear === currentAcademicYear && 
      student.status !== 'passed_out' && 
      student.status !== 'left'
    );
  }, [students, currentAcademicYear]);

  // Get all students for the selected class and section (without academic year filtering)
  const filteredStudents = useMemo(() => {
    return students.filter(student => 
      student.class === selectedClass && student.section === selectedSection
    );
  }, [students, selectedClass, selectedSection]);

  // Get sections for selected class
  const classSections = selectedClass 
    ? classes.find(cls => cls.name === selectedClass)?.sections || []
    : [];
    
  // Get subjects for selected class
  const classSubjects = selectedClass 
    ? classes.find(cls => cls.name === selectedClass)?.subjects || []
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

  // Initialize form when class is selected (only for new marksheets, not when editing)
  useEffect(() => {
    // Only initialize if we're not editing an existing marksheet
    if (selectedClass && !currentMarks) {
      // Get subjects for selected class from the selected exam if available
      const selectedExamForClass = filteredExams.find(exam => exam.examType === examType);
      const subjects = selectedExamForClass?.effectiveSubjects || 
                      classes.find(cls => cls.name === selectedClass)?.subjects || [];
      
      // Initialize subject marks structure
      const initialSubjectMarks = subjects.map(subject => ({
        subjectId: subject.id,
        subjectName: subject.name,
        marksObtained: '',
        totalMarks: subject.maxMarks || 100,
        grade: ''
      }));
      setSubjectMarks(initialSubjectMarks);
    }
  }, [selectedClass, examType, currentMarks]);

  // Update student selection when students change
  useEffect(() => {
    // No need to reset selected student now that we show all students
  }, [students, selectedStudent]);

  // Pre-fill form when currentMarks is provided (for editing)
  useEffect(() => {
    if (currentMarks) {
      // Set form fields based on currentMarks
      setSelectedClass(currentMarks.class || '');
      setSelectedSection(currentMarks.section || '');
      setSelectedStudent(currentMarks.studentId || '');
      setExamType(currentMarks.examType || '');
      setYear(currentMarks.year || new Date().getFullYear().toString());
      
      // Set subject marks
      if (currentMarks.marks && Array.isArray(currentMarks.marks)) {
        setSubjectMarks(currentMarks.marks.map(subject => ({
          subjectId: subject.subjectId || subject.id,
          subjectName: subject.subjectName || subject.name,
          marksObtained: subject.marksObtained !== undefined ? subject.marksObtained : '',
          totalMarks: subject.totalMarks || 100,
          grade: subject.grade || ''
        })));
      }
    }
  }, [currentMarks]);

  // Handle marks change for a specific subject
  const handleMarksChange = (subjectIndex, field, value) => {
    const updatedSubjectMarks = [...subjectMarks];
    
    if (field === 'marksObtained') {
      const obtained = parseInt(value) || 0;
      const total = updatedSubjectMarks[subjectIndex].totalMarks;
      
      // Validate that obtained marks don't exceed total marks
      if (obtained > total) {
        alert(`Obtained marks cannot exceed total marks (${total})`);
        return;
      }
      
      const percentage = total > 0 ? (obtained / total) * 100 : 0;
      
      // Simple grade calculation
      let grade = 'F';
      if (percentage >= 90) grade = 'A+';
      else if (percentage >= 80) grade = 'A';
      else if (percentage >= 70) grade = 'B+';
      else if (percentage >= 60) grade = 'B';
      else if (percentage >= 50) grade = 'C';
      
      updatedSubjectMarks[subjectIndex].marksObtained = value;
      updatedSubjectMarks[subjectIndex].grade = grade;
    } else {
      updatedSubjectMarks[subjectIndex][field] = value;
    }
    
    setSubjectMarks(updatedSubjectMarks);
  };

  // Calculate totals
  const calculateTotals = () => {
    const totalObtained = subjectMarks.reduce((sum, subject) => sum + (parseInt(subject.marksObtained) || 0), 0);
    const totalMarks = subjectMarks.reduce((sum, subject) => sum + (parseInt(subject.totalMarks) || 0), 0);
    const percentage = totalMarks > 0 ? ((totalObtained / totalMarks) * 100).toFixed(2) : 0;
    
    // Calculate overall grade
    let overallGrade = 'F';
    if (percentage >= 90) overallGrade = 'A+';
    else if (percentage >= 80) overallGrade = 'A';
    else if (percentage >= 70) overallGrade = 'B+';
    else if (percentage >= 60) overallGrade = 'B';
    else if (percentage >= 50) overallGrade = 'C';
    
    return { totalObtained, totalMarks, percentage, overallGrade };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!selectedClass || !selectedSection || !selectedStudent || !examType) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Validate that all marks are entered
    const allMarksEntered = subjectMarks.every(subject => 
      subject.marksObtained !== '' && subject.marksObtained !== null
    );
    
    if (!allMarksEntered) {
      alert('Please enter marks for all subjects');
      return;
    }
    
    // Validate that no obtained marks exceed total marks
    const marksValid = subjectMarks.every(subject => {
      const obtained = parseInt(subject.marksObtained) || 0;
      const total = parseInt(subject.totalMarks) || 0;
      return obtained <= total;
    });
    
    if (!marksValid) {
      alert('Obtained marks cannot exceed total marks for any subject');
      return;
    }
    
    const totals = calculateTotals();
    
    // Prepare data for submission
    const marksheetData = {
      id: currentMarks?.id || Date.now().toString(),
      studentId: selectedStudent,
      class: selectedClass,
      section: selectedSection,
      examType: examType,
      year: year,
      marks: subjectMarks,
      ...totals
    };
    
    // Show print preview before saving
    setPreviewData(marksheetData);
    setShowPrintPreview(true);
  };

  // Handle actual submission after print preview
  const handleFinalSubmit = (marksheetData) => {
    onSubmit(marksheetData);
    setShowPrintPreview(false);
    setPreviewData(null);
    // Reset form after submission
    setStep(1);
    setSelectedClass('');
    setSelectedSection('');
    setSelectedStudent('');
    setExamType('');
    setSelectedExam(null);
    setYear(new Date().getFullYear().toString());
    setSubjectMarks([]);
  };

  // Handle print action
  const handlePrint = () => {
    window.print();
  };

  // Handle download action
  const handleDownload = () => {
    alert('In a full implementation, this would download the marksheet as a PDF');
  };

  if (showPrintPreview && previewData) {
    const studentData = students.find(s => s.id === previewData.studentId);
    const classData = classes.find(c => c.name === previewData.class);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Print Preview</h3>
            <button 
              onClick={() => setShowPrintPreview(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="py-4 px-6">
            <MarksheetPrintView
              marksheetData={previewData}
              studentData={studentData}
              classData={classData}
              onPrint={handlePrint}
              onDownload={handleDownload}
            />
            <div className="flex justify-center space-x-4 mt-6">
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
                Save Marksheet
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        {currentMarks ? 'Edit Student Marksheet' : 'Add Student Marksheet'}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                setSelectedStudent('');
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
              onChange={(e) => {
                setSelectedSection(e.target.value);
                setSelectedStudent('');
              }}
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Student *</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaGraduationCap className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={!selectedClass || !selectedSection}
            >
              <option value="">Select Student</option>
              {filteredStudents.map(student => (
                <option key={student.id} value={student.id}>
                  {student.firstName} {student.lastName} (ID: {student.id})
                </option>
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

      {selectedClass && selectedSection && selectedStudent && examType && year && (
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">Enter Marks</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjectMarks.map((subject, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="font-medium text-gray-900">{subject.subjectName}</h5>
                  <span className="text-sm text-gray-500">Total: {subject.totalMarks}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Obtained Marks</label>
                    <input
                      type="number"
                      min="0"
                      max={subject.totalMarks}
                      value={subject.marksObtained}
                      onChange={(e) => handleMarksChange(index, 'marksObtained', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Grade</label>
                    <input
                      type="text"
                      value={subject.grade}
                      readOnly
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Summary */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500">Total Obtained</p>
                <p className="font-bold">{calculateTotals().totalObtained}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Marks</p>
                <p className="font-bold">{calculateTotals().totalMarks}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Percentage</p>
                <p className="font-bold">{calculateTotals().percentage}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Grade</p>
                <p className="font-bold">{calculateTotals().overallGrade}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <FaCheck className="mr-2" /> {currentMarks ? 'Update Marksheet' : 'Save and Preview'}
        </button>
      </div>
    </div>
  );
};

export default StudentMarksheetForm;