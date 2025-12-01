import React, { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import DatePicker from 'react-datepicker';
import { FaCalendarAlt, FaUserCheck, FaUserTimes, FaSearch, FaSave, FaClock, FaDoorOpen } from 'react-icons/fa';
import PageHeader from '../common/PageHeader';
import { addStaffAttendance, fetchStaffAttendanceByDate } from '../../store/staffSlice';
import { fetchSchoolInfo } from '../../store/settingsSlice';
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

const StaffAttendance = () => {
  const dispatch = useDispatch();
  const { staff, attendanceRecords: storedAttendanceRecords, loading, error } = useSelector(state => state.staff);
  const { schoolInfo } = useSelector(state => state.settings);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [selectedStaff, setSelectedStaff] = useState([]);

  // Get unique departments for dropdown
  const uniqueDepartments = [...new Set(staff.map(member => member.id))];

  // Filter staff based on search term and department
  const filteredStaff = staff.filter(member => {
    const matchesSearch = 
      `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = !selectedDepartment || member.department === selectedDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  // Load existing attendance records for the selected date
  useEffect(() => {
    dispatch(fetchStaffAttendanceByDate(attendanceDate));
  }, [attendanceDate, dispatch]);

  // Fetch school settings when component mounts
  useEffect(() => {
    dispatch(fetchSchoolInfo());
  }, [dispatch]);

  // Initialize attendance records with existing data or defaults
  useEffect(() => {
    const initialAttendance = {};
    
    if (storedAttendanceRecords && storedAttendanceRecords.length > 0) {
      storedAttendanceRecords.forEach(record => {
        if (record.date === attendanceDate) {
          // Ensure record.records is an array before trying to iterate
          const recordsArray = Array.isArray(record.records) ? record.records : [];
          recordsArray.forEach(staffRecord => {
            initialAttendance[staffRecord.staffId] = staffRecord.status;
          });
        }
      });
    }
    
    filteredStaff.forEach(member => {
      if (!initialAttendance[member.id]) {
        initialAttendance[member.id] = 'present';
      }
    });
    
    setAttendanceRecords(initialAttendance);
  }, [storedAttendanceRecords, attendanceDate, filteredStaff.length]);

  // Calculate attendance summary
  const attendanceSummary = useMemo(() => {
    const presentCount = Object.values(attendanceRecords).filter(status => status === 'present').length;
    const absentCount = Object.values(attendanceRecords).filter(status => status === 'absent').length;
    const lateCount = Object.values(attendanceRecords).filter(status => status === 'late').length;
    const leaveCount = Object.values(attendanceRecords).filter(status => status === 'leave').length;
    
    return { presentCount, absentCount, lateCount, leaveCount };
  }, [attendanceRecords]);

  // Set attendance status for a staff member
  const setAttendanceStatus = (staffId, status) => {
    setAttendanceRecords({
      ...attendanceRecords,
      [staffId]: status
    });
  };

  // Handle checkbox selection
  const handleCheckboxChange = (staffId) => {
    setSelectedStaff(prev => 
      prev.includes(staffId) 
        ? prev.filter(id => id !== staffId) 
        : [...prev, staffId]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedStaff.length === filteredStaff.length && filteredStaff.length > 0) {
      setSelectedStaff([]);
    } else {
      setSelectedStaff(filteredStaff.map(member => member.id));
    }
  };

  // Clear selection
  const clearStaffSelection = () => {
    setSelectedStaff([]);
  };

  // Save attendance records
  const saveAttendance = () => {
    const attendanceData = {
      date: attendanceDate,
      records: Object.entries(attendanceRecords).map(([staffId, status]) => ({
        staffId,
        status
      }))
    };
    
    dispatch(addStaffAttendance(attendanceData))
      .then(() => {
        alert(`Attendance records saved for ${Object.keys(attendanceRecords).length} staff members`);
      })
      .catch((error) => {
        alert(`Failed to save attendance: ${error.message || 'Unknown error'}`);
      });
  };

  // Mark selected staff as a specific status
  const markSelectedAs = (status) => {
    if (selectedStaff.length === 0) {
      alert('Please select at least one staff member');
      return;
    }
    
    const updatedAttendance = { ...attendanceRecords };
    selectedStaff.forEach(staffId => {
      updatedAttendance[staffId] = status;
    });
    
    setAttendanceRecords(updatedAttendance);
    setSelectedStaff([]);
  };

  // Mark all as present
  const markAllPresent = () => {
    const newRecords = {};
    filteredStaff.forEach(member => {
      newRecords[member.id] = 'present';
    });
    setAttendanceRecords(newRecords);
  };

  // Mark all as absent
  const markAllAbsent = () => {
    const newRecords = {};
    filteredStaff.forEach(member => {
      newRecords[member.id] = 'absent';
    });
    setAttendanceRecords(newRecords);
  };

  // Mark all as late
  const markAllLate = () => {
    const newRecords = {};
    filteredStaff.forEach(member => {
      newRecords[member.id] = 'late';
    });
    setAttendanceRecords(newRecords);
  };

  // Mark all as leave
  const markAllLeave = () => {
    const newRecords = {};
    filteredStaff.forEach(member => {
      newRecords[member.id] = 'leave';
    });
    setAttendanceRecords(newRecords);
  };

  // Get button class based on status
  const getButtonClass = (staffId, status) => {
    const currentStatus = attendanceRecords[staffId] || 'present';
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
  const [itemsPerPage] = useState(10);

  // Calculate pagination values
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStaff = filteredStaff.slice(indexOfFirstItem, indexOfLastItem);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredStaff.length, selectedDepartment, searchTerm]);

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
      '2025-01-01',
      '2025-02-05',
      '2025-03-23',
      '2025-05-01',
      '2025-08-14',
      '2025-11-09',
      '2025-12-25'
    ];
  }, [schoolInfo]);
  
  // Get vacations from settings or use default
  const schoolVacations = schoolInfo?.vacations || {
    summer: { start: '2025-06-01', end: '2025-07-31' },
    winter: { start: '2025-12-20', end: '2026-01-05' }
  };

  // Helper function to check if a date is within a vacation period
  const isDateInVacation = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    
    if (schoolVacations.summer.start && schoolVacations.summer.end) {
      if (dateStr >= schoolVacations.summer.start && dateStr <= schoolVacations.summer.end) {
        return true;
      }
    }
    
    if (schoolVacations.winter.start && schoolVacations.winter.end) {
      if (dateStr >= schoolVacations.winter.start && dateStr <= schoolVacations.winter.end) {
        return true;
      }
    }
    
    return false;
  };

  // Force styling of holiday dates
  useEffect(() => {
    if (schoolInfo && schoolInfo.holidays && schoolInfo.holidays.length > 0) {
      const timeout = setTimeout(() => {
        const datePickerContainer = document.querySelector('.react-datepicker');
        if (datePickerContainer) {
          const dayElements = datePickerContainer.querySelectorAll('.react-datepicker__day');
          
          dayElements.forEach(element => {
            if (element.classList.contains('react-datepicker__day--disabled')) {
              return;
            }
            
            const dayText = element.textContent;
            if (dayText && attendanceDate) {
              try {
                const [year, month] = attendanceDate.split('-');
                const day = parseInt(dayText, 10);
                
                const paddedMonth = month.padStart(2, '0');
                const paddedDay = day.toString().padStart(2, '0');
                const dateStr = `${year}-${paddedMonth}-${paddedDay}`;
                
                // Check if this date is a holiday (handle both old and new formats)
                const isHoliday = schoolInfo.holidays.some(holiday => {
                  const holidayDate = typeof holiday === 'string' ? holiday : holiday.date;
                  return holidayDate === dateStr;
                });
                
                if (isHoliday) {
                  element.classList.add('react-datepicker__day--disabled');
                  element.style.color = '#cccccc';
                  element.style.backgroundColor = '#f5f5f5';
                  element.style.cursor = 'not-allowed';
                  element.style.textDecoration = 'line-through';
                }
              } catch (e) {
              }
            }
          });
        }
      }, 150);
      
      return () => clearTimeout(timeout);
    }
  }, [schoolInfo, attendanceDate]);

  return (
    <>
      {/* Inject custom styles for DatePicker */}
      <style>{customDatePickerStyles}</style>
      
      <PageHeader
        title="Staff Attendance"
        subtitle="Manage staff attendance manually"
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

      {/* Attendance Controls - MATCH STUDENT LAYOUT */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_2fr] gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Attendance Date</label>
            <div className="relative">
              <div className="absolute z-10 inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaCalendarAlt className="h-5 w-5 text-gray-400" />
              </div>
              <DatePicker
                key={schoolInfo ? `loaded-${JSON.stringify(schoolInfo.holidays || [])}` : "loading"}
                selected={attendanceDate ? (() => {
                  try {
                    const date = new Date(attendanceDate);
                    return isNaN(date.getTime()) ? new Date() : date;
                  } catch (error) {
                    return new Date();
                  }
                })() : new Date()}
                onChange={(date) => {
                  if (date.getDay() === 0) return;
                  const dateString = date.toISOString().split('T')[0];
                  if (schoolHolidays && schoolHolidays.includes(dateString)) return;
                  if (isDateInVacation(date)) return;
                  setAttendanceDate(date.toISOString().split('T')[0]);
                }}
                filterDate={(date) => {
                  if (date.getDay() === 0) return false;
                  const dateString = date.toISOString().split('T')[0];
                  if (schoolHolidays && schoolHolidays.includes(dateString)) return false;
                  if (isDateInVacation(date)) return false;
                  return true;
                }}
                dayClassName={(date) => {
                  const dateString = date.toISOString().split('T')[0];
                  let classes = '';
                  if (date.getDay() === 0) {
                    classes += 'react-datepicker__day--disabled ';
                  }
                  if (schoolHolidays && Array.isArray(schoolHolidays) && schoolHolidays.includes(dateString)) {
                    classes += 'react-datepicker__day--disabled ';
                  }
                  if (isDateInVacation(date)) {
                    classes += 'react-datepicker__day--disabled ';
                  }
                  if (date.getDay() === 0 || date.getDay() === 6) {
                    classes += 'react-datepicker__day--weekend ';
                  }
                  return classes.trim();
                }}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholderText="Select Date"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">Note: Sundays, holidays, and vacation periods are disabled as school is closed</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          {/* Quick Actions - MATCH STUDENT LAYOUT */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Quick Actions</label>
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
              <button
            onClick={markAllLate}
            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-lg text-white bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          >
            <FaClock className="mr-1" /> Mark All Late
          </button>
          <button
            onClick={markAllLeave}
            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FaDoorOpen className="mr-1" /> Mark All Leave
          </button>
            </div>
          </div>
        </div>
        
        {/* Additional Bulk Actions - MATCH STUDENT LAYOUT */}
        <div className="flex flex-wrap gap-2">
          
        </div>
      </div>

      {/* Bulk Selection Actions - MATCH STUDENT LAYOUT */}
      {selectedStaff.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between">
            <div className="text-blue-800 font-medium">
              {selectedStaff.length} staff member{selectedStaff.length !== 1 ? 's' : ''} selected
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
                <FaDoorOpen className="mr-1" /> Mark Leave
              </button>
              <button
                onClick={clearStaffSelection}
                className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Summary Cards - MATCH STUDENT LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-4 text-white">
          <div className="flex items-center">
            <FaUserCheck className="h-8 w-8 mr-3" />
            <div>
              <p className="text-sm font-medium text-green-100">Present</p>
              <p className="text-2xl font-bold">{attendanceSummary.presentCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg p-4 text-white">
          <div className="flex items-center">
            <FaUserTimes className="h-8 w-8 mr-3" />
            <div>
              <p className="text-sm font-medium text-red-100">Absent</p>
              <p className="text-2xl font-bold">{attendanceSummary.absentCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-4 text-white">
          <div className="flex items-center">
            <FaClock className="h-8 w-8 mr-3" />
            <div>
              <p className="text-sm font-medium text-yellow-100">Late</p>
              <p className="text-2xl font-bold">{attendanceSummary.lateCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-4 text-white">
          <div className="flex items-center">
            <FaDoorOpen className="h-8 w-8 mr-3" />
            <div>
              <p className="text-sm font-medium text-blue-100">Leave</p>
              <p className="text-2xl font-bold">{attendanceSummary.leaveCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Attendance Table - MATCH STUDENT LAYOUT */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-wrap items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Staff Attendance ({filteredStaff.length} staff members)
          </h3>
          <div className="flex gap-2 mt-2 sm:mt-0">
            <button
              onClick={handleSelectAll}
              className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
            >
              Select All
            </button>
            <button
              onClick={clearStaffSelection}
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
                    checked={selectedStaff.length > 0 && selectedStaff.length === filteredStaff.length}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentStaff.map((member) => (
                <tr key={member.id} className={`hover:bg-gray-50 ${selectedStaff.includes(member.id) ? 'bg-blue-50' : ''}`}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <input
                      type="checkbox"
                      checked={selectedStaff.includes(member.id)}
                      onChange={() => handleCheckboxChange(member.id)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-indigo-600 flex items-center justify-center text-white font-bold">
                          {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{member.firstName} {member.lastName}</div>
                    <div className="text-sm text-gray-500">{member.email}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {member.department}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {member.position}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setAttendanceStatus(member.id, 'present')}
                        className={getButtonClass(member.id, 'present')}
                      >
                        <FaUserCheck className="mr-1" /> Present
                      </button>
                      <button
                        onClick={() => setAttendanceStatus(member.id, 'absent')}
                        className={getButtonClass(member.id, 'absent')}
                      >
                        <FaUserTimes className="mr-1" /> Absent
                      </button>
                      <button
                        onClick={() => setAttendanceStatus(member.id, 'late')}
                        className={getButtonClass(member.id, 'late')}
                      >
                        <FaClock className="mr-1" /> Late
                      </button>
                      <button
                        onClick={() => setAttendanceStatus(member.id, 'leave')}
                        className={getButtonClass(member.id, 'leave')}
                      >
                        <FaDoorOpen className="mr-1" /> Leave
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredStaff.length === 0 && (
            <div className="text-center py-12">
              <FaCalendarAlt className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No staff members found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
          
          {/* Pagination */}
          {filteredStaff.length > itemsPerPage && (
            <div className="mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                totalItems={filteredStaff.length}
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

export default StaffAttendance;