import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaGraduationCap, FaFilter, FaPrint, FaDownload, FaChartBar, FaUser, FaCalendarAlt, FaBook, FaChartLine, FaTable } from 'react-icons/fa';
import PageHeader from '../common/PageHeader';
import { generateStudentReport, setFilters, addComment, addBehavioralAssessment } from '../../store/reportsSlice';
import AcademicHistory from './AcademicHistory';
import { fetchStudents } from '../../store/studentsSlice';
import { fetchClasses } from '../../store/classesSlice';
import { fetchAllAttendanceRecords } from '../../store/attendanceSlice';
import StudentReportPrintView from './StudentReportPrintView';
import SearchableStudentDropdown from '../common/SearchableStudentDropdown';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const StudentReportGenerator = () => {
  const dispatch = useDispatch();
  const { students } = useSelector(state => state.students);
  const { classes } = useSelector(state => state.classes);
  const { currentReport, loading, error, filters } = useSelector(state => state.reports);
  
  const [localFilters, setLocalFilters] = useState({
    studentId: '',
    class: '',
    startDate: '',
    endDate: '',
    reportType: 'monthly' // weekly, monthly, quarterly, yearly
  });
  
  const [comments, setComments] = useState('');
  const [behavior, setBehavior] = useState('');

  useEffect(() => {
    dispatch(fetchStudents());
    dispatch(fetchClasses());
    dispatch(fetchAllAttendanceRecords());
  }, [dispatch]);

  useEffect(() => {
    if (currentReport) {
      setComments(currentReport.comments || '');
      setBehavior(currentReport.behavior || '');
    }
  }, [currentReport]);

  const handleFilterChange = (field, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGenerateReport = () => {
    // Validate required fields
    if (!localFilters.studentId && !localFilters.class) {
      alert('Please select either a student or a class');
      return;
    }
    
    if (!localFilters.startDate || !localFilters.endDate) {
      alert('Please select both start and end dates');
      return;
    }
    
    // Dispatch action to generate report
    dispatch(generateStudentReport(localFilters));
  };

  const handleSaveComments = () => {
    if (currentReport) {
      dispatch(addComment(comments));
      dispatch(addBehavioralAssessment(behavior));
      alert('Comments and behavioral assessment saved successfully!');
    }
  };

  // Calculate date ranges based on report type
  const calculateDateRange = (reportType) => {
    const today = new Date();
    let startDate, endDate;
    
    switch (reportType) {
      case 'weekly':
        // Get start of current week (Sunday)
        startDate = new Date(today);
        startDate.setDate(today.getDate() - today.getDay());
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        break;
      case 'monthly':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'quarterly':
        const quarter = Math.floor(today.getMonth() / 3);
        startDate = new Date(today.getFullYear(), quarter * 3, 1);
        endDate = new Date(today.getFullYear(), (quarter + 1) * 3, 0);
        break;
      case 'yearly':
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = new Date(today.getFullYear(), 11, 31);
        break;
      default:
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    }
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };

  // Set default date range when report type changes
  useEffect(() => {
    const { startDate, endDate } = calculateDateRange(localFilters.reportType);
    setLocalFilters(prev => ({
      ...prev,
      startDate,
      endDate
    }));
  }, [localFilters.reportType]);

  // Filter students by class
  const filteredStudents = localFilters.class 
    ? students.filter(student => student.class === localFilters.class)
    : students;

  const handlePrintReport = () => {
    if (!currentReport) {
      alert('Please generate a report first');
      return;
    }
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    // Generate HTML content for the report
    const reportHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Student Report - ${currentReport.studentName}</title>
          <meta charset="UTF-8">
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 0;
              padding: 0.5in;
            }
            .header { 
              text-align: center; 
              border-bottom: 2px solid #333; 
              padding-bottom: 10px; 
              margin-bottom: 20px;
            }
            .section { 
              margin-bottom: 20px; 
            }
            .section-title { 
              font-size: 18px; 
              font-weight: bold; 
              margin-bottom: 10px; 
              color: #333;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 20px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: left;
            }
            th { 
              background-color: #f2f2f2; 
              font-weight: bold;
            }
            .stats-grid { 
              display: grid; 
              grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); 
              gap: 10px; 
              margin-bottom: 20px;
            }
            .stat-card { 
              border: 1px solid #ddd; 
              padding: 10px; 
              text-align: center;
            }
            .stat-value { 
              font-size: 24px; 
              font-weight: bold; 
              color: #333;
            }
            .stat-label { 
              font-size: 14px; 
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Student Progress Report</h1>
            <p>Report for ${currentReport.studentName} (${currentReport.class} - ${currentReport.section})</p>
            <p>Period: ${currentReport.period.startDate} to ${currentReport.period.endDate}</p>
            <p>Generated on: ${currentReport.generatedDate}</p>
          </div>
          
          <div class="section">
            <div class="section-title">Attendance Summary</div>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-value">${currentReport.attendance.totalDays}</div>
                <div class="stat-label">Total Days</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${currentReport.attendance.present}</div>
                <div class="stat-label">Present</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${currentReport.attendance.absent}</div>
                <div class="stat-label">Absent</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${currentReport.attendance.late}</div>
                <div class="stat-label">Late</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${currentReport.attendance.leave}</div>
                <div class="stat-label">Leave</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${currentReport.attendance.percentage}%</div>
                <div class="stat-label">Attendance %</div>
              </div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Academic Performance</div>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-value">${currentReport.academicPerformance.overallPercentage}%</div>
                <div class="stat-label">Overall Percentage</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${currentReport.academicPerformance.overallGrade}</div>
                <div class="stat-label">Overall Grade</div>
              </div>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Average</th>
                  <th>Percentage</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                ${currentReport.academicPerformance.subjects.map(subject => `
                  <tr>
                    <td>${subject.subjectName}</td>
                    <td>${subject.averageObtained.toFixed(2)} / ${subject.averageTotal.toFixed(2)}</td>
                    <td>${subject.percentage.toFixed(2)}%</td>
                    <td>${subject.grade}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="section">
            <div class="section-title">Teacher Comments</div>
            <p>${comments || 'No comments provided'}</p>
          </div>
          
          <div class="section">
            <div class="section-title">Behavioral Assessment</div>
            <p>${behavior || 'No assessment provided'}</p>
          </div>
        </body>
      </html>
    `;
    
    // Write the content to the new window
    printWindow.document.write(reportHTML);
    printWindow.document.close();
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const handleDownloadPDF = () => {
    if (!currentReport) {
      alert('Please generate a report first');
      return;
    }
    
    try {
      // Create a new jsPDF instance
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.text('Student Progress Report', 105, 20, null, null, 'center');
      
      // Add student information
      doc.setFontSize(12);
      doc.text(`Student: ${currentReport.studentName}`, 20, 35);
      doc.text(`Class: ${currentReport.class} - ${currentReport.section}`, 20, 45);
      doc.text(`Period: ${currentReport.period.startDate} to ${currentReport.period.endDate}`, 20, 55);
      doc.text(`Generated on: ${currentReport.generatedDate}`, 20, 65);
      
      // Add attendance summary
      doc.setFontSize(16);
      doc.text('Attendance Summary', 20, 80);
      
      doc.setFontSize(12);
      doc.text(`Total Days: ${currentReport.attendance.totalDays}`, 20, 90);
      doc.text(`Present: ${currentReport.attendance.present}`, 20, 100);
      doc.text(`Absent: ${currentReport.attendance.absent}`, 20, 110);
      doc.text(`Late: ${currentReport.attendance.late}`, 20, 120);
      doc.text(`Leave: ${currentReport.attendance.leave}`, 20, 130);
      doc.text(`Attendance %: ${currentReport.attendance.percentage}%`, 20, 140);
      
      // Add academic performance summary
      doc.setFontSize(16);
      doc.text('Academic Performance', 20, 150);
      
      doc.setFontSize(12);
      doc.text(`Overall Percentage: ${currentReport.academicPerformance.overallPercentage}%`, 20, 160);
      doc.text(`Overall Grade: ${currentReport.academicPerformance.overallGrade}`, 20, 170);
      
      // Add subject-wise performance table
      if (currentReport.academicPerformance.subjects.length > 0) {
        doc.autoTable({
          startY: 180,
          head: [['Subject', 'Average', 'Percentage', 'Grade']],
          body: currentReport.academicPerformance.subjects.map(subject => [
            subject.subjectName,
            `${subject.averageObtained.toFixed(2)} / ${subject.averageTotal.toFixed(2)}`,
            `${subject.percentage.toFixed(2)}%`,
            subject.grade
          ]),
          theme: 'grid'
        });
      }
      
      // Add comments section
      const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 200;
      doc.setFontSize(16);
      doc.text('Teacher Comments', 20, finalY + 20);
      
      doc.setFontSize(12);
      const commentsText = comments || 'No comments provided';
      doc.text(commentsText, 20, finalY + 30, { maxWidth: 170 });
      
      // Add behavioral assessment section
      const commentsHeight = commentsText ? doc.getTextDimensions(commentsText, { maxWidth: 170 }).h : 10;
      doc.setFontSize(16);
      doc.text('Behavioral Assessment', 20, finalY + 40 + commentsHeight);
      
      doc.setFontSize(12);
      const behaviorText = behavior || 'No assessment provided';
      doc.text(behaviorText, 20, finalY + 50 + commentsHeight, { maxWidth: 170 });
      
      // Save the PDF
      const filename = `student_report_${currentReport.studentName.replace(/\s+/g, '_')}_${currentReport.generatedDate}.pdf`;
      doc.save(filename);
      
      alert('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  // New function to share report via WhatsApp
  const handleShareViaWhatsApp = async () => {
    if (!currentReport) {
      alert('Please generate a report first');
      return;
    }
    
    // Find the student to get parent contact number
    // First, try to get the latest student data from the API
    try {
      // Re-fetch students to ensure we have the latest data
      await dispatch(fetchStudents());
    } catch (error) {
      console.log('Could not refresh student data, using cached data');
    }
    
    // Get the student from the current state (either refreshed or cached)
    const student = students.find(s => s.id === currentReport.studentId);
    if (!student || !student.parentContact) {
      alert('Parent contact number not found for this student');
      return;
    }
    
    // Format the phone number for WhatsApp app
    // For WhatsApp app, we need to use the international format without the +
    // Pakistani numbers in db.json are stored as 11-digit numbers starting with "0" (e.g., "03337227847")
    // For WhatsApp app, we need to convert to format "923337227847" (without the + sign)
    let phoneNumber = student.parentContact.replace(/\D/g, ''); // Remove all non-digit characters
    
    // Convert Pakistani format (03XXXXXXXXX) to international format (92XXXXXXXXXX) without +
    if (phoneNumber.startsWith('0') && phoneNumber.length === 11) {
      phoneNumber = '92' + phoneNumber.substring(1);
    }
    
    // Create a message with report summary
    // Safely access report data with fallback values
    const studentName = currentReport.studentName || 'Unknown Student';
    const className = currentReport.class || 'Unknown Class';
    const sectionName = currentReport.section || 'Unknown Section';
    const startDate = currentReport.period?.startDate || 'Unknown Date';
    const endDate = currentReport.period?.endDate || 'Unknown Date';
    const generatedDate = currentReport.generatedDate || new Date().toLocaleDateString();
    
    // Attendance data with fallback values
    const attendance = currentReport.attendance || {};
    const attendancePercentage = attendance.percentage !== undefined ? attendance.percentage : 'N/A';
    const presentDays = attendance.present !== undefined ? attendance.present : 'N/A';
    const totalDays = attendance.total !== undefined ? attendance.total : 
                     (attendance.totalDays !== undefined ? attendance.totalDays : 'N/A');
    
    // Academic performance data with fallback values
    const academicPerformance = currentReport.academicPerformance || {};
    const overallPercentage = academicPerformance.overallPercentage !== undefined ? 
                              academicPerformance.overallPercentage : 'N/A';
    const overallGrade = academicPerformance.overallGrade || 'N/A';
    
    const message = `Student Progress Report for ${studentName}\n\n` +
      `Class: ${className} - ${sectionName}\n` +
      `Period: ${startDate} to ${endDate}\n` +
      `Attendance: ${attendancePercentage}% (${presentDays}/${totalDays} days present)\n` +
      `Academic Performance: ${overallPercentage}% (${overallGrade})\n\n` +
      `Please find the detailed report attached.\n` +
      `Generated on: ${generatedDate}`;
    
    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Open WhatsApp with the number and message
    // Note: For WhatsApp app, file attachment is not directly possible
    // User will need to download the PDF separately and attach it manually
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };


  // Group attendance by week for weekly tracking
  const getWeeklyAttendanceData = () => {
    if (!currentReport || !currentReport.attendanceDetails) return [];
    
    const weeklyData = {};
    currentReport.attendanceDetails.forEach(record => {
      const date = new Date(record.date);
      
      // Skip Sundays (day 0)
      if (date.getDay() === 0) {
        return; // Skip this record if it's a Sunday
      }
      
      // Get week start (Sunday)
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          weekStart: weekKey,
          present: 0,
          absent: 0,
          late: 0,
          leave: 0,
          total: 0
        };
      }
      
      switch (record.status) {
        case 'present':
          weeklyData[weekKey].present++;
          break;
        case 'absent':
          weeklyData[weekKey].absent++;
          break;
        case 'late':
          weeklyData[weekKey].late++;
          break;
        case 'leave':
          weeklyData[weekKey].leave++;
          break;
      }
      weeklyData[weekKey].total++;
    });
    
    return Object.values(weeklyData);
  };

  // Group academic performance by subject for trend analysis
  const getSubjectPerformanceTrends = () => {
    if (!currentReport || !currentReport.academicPerformanceDetails) return [];
    
    const subjectTrends = {};
    currentReport.academicPerformanceDetails.forEach(record => {
      record.marks.forEach(subjectMark => {
        if (!subjectTrends[subjectMark.subjectName]) {
          subjectTrends[subjectMark.subjectName] = [];
        }
        subjectTrends[subjectMark.subjectName].push({
          examType: record.examType,
          date: record.date,
          marksObtained: subjectMark.marksObtained,
          totalMarks: subjectMark.totalMarks,
          percentage: (subjectMark.marksObtained / subjectMark.totalMarks) * 100
        });
      });
    });
    
    // Sort by date for each subject
    Object.keys(subjectTrends).forEach(subject => {
      subjectTrends[subject].sort((a, b) => new Date(a.date) - new Date(b.date));
    });
    
    return subjectTrends;
  };

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader 
        title="Student Report Generator" 
        subtitle="Generate comprehensive reports for students and parents with weekly, monthly, and yearly tracking"
      />

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FaBook className="inline mr-1" />
              Report Type
            </label>
            <select
              value={localFilters.reportType}
              onChange={(e) => handleFilterChange('reportType', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FaCalendarAlt className="inline mr-1" />
              Start Date
            </label>
            <input
              type="date"
              value={localFilters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FaCalendarAlt className="inline mr-1" />
              End Date
            </label>
            <input
              type="date"
              value={localFilters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FaUser className="inline mr-1" />
              Class
            </label>
            <select
              value={localFilters.class}
              onChange={(e) => handleFilterChange('class', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Classes</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.name}>{cls.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FaUser className="inline mr-1" />
              Student
            </label>
            <SearchableStudentDropdown
              students={filteredStudents}
              value={localFilters.studentId}
              onChange={(studentId) => handleFilterChange('studentId', studentId)}
              placeholder="Select Student"
              disabled={!localFilters.class}
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <FaFilter className="mr-2" />
                  Generate Report
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Report Preview */}
      {currentReport && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row md:justify-between md:items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-lg font-medium text-gray-900">
                Report for {currentReport.studentName} ({currentReport.class} - {currentReport.section})
              </h2>
              <p className="text-gray-600">
                Period: {currentReport.period.startDate} to {currentReport.period.endDate} 
                ({localFilters.reportType.charAt(0).toUpperCase() + localFilters.reportType.slice(1)} Report)
              </p>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={handlePrintReport}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaPrint className="mr-2" />
                Print
              </button>
              <button 
                onClick={handleDownloadPDF}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaDownload className="mr-2" />
                Download PDF
              </button>
              <button 
                onClick={handleShareViaWhatsApp}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <svg className="mr-2 h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Share via WhatsApp
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {/* Report Header */}
            <div className="mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Student Progress Report</h3>
                  <p className="text-gray-600">Period: {currentReport.period.startDate} to {currentReport.period.endDate}</p>
                  <p className="text-gray-600">Generated on: {currentReport.generatedDate}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-600">GR No: {currentReport.grNo}</p>
                </div>
              </div>
            </div>
            
            {/* Attendance Summary - Adjusted to one row with all 6 cards */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Attendance Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-blue-800">Total Days</div>
                  <div className="text-2xl font-semibold text-blue-900">{currentReport.attendance.totalDays}</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-green-800">Present</div>
                  <div className="text-2xl font-semibold text-green-900">{currentReport.attendance.present}</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-red-800">Absent</div>
                  <div className="text-2xl font-semibold text-red-900">{currentReport.attendance.absent}</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-yellow-800">Late</div>
                  <div className="text-2xl font-semibold text-yellow-900">{currentReport.attendance.late}</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-blue-800">Leave</div>
                  <div className="text-2xl font-semibold text-blue-900">{currentReport.attendance.leave}</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-purple-800">Attendance %</div>
                  <div className="text-2xl font-semibold text-purple-900">{currentReport.attendance.percentage}%</div>
                </div>
              </div>
            </div>
            
            {/* Weekly Attendance Tracking */}
            {localFilters.reportType === 'weekly' && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Weekly Attendance Tracking</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Week Starting</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Present</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Absent</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Late</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance %</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getWeeklyAttendanceData().map((week, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {new Date(week.weekStart).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{week.present}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{week.absent}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{week.late}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{week.leave}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {week.total > 0 ? Math.round((week.present / week.total) * 100) : 0}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Academic Performance - Added explanation */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Academic Performance</h4>
              <p className="text-gray-600 mb-4">
                This section shows the student's academic performance across different subjects. 
                The overall performance percentage is calculated based on the average of all subject scores, 
                and the grade is determined according to the school's grading system.
              </p>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 font-medium">Overall Performance</span>
                  <span className="text-lg font-bold text-gray-900">
                    {currentReport.academicPerformance.overallPercentage}% ({currentReport.academicPerformance.overallGrade})
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-blue-600 h-4 rounded-full" 
                    style={{ width: `${currentReport.academicPerformance.overallPercentage}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentReport.academicPerformance.subjects.map((subject, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{subject.subjectName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {subject.averageObtained.toFixed(2)} / {subject.averageTotal.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subject.percentage.toFixed(2)}%</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {subject.grade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Academic History - Only show for quarterly and yearly reports */}
            {localFilters.reportType !== 'monthly' && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Academic History</h4>
                <p className="text-gray-600 mb-4">
                  This section shows the student's academic performance history across previous years and classes. 
                  It includes overall grades, subject-wise performance, and any remarks from teachers for each academic period.
                </p>
                <AcademicHistory academicHistory={currentReport.academicHistory} />
              </div>
            )}
            
            {/* Teacher Comments */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Teacher Comments</h4>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={4}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your comments about the student's performance..."
              />
            </div>
            
            {/* Behavioral Assessment */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Behavioral Assessment</h4>
              <textarea
                value={behavior}
                onChange={(e) => setBehavior(e.target.value)}
                rows={4}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your assessment of the student's behavior..."
              />
            </div>
            
            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSaveComments}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Save Comments & Assessment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentReportGenerator;