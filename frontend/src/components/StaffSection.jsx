import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchStaff, addStaff, updateStaff, deleteStaff, addStaffAdvance, payStaffSalary } from '../store/staffSlice';
import { fetchClasses } from '../store/classesSlice';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaChalkboardTeacher, FaUser, FaPhone, FaCalendar, FaDollarSign, FaBriefcase, FaMoneyBillWave, FaCamera, FaDownload, FaPrint } from 'react-icons/fa';
import PageHeader from './common/PageHeader';
import StaffFormModal from './StaffFormModal';
import StaffFinancialModal from './StaffFinancialModal';
import StaffDetailsModal from './StaffDetailsModal';
import Pagination from './common/Pagination';

const StaffSection = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { staff, loading, error } = useSelector(state => state.staff);
  const { classes } = useSelector(state => state.classes);
  const [searchTerm, setSearchTerm] = useState('');
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showFinancialModal, setShowFinancialModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentStaff, setCurrentStaff] = useState(null);
  const [selectedStaffForFinance, setSelectedStaffForFinance] = useState(null);
  const [selectedStaffForDetails, setSelectedStaffForDetails] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  React.useEffect(() => {
    dispatch(fetchStaff());
    dispatch(fetchClasses());
  }, [dispatch]);

  const handleEdit = (staffMember) => {
    setCurrentStaff(staffMember);
    setShowStaffModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      dispatch(deleteStaff(id));
    }
  };

  const handleStaffSubmit = (staffData) => {
    if (currentStaff) {
      dispatch(updateStaff({ ...currentStaff, ...staffData }));
    } else {
      dispatch(addStaff(staffData));
    }
    setShowStaffModal(false);
    setCurrentStaff(null);
  };

  const handleFinancialAction = (staffMember) => {
    setSelectedStaffForFinance(staffMember);
    setShowFinancialModal(true);
  };

  const handleViewDetails = (staffMember) => {
    setSelectedStaffForDetails(staffMember);
    setShowDetailsModal(true);
  };

  const handleAddAdvance = (advanceData) => {
    dispatch(addStaffAdvance(advanceData));
  };

  const handlePaySalary = (salaryData) => {
    dispatch(payStaffSalary(salaryData));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setCurrentPage(1); // Reset to first page when clearing filters
  };

  // Export to CSV function
  const exportToCSV = () => {
    const csvContent = [
      ['Name', 'Position', 'Subject', 'Salary', 'Allowances', 'Total Monthly', 'Date of Joining', 'Phone', 'Email'],
      ...filteredStaff.map(member => {
        // Calculate monthly total (salary + allowances)
        const totalAllowances = (member.allowances || []).reduce((sum, allowance) => {
          return sum + parseFloat(allowance.amount || 0);
        }, 0);
        const monthlyTotal = parseFloat(member.salary || 0) + totalAllowances;
        
        return [
          `"${member.firstName} ${member.lastName}"`,
          member.position,
          member.subject || '',
          member.salary || 0,
          totalAllowances,
          monthlyTotal,
          member.dateOfJoining,
          member.phone || '',
          member.email || ''
        ];
      })
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'staff_report.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print report function
  const printReport = () => {
    window.print();
  };

  const filteredStaff = staff.filter(member =>
    (member.firstName && member.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (member.lastName && member.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (member.position && member.position.toLowerCase().includes(searchTerm.toLowerCase()))
  ).sort((a, b) => {
    // Sort by date of joining in descending order (newest first)
    return new Date(b.dateOfJoining) - new Date(a.dateOfJoining);
  });

  // Calculate total monthly salary expenses (including allowances for current month only)
  const totalMonthlySalary = staff.reduce((sum, member) => {
    const allowances = (member.allowances || []).reduce((allowanceSum, allowance) => {
      return allowanceSum + parseFloat(allowance.amount || 0);
    }, 0);
    return sum + parseFloat(member.salary || 0) + allowances;
  }, 0);

  // Calculate total advances taken by all staff
  const totalAdvances = staff.reduce((sum, member) => {
    const salaryHistory = member.salaryHistory || [];
    const advances = salaryHistory.reduce((advanceSum, record) => {
      // Advances are identified by 'advance' status
      // Advances are negative values, so we negate to show as positive in UI
      return advanceSum + (record.status === 'advance' ? Math.abs(parseFloat(record.netSalary || 0)) : 0);
    }, 0);
    return sum + advances;
  }, 0);

  // Calculate total amount paid to all staff (historical total)
  // This includes both salary payments and advances given to staff
  const totalPaidSalaries = staff.reduce((sum, member) => {
    const salaryHistory = member.salaryHistory || [];
    const paid = salaryHistory.reduce((paidSum, record) => {
      if (record.status === 'paid') {
        // Salary payments are positive amounts paid to staff
        return paidSum + Math.abs(parseFloat(record.netSalary || 0));
      } else if (record.status === 'advance') {
        // Advances are negative amounts (money given to staff), so we add the absolute value
        return paidSum + Math.abs(parseFloat(record.netSalary || 0));
      }
      return paidSum;
    }, 0);
    return sum + paid;
  }, 0);

  // Calculate total expected salaries based on joining date (full months worked)
  const totalExpectedSalaries = staff.reduce((sum, member) => {
    // Calculate months since joining
    const joiningDate = new Date(member.dateOfJoining);
    const currentDate = new Date();
    
    // Calculate total months worked with partial month calculation
    // Get the difference in milliseconds and convert to months
    const timeDiff = currentDate.getTime() - joiningDate.getTime();
    const daysDiff = timeDiff / (1000 * 3600 * 24);
    
    // Calculate months including partial months
    // We consider a month as 30 days for simplicity
    let totalMonths = daysDiff / 30;
    
    // Ensure we don't have negative months
    totalMonths = Math.max(0, totalMonths);
    
    // Calculate monthly total (salary + allowances)
    const allowances = (member.allowances || []).reduce((allowanceSum, allowance) => {
      return allowanceSum + parseFloat(allowance.amount || 0);
    }, 0);
    const monthlyTotal = parseFloat(member.salary || 0) + allowances;
    
    // Total expected = total months worked * monthly salary
    return sum + (totalMonths * monthlyTotal);
  }, 0);

  // Calculate true pending amount (expected - paid)
  const totalPendingSalaries = totalExpectedSalaries - totalPaidSalaries;

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStaffList = filteredStaff.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  if (error) return <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
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
  </div>;

  return (
    <>
      <PageHeader
        title="Staff Management"
        subtitle="Manage staff members, positions, and salaries"
        actionButton={
          <div className="flex space-x-2">
            <button
              onClick={exportToCSV}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <FaDownload className="mr-2" /> Export CSV
            </button>
            <button
              onClick={printReport}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <FaPrint className="mr-2" /> Print
            </button>
            <button
              onClick={() => {
                setCurrentStaff(null);
                setShowStaffModal(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              <FaPlus className="mr-2" /> Add Staff
            </button>
          </div>
        }
      />

      {/* Summary Statistics */}
      <div className="my-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs font-medium">Total Staff</p>
                <p className="text-2xl font-bold mt-1">{staff.length}</p>
              </div>
              <div className="p-2 bg-blue-400 bg-opacity-30 rounded-full">
                <FaChalkboardTeacher size={20} />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-xs font-medium">Monthly Payroll</p>
                <p className="text-2xl font-bold mt-1">Rs {Math.round(totalMonthlySalary)}</p>
              </div>
              <div className="p-2 bg-green-400 bg-opacity-30 rounded-full">
                <FaDollarSign size={20} />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl shadow p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-xs font-medium">Advances Taken</p>
                <p className="text-2xl font-bold mt-1">Rs {Math.round(totalAdvances)}</p>
              </div>
              <div className="p-2 bg-yellow-400 bg-opacity-30 rounded-full">
                <FaMoneyBillWave size={20} />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-xs font-medium">Total Pending</p>
                <p className="text-2xl font-bold mt-1">Rs {Math.round(totalPendingSalaries)}</p>
              </div>
              <div className="p-2 bg-purple-400 bg-opacity-30 rounded-full">
                <FaBriefcase size={20} />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl shadow p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100 text-xs font-medium">Total Paid Ever</p>
                <p className="text-2xl font-bold mt-1">Rs {Math.round(totalPaidSalaries)}</p>
              </div>
              <div className="p-2 bg-teal-400 bg-opacity-30 rounded-full">
                <FaDollarSign size={20} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Table with Filters */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Search and Filters */}
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-grow max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name or position..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
        
        {/* Staff Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentStaffList.length > 0 ? (
                currentStaffList.map((member) => {
                  // Calculate monthly total (salary + allowances)
                  const totalAllowances = (member.allowances || []).reduce((sum, allowance) => {
                    return sum + parseFloat(allowance.amount || 0);
                  }, 0);
                  const monthlyTotal = parseFloat(member.salary || 0) + totalAllowances;
                  
                  return (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {member.photo ? (
                            <img 
                              src={member.photo} 
                              alt={`${member.firstName} ${member.lastName}`} 
                              className="h-10 w-10 rounded-lg object-cover border border-gray-300"
                            />
                          ) : (
                            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10 flex items-center justify-center">
                              <FaCamera className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {member.firstName} {member.lastName}
                            </div>
                            <div className="text-sm text-gray-500">ID: {member.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{member.position}</div>
                        {member.subject && (
                          <div className="text-sm text-gray-500">Subject: {member.subject}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Rs {Math.round(monthlyTotal)}</div>
                        {/* Worked months vs paid salaries summary */}
                        <div className="text-xs text-gray-500 mt-1">
                          {/* Calculate months since joining (full months worked) */}
                          {(() => {
                            const joiningDate = new Date(member.dateOfJoining);
                            const currentDate = new Date();
                            
                            // Calculate total months worked with partial month calculation
                            // Get the difference in milliseconds and convert to months
                            const timeDiff = currentDate.getTime() - joiningDate.getTime();
                            const daysDiff = timeDiff / (1000 * 3600 * 24);
                            
                            // Calculate months including partial months
                            // We consider a month as 30 days for simplicity
                            let totalMonths = daysDiff / 30;
                            
                            // Ensure we don't have negative months
                            totalMonths = Math.max(0, totalMonths);
                            
                            // Calculate paid salaries count (both salary payments and advances)
                            const paidRecordsCount = member.salaryHistory ? 
                              member.salaryHistory.filter(record => record.status === 'paid' || record.status === 'advance').length : 0;
                            
                            // Calculate pending payments
                            const pendingPayments = totalMonths - paidRecordsCount;
                            
                            return (
                              <div className="flex items-center">
                                <span>{totalMonths.toFixed(1)} worked</span>
                                <span className="mx-1">•</span>
                                <span>{paidRecordsCount} paid</span>
                                {pendingPayments > 0 && (
                                  <>
                                    <span className="mx-1">•</span>
                                    <span className="text-red-600 font-medium">{pendingPayments.toFixed(1)} pending</span>
                                  </>
                                )}
                              </div>
                            );
                          })()}

                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(member.dateOfJoining).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewDetails(member)}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            title="View Details"
                          >
                            <FaUser className="mr-1" />
                            View
                          </button>
                          <button
                            onClick={() => handleFinancialAction(member)}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            title="Manage Finances"
                          >
                            <FaDollarSign className="mr-1" />
                            Finance
                          </button>
                          <button
                            onClick={() => handleEdit(member)}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            title="Edit"
                          >
                            <FaEdit className="mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(member.id)}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            title="Delete"
                          >
                            <FaTrash className="mr-1" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    No staff members found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {filteredStaff.length > itemsPerPage && (
          <div className="px-6 py-4 border-t border-gray-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredStaff.length}
              itemsPerPage={itemsPerPage}
              paginate={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>

      {/* Staff Form Modal */}
      {showStaffModal && (
        <StaffFormModal
          onClose={() => {
            setShowStaffModal(false);
            setCurrentStaff(null);
          }}
          onSubmit={handleStaffSubmit}
          staffData={currentStaff}
          classes={classes}
        />
      )}

      {/* Staff Financial Modal */}
      {showFinancialModal && selectedStaffForFinance && (
        <StaffFinancialModal
          staffMember={selectedStaffForFinance}
          onClose={() => {
            setShowFinancialModal(false);
            setSelectedStaffForFinance(null);
          }}
          onAddAdvance={handleAddAdvance}
          onPaySalary={handlePaySalary}
        />
      )}

      {/* Staff Details Modal */}
      {showDetailsModal && selectedStaffForDetails && (
        <StaffDetailsModal
          staffMember={selectedStaffForDetails}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedStaffForDetails(null);
          }}
          classes={classes}
        />
      )}
    </>
  );
};

export default StaffSection;