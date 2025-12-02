import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaUser, FaBook,FaFilter, FaPrint, FaDownload, FaCalendarAlt, FaChartBar, FaTable } from 'react-icons/fa';
import PageHeader from '../common/PageHeader';
import { fetchStaff } from '../../store/staffSlice';
import SearchableStaffDropdown from '../common/SearchableStaffDropdown';
import { getStaffAttendanceByDateRange } from '../../utils/staffAttendanceApi';

const StaffAttendanceReport = () => {
  const dispatch = useDispatch();
  const { staff, loading, error } = useSelector(state => state.staff);
  
  const [localFilters, setLocalFilters] = useState({
    staffId: '',
    startDate: '',
    endDate: '',
    reportType: 'monthly' // weekly, monthly, quarterly, yearly
  });
  
  const [activeTab, setActiveTab] = useState('summary'); // summary, attendance, charts
  const [currentReport, setCurrentReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchStaff());
  }, [dispatch]);

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

  // Filter staff by department
  const filteredStaff = staff; // Use all staff since we're not filtering by department

  // Get unique departments for dropdown
  // const uniqueDepartments = [...new Set(staff.map(member => member.department))];

  const handleFilterChange = (field, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGenerateReport = async () => {
    // Validate required fields
    if (!localFilters.staffId) {
      alert('Please select a staff member');
      return;
    }
    
    if (!localFilters.startDate || !localFilters.endDate) {
      alert('Please select both start and end dates');
      return;
    }
    
    // Find the selected staff member
    const selectedStaff = staff.find(member => member.id === localFilters.staffId);
    if (!selectedStaff) {
      alert('Selected staff member not found');
      return;
    }
    
    setReportLoading(true);
    
    try {
      // Fetch attendance records within the date range
      const attendanceRecords = await getStaffAttendanceByDateRange(
        localFilters.staffId, 
        localFilters.startDate, 
        localFilters.endDate
      );
      
      // Calculate attendance statistics
      const attendanceStats = calculateAttendanceStats(attendanceRecords);
      
      // Create report object
      const report = {
        staffId: selectedStaff.id,
        staffName: `${selectedStaff.firstName} ${selectedStaff.lastName}`,
        position: selectedStaff.position,
        generatedDate: new Date().toISOString().split('T')[0],
        period: {
          startDate: localFilters.startDate,
          endDate: localFilters.endDate,
          type: localFilters.reportType
        },
        attendance: attendanceStats,
        attendanceDetails: attendanceRecords
      };
      
      setCurrentReport(report);
    } catch (error) {
      console.error('Error generating report:', error);
      alert(`Failed to generate report: ${error.message || 'Unknown error'}`);
    } finally {
      setReportLoading(false);
    }
  };

  // Helper function to calculate attendance statistics
  const calculateAttendanceStats = (attendanceData) => {
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
      switch (record.status) {
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
          <title>Staff Attendance Report - ${currentReport.staffName}</title>
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
            <h1>Staff Attendance Report</h1>
            <p>Report for ${currentReport.staffName} (${currentReport.position})</p>
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
            <div class="section-title">Attendance Details</div>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${currentReport.attendanceDetails.map(record => `
                  <tr>
                    <td>${record.date}</td>
                    <td>${record.status.charAt(0).toUpperCase() + record.status.slice(1)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
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

  // Group attendance by week for weekly tracking
  const getWeeklyAttendanceData = () => {
    if (!currentReport || !currentReport.attendanceDetails) return [];
    
    const weeklyData = {};
    currentReport.attendanceDetails.forEach(record => {
      const date = new Date(record.date);
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

  return (
    <div className="mx-auto">
      <PageHeader 
        title="Staff Attendance Report" 
        subtitle="Generate comprehensive attendance reports for staff members"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Report Type */}
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
          
          {/* Start Date */}
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
          
          {/* End Date */}
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
          
          {/* Staff Member */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FaUser className="inline mr-1" />
              Staff Member
            </label>
            <SearchableStaffDropdown
              staff={filteredStaff}
              value={localFilters.staffId}
              onChange={(staffId) => handleFilterChange('staffId', staffId)}
              placeholder="Select Staff Member"
            />
          </div>
          
          {/* Generate Report Button */}
          <div className="flex items-end">
            <button
              onClick={handleGenerateReport}
              disabled={loading || reportLoading}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading || reportLoading ? (
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
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="">
              <h2 className="text-lg font-medium text-gray-900">
                Report for {currentReport.staffName} ({currentReport.position})
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
            </div>
          </div>

          <div className="p-6">
            {/* Attendance Summary */}
            <div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
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
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-purple-800">Attendance %</div>
                  <div className="text-2xl font-semibold text-purple-900">{currentReport.attendance.percentage}%</div>
                </div>
              </div>
            </div>
            
            {/* Attendance Details */}
            <div>
              {localFilters.reportType === 'weekly' && (
                <div className="mb-6">
                  <h5 className="text-md font-semibold text-gray-900 mb-3">Weekly Attendance Tracking</h5>
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
                          <tr key={week.weekStart}>
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
              
              <div className="mb-6">
                <h5 className="text-md font-semibold text-gray-900 mb-3">Detailed Attendance Records</h5>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentReport.attendanceDetails.map((record, index) => (
                        <tr key={`${record.date}-${record.status}`}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {record.date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              record.status === 'present'
                                ? 'bg-green-100 text-green-800'
                                : record.status === 'absent'
                                ? 'bg-red-100 text-red-800'
                                : record.status === 'late'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffAttendanceReport;