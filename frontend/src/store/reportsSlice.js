import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { 
  fetchAttendanceByStudent,
  fetchAllAttendanceRecords
} from './attendanceSlice';
import { 
  selectStudentById 
} from './studentsSelectors';
import { 
  fetchMarks 
} from './marksSlice';

// Initial state
const initialState = {
  reports: [],
  currentReport: null,
  loading: false,
  error: null,
  filters: {
    studentId: '',
    class: '',
    academicYear: '', // Add academic year filter
    startDate: '',
    endDate: '',
    reportType: 'monthly', // weekly, monthly, quarterly, yearly
    reportPeriod: '' // specific month, quarter, or year
  }
};

// Async thunk to generate student report
export const generateStudentReport = createAsyncThunk(
  'reports/generateStudentReport',
  async (reportParams, { getState, rejectWithValue }) => {
    try {
      const { studentId, startDate, endDate, class: className, academicYear, reportType } = reportParams;
      
      // Get state
      const state = getState();
      
      // Get student data
      let student = null;
      if (studentId) {
        student = selectStudentById(state, studentId);
      } else if (className) {
        // For class reports, we'll handle this differently
        student = null;
      }
      
      // Get academic history data
      const academicHistory = student && student.academicHistory ? student.academicHistory : [];
      
      // Get attendance data for student
      let attendanceData = [];
      let attendanceDetails = [];
      if (studentId) {
        // Filter attendance records for the specific student, date range, and academic year
        attendanceData = state.attendance.attendanceRecords.filter(record => 
          record.records.some(r => r.studentId === studentId) &&
          record.date >= startDate && 
          record.date <= endDate &&
          (academicYear ? record.academicYear === academicYear : true)
        );
        
        // Get detailed attendance records, excluding Sundays
        attendanceDetails = attendanceData.flatMap(record => {
          // Skip Sundays (day 0)
          const recordDate = new Date(record.date);
          if (recordDate.getDay() === 0) {
            return []; // Skip this record if it's a Sunday
          }
          
          return record.records
            .filter(r => r.studentId === studentId)
            .map(r => ({
              date: record.date,
              status: r.status,
              classId: record.classId,
              academicYear: record.academicYear // Include academic year
            }));
        });
      }
      
      // Get marks data for student
      let marksData = [];
      let academicPerformanceDetails = [];
      if (studentId) {
        marksData = state.marks.marks.filter(mark => 
          mark.studentId === studentId &&
          (academicYear ? mark.academicYear === academicYear : true) &&
          mark.year >= new Date(startDate).getFullYear().toString() && 
          mark.year <= new Date(endDate).getFullYear().toString()
        );
        
        // Get detailed academic performance records
        academicPerformanceDetails = marksData;
      }
      
      // Calculate attendance statistics
      const attendanceStats = calculateAttendanceStats(attendanceData, studentId);
      
      // Calculate academic performance
      const academicPerformance = calculateAcademicPerformance(marksData);
      
      // Create report object
      const report = {
        id: Date.now().toString(),
        studentId: studentId,
        studentName: student ? `${student.firstName} ${student.lastName}` : 'Class Report',
        class: student ? student.class : className,
        section: student ? student.section : '',
        academicYear: academicYear || 'All Years', // Include academic year
        generatedDate: new Date().toISOString().split('T')[0],
        period: {
          startDate,
          endDate,
          type: reportType
        },
        attendance: attendanceStats,
        attendanceDetails, // Detailed attendance records for weekly tracking
        academicPerformance,
        academicPerformanceDetails, // Detailed academic records for trend analysis
        academicHistory, // Academic history records
        comments: '', // This would be filled by teachers
        behavior: ''  // This would be filled by teachers
      };
      
      return report;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to generate student report');
    }
  }
);

// Async thunk to generate class report
export const generateClassReport = createAsyncThunk(
  'reports/generateClassReport',
  async (reportParams, { getState, rejectWithValue }) => {
    try {
      const { className, academicYear, startDate, endDate, reportType } = reportParams;
      
      // Get state
      const state = getState();
      
      // Get students in the class
      const studentsInClass = state.students.students.filter(student => 
        student.class === className &&
        (academicYear ? student.academicYear === academicYear : true)
      );
      
      // Get attendance data for the class
      let attendanceData = state.attendance.attendanceRecords.filter(record => 
        record.classId === className &&
        record.date >= startDate && 
        record.date <= endDate &&
        (academicYear ? record.academicYear === academicYear : true)
      );
      
      // Get detailed attendance records, excluding Sundays
      const attendanceDetails = attendanceData.flatMap(record => {
        // Skip Sundays (day 0)
        const recordDate = new Date(record.date);
        if (recordDate.getDay() === 0) {
          return []; // Skip this record if it's a Sunday
        }
        
        return record.records.map(r => ({
          date: record.date,
          studentId: r.studentId,
          status: r.status,
          classId: record.classId,
          academicYear: record.academicYear // Include academic year
        }));
      });
      
      // Get marks data for the class
      let marksData = state.marks.marks.filter(mark => 
        mark.class === className &&
        (academicYear ? mark.academicYear === academicYear : true) &&
        mark.year >= new Date(startDate).getFullYear().toString() && 
        mark.year <= new Date(endDate).getFullYear().toString()
      );
      
      // Calculate class attendance statistics
      const classAttendanceStats = calculateClassAttendanceStats(attendanceData, studentsInClass);
      
      // Calculate class academic performance
      const classAcademicPerformance = calculateClassAcademicPerformance(marksData);
      
      // Create report object
      const report = {
        id: `class-report-${Date.now()}`,
        className: className,
        academicYear: academicYear || 'All Years', // Include academic year
        generatedDate: new Date().toISOString().split('T')[0],
        period: {
          startDate,
          endDate,
          type: reportType
        },
        studentCount: studentsInClass.length,
        attendance: classAttendanceStats,
        attendanceDetails, // Detailed attendance records
        academicPerformance: classAcademicPerformance,
        comments: '', // This would be filled by teachers
      };
      
      return report;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to generate class report');
    }
  }
);

// Helper function to calculate attendance statistics
const calculateAttendanceStats = (attendanceData, studentId) => {
  if (!attendanceData || attendanceData.length === 0) {
    return {
      totalDays: 0,
      present: 0,
      absent: 0,
      late: 0,
      leave: 0,
      percentage: 0
    };
  }
  
  let present = 0;
  let absent = 0;
  let late = 0;
  let leave = 0;
  
  attendanceData.forEach(record => {
    // Skip Sundays (day 0)
    const recordDate = new Date(record.date);
    if (recordDate.getDay() === 0) {
      return; // Skip this record if it's a Sunday
    }
    
    const studentRecord = record.records.find(r => r.studentId === studentId);
    if (studentRecord) {
      switch (studentRecord.status) {
        case 'present':
          present++;
          break;
        case 'absent':
          absent++;
          break;
        case 'late':
          late++;
          break;
        case 'leave':
          leave++;
          break;
      }
    }
  });
  
  const totalDays = present + absent + late + leave;
  const percentage = totalDays > 0 ? Math.round((present / totalDays) * 100) : 0;
  
  return {
    totalDays,
    present,
    absent,
    late,
    leave,
    percentage
  };
};

// Helper function to calculate class attendance statistics
const calculateClassAttendanceStats = (attendanceData, studentsInClass) => {
  if (!attendanceData || attendanceData.length === 0 || !studentsInClass || studentsInClass.length === 0) {
    return {
      totalDays: 0,
      present: 0,
      absent: 0,
      late: 0,
      leave: 0,
      percentage: 0,
      studentAttendance: []
    };
  }
  
  // Initialize student attendance tracking
  const studentAttendance = studentsInClass.map(student => ({
    studentId: student.id,
    studentName: `${student.firstName} ${student.lastName}`,
    present: 0,
    absent: 0,
    late: 0,
    leave: 0,
    total: 0,
    percentage: 0
  }));
  
  let totalClassDays = 0;
  
  attendanceData.forEach(record => {
    // Skip Sundays (day 0)
    const recordDate = new Date(record.date);
    if (recordDate.getDay() === 0) {
      return; // Skip this record if it's a Sunday
    }
    
    totalClassDays++;
    
    // Update each student's attendance
    studentAttendance.forEach(studentRecord => {
      const attendanceRecord = record.records.find(r => r.studentId === studentRecord.studentId);
      if (attendanceRecord) {
        switch (attendanceRecord.status) {
          case 'present':
            studentRecord.present++;
            break;
          case 'absent':
            studentRecord.absent++;
            break;
          case 'late':
            studentRecord.late++;
            break;
          case 'leave':
            studentRecord.leave++;
            break;
        }
        studentRecord.total++;
      }
    });
  });
  
  // Calculate percentages
  studentAttendance.forEach(student => {
    student.percentage = student.total > 0 ? Math.round((student.present / student.total) * 100) : 0;
  });
  
  // Calculate overall class statistics
  const totalPresent = studentAttendance.reduce((sum, student) => sum + student.present, 0);
  const totalAbsent = studentAttendance.reduce((sum, student) => sum + student.absent, 0);
  const totalLate = studentAttendance.reduce((sum, student) => sum + student.late, 0);
  const totalLeave = studentAttendance.reduce((sum, student) => sum + student.leave, 0);
  const totalRecords = totalPresent + totalAbsent + totalLate + totalLeave;
  
  const classPercentage = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0;
  
  return {
    totalDays: totalClassDays,
    present: totalPresent,
    absent: totalAbsent,
    late: totalLate,
    leave: totalLeave,
    percentage: classPercentage,
    studentAttendance
  };
};

// Helper function to calculate academic performance
const calculateAcademicPerformance = (marksData) => {
  if (!marksData || marksData.length === 0) {
    return {
      subjects: [],
      overallPercentage: 0,
      overallGrade: '',
      totalObtained: 0,
      totalMarks: 0
    };
  }
  
  // Aggregate subject performance
  const subjectPerformance = {};
  
  marksData.forEach(mark => {
    mark.marks.forEach(subjectMark => {
      if (!subjectPerformance[subjectMark.subjectName]) {
        subjectPerformance[subjectMark.subjectName] = {
          subjectName: subjectMark.subjectName,
          totalObtained: 0,
          totalMarks: 0,
          examCount: 0
        };
      }
      
      subjectPerformance[subjectMark.subjectName].totalObtained += subjectMark.marksObtained;
      subjectPerformance[subjectMark.subjectName].totalMarks += subjectMark.totalMarks;
      subjectPerformance[subjectMark.subjectName].examCount++;
    });
  });
  
  // Calculate averages for each subject
  const subjects = Object.values(subjectPerformance).map(subject => {
    const averageObtained = subject.totalObtained / subject.examCount;
    const averageTotal = subject.totalMarks / subject.examCount;
    const percentage = averageTotal > 0 ? (averageObtained / averageTotal) * 100 : 0;
    const grade = calculateGrade(percentage);
    
    return {
      subjectName: subject.subjectName,
      averageObtained: Math.round(averageObtained * 100) / 100,
      averageTotal: Math.round(averageTotal * 100) / 100,
      percentage: Math.round(percentage * 100) / 100,
      grade
    };
  });
  
  // Calculate overall performance
  const totalObtained = subjects.reduce((sum, subject) => sum + subject.averageObtained, 0);
  const totalMarks = subjects.reduce((sum, subject) => sum + subject.averageTotal, 0);
  const overallPercentage = totalMarks > 0 ? (totalObtained / totalMarks) * 100 : 0;
  const overallGrade = calculateGrade(overallPercentage);
  
  return {
    subjects,
    overallPercentage: Math.round(overallPercentage * 100) / 100,
    overallGrade,
    totalObtained: Math.round(totalObtained * 100) / 100,
    totalMarks: Math.round(totalMarks * 100) / 100
  };
};

