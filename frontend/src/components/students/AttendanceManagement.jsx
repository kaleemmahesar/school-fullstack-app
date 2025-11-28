import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import DatePicker from 'react-datepicker';
import { FaCalendarAlt, FaUserCheck, FaUserTimes, FaSearch, FaSave, FaClock, FaCalendarDay } from 'react-icons/fa';
import PageHeader from '../common/PageHeader';
import { addNewAttendanceRecord, fetchAttendanceByDateAndClass } from '../../store/attendanceSlice';
import { fetchSchoolInfo } from '../../store/settingsSlice'; // Add this import
import Pagination from '../common/Pagination';
import 'react-datepicker/dist/react-datepicker.css';

// Add custom styles for disabled dates
const customDatePickerStyles = `
  .react-datepicker__day--disabled {
    color: #cccccc !important;
    background-color: #f5f5f5 !important;
    cursor: not-allowed !important;
    text-decoration: line-through;
  }
  
  .react-datepicker__day--disabled:hover {
    background-color: #f5f5f5 !important;
    color: #cccccc !important;
  }
`;

const AttendanceManagement = () => {
  const dispatch = useDispatch();
  const { students } = useSelector(state => state.students);
  const { attendanceRecords: storedAttendanceRecords, loading, error } = useSelector(state => state.attendance);
  const { schoolInfo } = useSelector(state => state.settings); // Get school info for holidays
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [selectedStudents, setSelectedStudents] = useState([]); // For bulk selection

  // Get unique classes for dropdown
  const uniqueClasses = useMemo(() => [...new Set(students.map(student => student.class))], [students]);

  
  // Get sections for selected class
  const classSections = useMemo(() => selectedClass 
    ? [...new Set(students
        .filter(student => student.class === selectedClass)
        .map(student => student.section))]
    : [], [students, selectedClass]);

  // Filter students based on search term, class, and section
  const filteredStudents = useMemo(() => students.filter(student => {
    const matchesSearch = 
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.grNo && student.grNo.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesClass = !selectedClass || student.class === selectedClass;
    const matchesSection = !selectedSection || student.section === selectedSection;
    
    return matchesSearch && matchesClass && matchesSection;
  }), [students, searchTerm, selectedClass, selectedSection]);

  // Load existing attendance records for the selected date and class
  useEffect(() => {
    if (selectedDate) {
      // Fetch attendance for the selected date, with or without class filter
      dispatch(fetchAttendanceByDateAndClass({ date: selectedDate, classId: selectedClass || null }));
    }
  }, [selectedClass, selectedDate, dispatch]);

  // Fetch school settings when component mounts
  useEffect(() => {
    dispatch(fetchSchoolInfo());
  }, [dispatch]);

  // Initialize attendance records with existing data or defaults
  useEffect(() => {
    const initialAttendance = {};
    // If we have stored attendance records for this date and class, use them
    if (storedAttendanceRecords && storedAttendanceRecords.length > 0) {
      // The API returns an array, and we need to check each record
      storedAttendanceRecords.forEach(record => {
        // Check if record matches the selected date and class (if class is selected)
        const dateMatches = record.date === selectedDate;
        const classMatches = selectedClass ? record.classId === selectedClass : true;
        
        if (dateMatches && classMatches) {
          // Ensure record.records is an array before trying to iterate
          const recordsArray = Array.isArray(record.records) ? record.records : [];
          recordsArray.forEach(studentRecord => {
            initialAttendance[studentRecord.studentId] = studentRecord.status;
          });
        }
      });
    }
    
    // For any students not in existing records, default to absent
    filteredStudents.forEach(student => {
      if (!initialAttendance.hasOwnProperty(student.id)) {
        initialAttendance[student.id] = 'absent';
      }
    });
    
    setAttendanceRecords(initialAttendance);
  }, [storedAttendanceRecords, selectedDate, selectedClass, filteredStudents]);

  // Handle attendance status change
  const handleAttendanceChange = (studentId, status) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  // Save attendance records
  const saveAttendance = () => {
    if (!selectedClass) {
      alert('Please select a class first');
      return;
    }
    
    // Prepare attendance data for saving
    const attendanceData = {
      date: selectedDate,
      classId: selectedClass,
      records: Object.entries(attendanceRecords).map(([studentId, status]) => ({
        studentId,
        status
      }))
    };
    
    // Dispatch action to save attendance
    dispatch(addNewAttendanceRecord(attendanceData))
      .then(() => {
        alert(`Attendance for ${filteredStudents.length} students saved successfully for ${selectedDate}`);
      })
      .catch((error) => {
        alert(`Failed to save attendance: ${error.message || 'Unknown error'}`);
      });
  };

  // Mark all as present
  const markAllPresent = () => {
    const updatedAttendance = {};
    filteredStudents.forEach(student => {
      updatedAttendance[student.id] = 'present';
    });
    setAttendanceRecords(updatedAttendance);
  };

  // Mark all as absent
  const markAllAbsent = () => {
    const updatedAttendance = {};
    filteredStudents.forEach(student => {
      updatedAttendance[student.id] = 'absent';
    });
    setAttendanceRecords(updatedAttendance);
  };

  // Bulk selection handlers
  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId) 
        : [...prev, studentId]
    );
  };

  const selectAllStudents = () => {
    setSelectedStudents(filteredStudents.map(student => student.id));
  };

  const clearStudentSelection = () => {
    setSelectedStudents([]);
  };

  // Bulk attendance marking
  const markSelectedAs = (status) => {
    if (selectedStudents.length === 0) {
      alert('Please select at least one student');
      return;
    }
    
    const updatedAttendance = { ...attendanceRecords };
    selectedStudents.forEach(studentId => {
      updatedAttendance[studentId] = status;
    });
    
    setAttendanceRecords(updatedAttendance);
    setSelectedStudents([]); // Clear selection after marking
  };
  
  // Get attendance summary
  const getAttendanceSummary = () => {
    const presentCount = Object.values(attendanceRecords).filter(status => status === 'present').length;
    const absentCount = Object.values(attendanceRecords).filter(status => status === 'absent').length;
    const lateCount = Object.values(attendanceRecords).filter(status => status === 'late').length;
    const leaveCount = Object.values(attendanceRecords).filter(status => status === 'leave').length;
    
    return { presentCount, absentCount, lateCount, leaveCount };
  };

  const { presentCount, absentCount, lateCount, leaveCount } = useMemo(getAttendanceSummary, [attendanceRecords]);

  // Get button class based on status
  const getButtonClass = (studentId, status) => {
    // Check if we have a record for this student
    const hasRecord = attendanceRecords.hasOwnProperty(studentId);
    const currentStatus = hasRecord ? attendanceRecords[studentId] : 'absent';
    
    if (currentStatus === status) {
      switch (status) {
        case 'present':
          return 'inline-flex items-center px-3 py-1 border border-green-300 bg-green-100 text-green-800 text-xs font-medium rounded-lg';
        case 'absent':
          return 'inline-flex items-center px-3 py-1 border border-red-300 bg-red-100 text-red-800 text-xs font-medium rounded-lg';
        case 'late':
          return 'inline-flex items-center px-3 py-1 border border-yellow-300 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-lg';
        case 'leave':
          return 'inline-flex items-center px-3 py-1 border border-blue-300 bg-blue-100 text-blue-800 text-xs font-medium rounded-lg';
        default:
          return 'inline-flex items-center px-3 py-1 border border-gray-300 text-gray-700 bg-white text-xs font-medium rounded-lg hover:bg-gray-50';
      }
    }
    return 'inline-flex items-center px-3 py-1 border border-gray-300 text-gray-700 bg-white text-xs font-medium rounded-lg hover:bg-gray-50';
  };

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(40); // Adjust as needed

  // Calculate pagination values
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredStudents.length, selectedClass, selectedSection, searchTerm]);

  // Pagination functions
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // Get holidays from settings or use default
  const schoolHolidays = React.useMemo(() => {
    if (schoolInfo && schoolInfo.holidays && Array.isArray(schoolInfo.holidays) && schoolInfo.holidays.length > 0) {
      return schoolInfo.holidays
        .map(holiday => typeof holiday === 'string' ? holiday : (holiday.date || ''))
        .filter(date => date && typeof date === 'string');
    }
    return [
      '2025-01-01', // New Year's Day
      '2025-02-05', // Kashmir Day
      '2025-03-23', // Pakistan Day
      '2025-05-01', // Labour Day
      '2025-08-14', // Independence Day
      '2025-11-09', // Iqbal Day
      '2025-12-25'  // Quaid-e-Azam Day
    ];
  }, [schoolInfo]);
  
  // Get weekend days from settings or use default (Sunday)
  const weekendDays = React.useMemo(() => {
    if (schoolInfo && schoolInfo.weekendDays && Array.isArray(schoolInfo.weekendDays)) {
      return schoolInfo.weekendDays;
    }
    // Default to Sunday only
    return [0];
  }, [schoolInfo]);
  
  // Get vacations from settings or use default
  const schoolVacations = schoolInfo?.vacations || {
    summer: { start: '2025-06-01', end: '2025-07-31' },
    winter: { start: '2025-12-20', end: '2026-01-05' }
  };

  // Helper function to check if a date is within a vacation period
  const isDateInVacation = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    
    // Check summer vacation
    if (schoolVacations.summer.start && schoolVacations.summer.end) {
      if (dateStr >= schoolVacations.summer.start && dateStr <= schoolVacations.summer.end) {
        return true;
      }
    }
    
    // Check winter vacation
    if (schoolVacations.winter.start && schoolVacations.winter.end) {
      if (dateStr >= schoolVacations.winter.start && dateStr <= schoolVacations.winter.end) {
        return true;
      }
    }
    
    return false;
  };

  // Force styling of holiday dates
  useEffect(() => {
    // Only run this after schoolInfo is loaded
    if (schoolInfo && schoolInfo.holidays && schoolInfo.holidays.length > 0) {
      // Small delay to ensure DatePicker has rendered
      const timeout = setTimeout(() => {
        // Get the date picker container
        const datePickerContainer = document.querySelector('.react-datepicker');
        if (datePickerContainer) {
          // Get all date picker day elements
          const dayElements = datePickerContainer.querySelectorAll('.react-datepicker__day');
          
          dayElements.forEach(element => {
            // Skip if already disabled
            if (element.classList.contains('react-datepicker__day--disabled')) {
              return;
            }
            
            // Try to get the date from the element's attributes or text
            const dayText = element.textContent;
            if (dayText && selectedDate) {
              try {
                // Create a date object for the first day of the selected month
                const [year, month] = selectedDate.split('-');
                const day = parseInt(dayText, 10);
                
                // Create date string in YYYY-MM-DD format
                const paddedMonth = month.padStart(2, '0');
                const paddedDay = day.toString().padStart(2, '0');
                const dateStr = `${year}-${paddedMonth}-${paddedDay}`;
                
                // Check if this date is a holiday (handle both old and new formats)
                const isHoliday = schoolInfo.holidays.some(holiday => {
                  const holidayDate = typeof holiday === 'string' ? holiday : holiday.date;
                  return holidayDate === dateStr;
                });
                
                if (isHoliday) {
                  // Add disabled class
                  element.classList.add('react-datepicker__day--disabled');
                  // Also add inline styles for immediate visual feedback
                  element.style.color = '#cccccc';
                  element.style.backgroundColor = '#f5f5f5';
                  element.style.cursor = 'not-allowed';
                  element.style.textDecoration = 'line-through';
                }
              } catch (e) {
                // Ignore errors in date parsing
              }
            }
          });
        }
      }, 150); // Increased delay to ensure DatePicker is fully rendered
      
      return () => clearTimeout(timeout);
    }
  }, [schoolInfo, selectedDate]);

  return (
    <>
      {/* Inject custom styles for DatePicker */}
      <style>{customDatePickerStyles}</style>
      
      <PageHeader
        title="Attendance Management"
        subtitle="Track student attendance manually"
        actionButton={
          <button
            onClick={saveAttendance}
            disabled={loading}
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-all duration-200 ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <FaSave className="mr-2" /> Save Attendance
              </>
            )}
          </button>
        }
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
              <p className="text-sm text-red-700">Error: {error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Controls */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <div className="relative">
              <div className="absolute z-10 inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaCalendarAlt className="h-5 w-5 text-gray-400" />
              </div>
              <DatePicker
                key={schoolInfo ? `loaded-${JSON.stringify(schoolInfo.holidays || [])}` : "loading"}
                selected={selectedDate ? new Date(selectedDate) : new Date()}
                onChange={(date) => {
                  // Check if selected date is a weekend day
                  if (weekendDays.includes(date.getDay())) return;
                  
                  // Check if selected date is a holiday
                  const dateString = date.toISOString().split('T')[0];
                  if (schoolHolidays && schoolHolidays.includes(dateString)) return;
                  
                  // Check if selected date is in vacation period
                  if (isDateInVacation(date)) return;
                  
                  setSelectedDate(date.toISOString().split('T')[0]);
                }}
                filterDate={(date) => {
                  // Disable weekend days
                  if (weekendDays.includes(date.getDay())) return false;
                  
                  // Disable school holidays
                  const dateString = date.toISOString().split('T')[0];
                  if (schoolHolidays && schoolHolidays.includes(dateString)) return false;
                  
                  // Disable vacation periods
                  if (isDateInVacation(date)) return false;
                  
                  return true;
                }}
                dayClassName={(date) => {
                  // Add special styling for weekend days, holidays, and vacation periods
                  const dateString = date.toISOString().split('T')[0];
                  let classes = '';
                  
                  // Check if it's a weekend day
                  if (weekendDays.includes(date.getDay())) {
                    classes += 'react-datepicker__day--disabled ';
                  }
                  
                  // Check if it's a holiday (using the same logic as filterDate)
                  // Ensure schoolHolidays is properly loaded before checking
                  if (schoolHolidays && Array.isArray(schoolHolidays) && schoolHolidays.includes(dateString)) {
                    classes += 'react-datepicker__day--disabled '; // Use the same class as weekend days
                  }
                  
                  // Check if it's in a vacation period (using the same logic as filterDate)
                  if (isDateInVacation(date)) {
                    classes += 'react-datepicker__day--disabled ';
                  }
                  
                  // Check if it's a weekend (for styling purposes)
                  if (weekendDays.includes(date.getDay())) {
                    classes += 'react-datepicker__day--weekend ';
                  }
                  
                  return classes.trim();
                }}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholderText="Select Date"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">Note: Weekend days, holidays, and vacation periods are disabled as school is closed</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSelectedSection(''); // Reset section when class changes
              }}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Classes</option>
              {uniqueClasses.map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              disabled={!selectedClass}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Sections</option>
              {classSections.map((section) => (
                <option key={section} value={section}>{section}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, GR No, class..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={markAllPresent}
            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-lg text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <FaUserCheck className="mr-1" /> Mark All Present
          </button>
          <button
            onClick={markAllAbsent}
            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-lg text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <FaUserTimes className="mr-1" /> Mark All Absent
          </button>
        </div>
      </div>

      
      {/* Attendance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-4 text-white">
          <div className="flex items-center">
            <FaUserCheck className="h-8 w-8 mr-3" />
            <div>
              <p className="text-sm font-medium text-green-100">Present</p>
              <p className="text-2xl font-bold">{presentCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg p-4 text-white">
          <div className="flex items-center">
            <FaUserTimes className="h-8 w-8 mr-3" />
            <div>
              <p className="text-sm font-medium text-red-100">Absent</p>
              <p className="text-2xl font-bold">{absentCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-4 text-white">
          <div className="flex items-center">
            <FaClock className="h-8 w-8 mr-3" />
            <div>
              <p className="text-sm font-medium text-yellow-100">Late</p>
              <p className="text-2xl font-bold">{lateCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-4 text-white">
          <div className="flex items-center">
            <FaClock className="h-8 w-8 mr-3" />
            <div>
              <p className="text-sm font-medium text-blue-100">Leave</p>
              <p className="text-2xl font-bold">{leaveCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Selection Actions */}
      {selectedStudents.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between">
            <div className="text-blue-800 font-medium">
              {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''} selected
            </div>
            <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
              <button
                onClick={() => markSelectedAs('present')}
                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-lg text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <FaUserCheck className="mr-1" /> Mark Present
              </button>
              <button
                onClick={() => markSelectedAs('absent')}
                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-lg text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <FaUserTimes className="mr-1" /> Mark Absent
              </button>
              <button
                onClick={() => markSelectedAs('late')}
                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-lg text-white bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                <FaClock className="mr-1" /> Mark Late
              </button>
              <button
                onClick={() => markSelectedAs('leave')}
                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaClock className="mr-1" /> Mark Leave
              </button>
              <button
                onClick={clearStudentSelection}
                className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-wrap items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Student Attendance ({filteredStudents.length} students)
          </h3>
          <div className="flex gap-2 mt-2 sm:mt-0">
            <button
              onClick={selectAllStudents}
              className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
            >
              Select All
            </button>
            <button
              onClick={clearStudentSelection}
              className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
            >
              Clear Selection
            </button>
          </div>
        </div>
        
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedStudents.length > 0 && selectedStudents.length === filteredStudents.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        selectAllStudents();
                      } else {
                        clearStudentSelection();
                      }
                    }}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GR No</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentStudents.map((student) => (
                <tr key={student.id} className={`hover:bg-gray-50 ${selectedStudents.includes(student.id) ? 'bg-blue-50' : ''}`}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => toggleStudentSelection(student.id)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10 flex items-center justify-center">
                        <img src={student.photo} alt={student.firstName} className="w-10 h-10 rounded-xl" />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {student.grNo ? student.grNo.replace('GR', '') : 'N/A'}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{student.firstName} {student.lastName}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.class}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.section}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAttendanceChange(student.id, 'present')}
                        className={getButtonClass(student.id, 'present')}
                      >
                        <FaUserCheck className="mr-1" /> Present
                      </button>
                      <button
                        onClick={() => handleAttendanceChange(student.id, 'absent')}
                        className={getButtonClass(student.id, 'absent')}
                      >
                        <FaUserTimes className="mr-1" /> Absent
                      </button>
                      <button
                        onClick={() => handleAttendanceChange(student.id, 'late')}
                        className={getButtonClass(student.id, 'late')}
                      >
                        <FaClock className="mr-1" /> Late
                      </button>
                      <button
                        onClick={() => handleAttendanceChange(student.id, 'leave')}
                        className={getButtonClass(student.id, 'leave')}
                      >
                        <FaClock className="mr-1" /> Leave
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <FaCalendarAlt className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
          
          {/* Pagination */}
          {filteredStudents.length > itemsPerPage && (
            <div className="mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                totalItems={filteredStudents.length}
                paginate={paginate}
                nextPage={nextPage}
                prevPage={prevPage}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AttendanceManagement;