// Helper function to calculate class academic performance
const calculateClassAcademicPerformance = (marksData) => {
  if (!marksData || marksData.length === 0) {
    return {
      subjects: [],
      overallPercentage: 0,
      overallGrade: '',
      totalObtained: 0,
      totalMarks: 0,
      studentPerformance: []
    };
  }
  
  // Group marks by student
  const studentMarks = {};
  marksData.forEach(mark => {
    if (!studentMarks[mark.studentId]) {
      studentMarks[mark.studentId] = {
        studentId: mark.studentId,
        studentName: mark.studentName,
        marks: []
      };
    }
    studentMarks[mark.studentId].marks.push(mark);
  });
  
  // Calculate individual student performance
  const studentPerformance = Object.values(studentMarks).map(student => {
    const performance = calculateAcademicPerformance(student.marks);
    return {
      studentId: student.studentId,
      studentName: student.studentName,
      ...performance
    };
  });
  
  // Aggregate subject performance across all students
  const subjectPerformance = {};
  
  marksData.forEach(mark => {
    mark.marks.forEach(subjectMark => {
      if (!subjectPerformance[subjectMark.subjectName]) {
        subjectPerformance[subjectMark.subjectName] = {
          subjectName: subjectMark.subjectName,
          totalObtained: 0,
          totalMarks: 0,
          examCount: 0
        };
      }
      
      subjectPerformance[subjectMark.subjectName].totalObtained += subjectMark.marksObtained;
      subjectPerformance[subjectMark.subjectName].totalMarks += subjectMark.totalMarks;
      subjectPerformance[subjectMark.subjectName].examCount++;
    });
  });
  
  // Calculate averages for each subject
  const subjects = Object.values(subjectPerformance).map(subject => {
    const averageObtained = subject.totalObtained / subject.examCount;
    const averageTotal = subject.totalMarks / subject.examCount;
    const percentage = averageTotal > 0 ? (averageObtained / averageTotal) * 100 : 0;
    const grade = calculateGrade(percentage);
    
    return {
      subjectName: subject.subjectName,
      averageObtained: Math.round(averageObtained * 100) / 100,
      averageTotal: Math.round(averageTotal * 100) / 100,
      percentage: Math.round(percentage * 100) / 100,
      grade
    };
  });
  
  // Calculate overall class performance
  const totalObtained = subjects.reduce((sum, subject) => sum + subject.averageObtained, 0);
  const totalMarks = subjects.reduce((sum, subject) => sum + subject.averageTotal, 0);
  const overallPercentage = totalMarks > 0 ? (totalObtained / totalMarks) * 100 : 0;
  const overallGrade = calculateGrade(overallPercentage);
  
  return {
    subjects,
    overallPercentage: Math.round(overallPercentage * 100) / 100,
    overallGrade,
    totalObtained: Math.round(totalObtained * 100) / 100,
    totalMarks: Math.round(totalMarks * 100) / 100,
    studentPerformance
  };
};

// Helper function to calculate grade based on percentage
const calculateGrade = (percentage) => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  return 'F';
};

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetReports: () => initialState,
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    updateCurrentReport: (state, action) => {
      state.currentReport = action.payload;
    },
    addComment: (state, action) => {
      if (state.currentReport) {
        state.currentReport.comments = action.payload;
      }
    },
    addBehavioralAssessment: (state, action) => {
      if (state.currentReport) {
        state.currentReport.behavior = action.payload;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Generate student report
      .addCase(generateStudentReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateStudentReport.fulfilled, (state, action) => {
        state.loading = false;
        state.currentReport = action.payload;
        // Add to reports list
        state.reports.push(action.payload);
      })
      .addCase(generateStudentReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      // Generate class report
      .addCase(generateClassReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateClassReport.fulfilled, (state, action) => {
        state.loading = false;
        state.currentReport = action.payload;
        // Add to reports list
        state.reports.push(action.payload);
      })
      .addCase(generateClassReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });
  }
});

export const { 
  clearError, 
  resetReports, 
  setFilters, 
  updateCurrentReport,
  addComment,
  addBehavioralAssessment
} = reportsSlice.actions;

export default reportsSlice.reducer;