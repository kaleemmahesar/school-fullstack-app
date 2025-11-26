import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { FaDollarSign, FaSearch, FaFilter, FaFileExport, FaPrint } from 'react-icons/fa';
import PageHeader from '../common/PageHeader';

const FeeReports = () => {
  const { students } = useSelector(state => state.students);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [activeTab, setActiveTab] = useState('paid'); // 'paid', 'unpaid', 'balance'
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Get unique classes for dropdown
  const uniqueClasses = [...new Set(students.map(student => student.class))];

  // Get sections for selected class
  const classSections = selectedClass 
    ? [...new Set(students
        .filter(student => student.class === selectedClass)
        .map(student => student.section))]
    : [];

  // Process students to calculate fee statistics
  const processStudents = () => {
    return students.map(student => {
      const feesHistory = student.feesHistory || [];
      
      // Filter challans within date range
      const filteredChallans = feesHistory.filter(challan => {
        const challanDate = new Date(challan.date || challan.dueDate);
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        return challanDate >= startDate && challanDate <= endDate;
      });
      
      // Calculate statistics
      const totalChallans = filteredChallans.length;
      const paidChallans = filteredChallans.filter(challan => challan.paid).length;
      const unpaidChallans = totalChallans - paidChallans;
      
      const totalAmount = filteredChallans.reduce((sum, challan) => sum + (challan.amount || 0), 0);
      const paidAmount = filteredChallans
        .filter(challan => challan.paid)
        .reduce((sum, challan) => sum + (challan.amount || 0), 0);
      const unpaidAmount = totalAmount - paidAmount;
      
      return {
        ...student,
        totalChallans,
        paidChallans,
        unpaidChallans,
        totalAmount,
        paidAmount,
        unpaidAmount,
        completionRate: totalChallans > 0 ? Math.round((paidChallans / totalChallans) * 100) : 0
      };
    });
  };

  // Filter students based on search term, class, and section
  const filterStudents = (studentList) => {
    return studentList.filter(student => {
      const matchesSearch = 
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.class.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesClass = !selectedClass || student.class === selectedClass;
      const matchesSection = !selectedSection || student.section === selectedSection;
      
      return matchesSearch && matchesClass && matchesSection;
    });
  };

  // Categorize students based on active tab
  const categorizeStudents = () => {
    const processedStudents = processStudents();
    const filteredStudents = filterStudents(processedStudents);
    
    if (activeTab === 'paid') {
      // Students with 100% completion rate
      return filteredStudents.filter(student => student.completionRate === 100);
    } else if (activeTab === 'unpaid') {
      // Students with less than 100% completion rate
      return filteredStudents.filter(student => student.completionRate < 100);
    } else {
      // All students for balance view
      return filteredStudents;
    }
  };

  const categorizedStudents = categorizeStudents();

  // Export to CSV
  const exportToCSV = () => {
    if (categorizedStudents.length === 0) return;
    
    const exportData = categorizedStudents.map(student => ({
      'Student ID': student.id,
      'Name': `${student.firstName} ${student.lastName}`,
      'Class': student.class,
      'Section': student.section,
      'Email': student.email,
      'Total Challans': student.totalChallans,
      'Paid Challans': student.paidChallans,
      'Unpaid Challans': student.unpaidChallans,
      'Total Amount': student.totalAmount.toFixed(2),
      'Paid Amount': student.paidAmount.toFixed(2),
      'Unpaid Amount': student.unpaidAmount.toFixed(2),
      'Completion Rate': `${student.completionRate}%`
    }));
    
    const csvContent = [
      Object.keys(exportData[0]).join(','),
      ...exportData.map(item => Object.values(item).map(value => 
        typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
      ).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `fee_report_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print report
  const printReport = () => {
    window.print();
  };

  // Calculate summary statistics
  const calculateSummary = () => {
    const totalStudents = categorizedStudents.length;
    const totalChallans = categorizedStudents.reduce((sum, student) => sum + student.totalChallans, 0);
    const totalPaidChallans = categorizedStudents.reduce((sum, student) => sum + student.paidChallans, 0);
    const totalUnpaidChallans = categorizedStudents.reduce((sum, student) => sum + student.unpaidChallans, 0);
    const totalAmount = categorizedStudents.reduce((sum, student) => sum + student.totalAmount, 0);
    const totalPaidAmount = categorizedStudents.reduce((sum, student) => sum + student.paidAmount, 0);
    const totalUnpaidAmount = categorizedStudents.reduce((sum, student) => sum + student.unpaidAmount, 0);
    
    return {
      totalStudents,
      totalChallans,
      totalPaidChallans,
      totalUnpaidChallans,
      totalAmount,
      totalPaidAmount,
      totalUnpaidAmount
    };
  };

  const summary = calculateSummary();

  return (
    <>
      <PageHeader
        title="Fee Reports"
        subtitle="View paid fees, unpaid fees, and current balance reports"
        actionButton={
          <div className="flex space-x-2">
            <button
              onClick={printReport}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              <FaPrint className="mr-2" /> Print
            </button>
            <button
              onClick={exportToCSV}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              <FaFileExport className="mr-2" /> Export CSV
            </button>
          </div>
        }
      />

      {/* Date Range and Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
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
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('paid')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'paid'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <FaDollarSign className="mr-2" />
                Paid Fees
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {categorizedStudents.length}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('unpaid')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'unpaid'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <FaDollarSign className="mr-2" />
                Unpaid Fees
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {categorizedStudents.length}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('balance')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'balance'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <FaDollarSign className="mr-2" />
                Current Balance
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {categorizedStudents.length}
                </span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Students</p>
              <p className="text-3xl font-bold mt-1">{summary.totalStudents}</p>
            </div>
            <div className="p-3 bg-blue-400 bg-opacity-30 rounded-full">
              <FaUsers size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Paid Amount</p>
              <p className="text-3xl font-bold mt-1">${summary.totalPaidAmount.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-green-400 bg-opacity-30 rounded-full">
              <FaDollarSign size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Unpaid Amount</p>
              <p className="text-3xl font-bold mt-1">${summary.totalUnpaidAmount.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-red-400 bg-opacity-30 rounded-full">
              <FaDollarSign size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Amount</p>
              <p className="text-3xl font-bold mt-1">${summary.totalAmount.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-purple-400 bg-opacity-30 rounded-full">
              <FaDollarSign size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {activeTab === 'paid' && 'Paid Fees Report'}
          {activeTab === 'unpaid' && 'Unpaid Fees Report'}
          {activeTab === 'balance' && 'Current Balance Report'}
          ({categorizedStudents.length} students)
        </h3>
        
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class/Section</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Challans</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categorizedStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{student.firstName} {student.lastName}</div>
                        <div className="text-sm text-gray-500">ID: {student.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.class}</div>
                    <div className="text-sm text-gray-500">Section {student.section}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {student.paidChallans}/{student.totalChallans} paid
                    </div>
                    <div className="text-sm text-gray-500">
                      {student.unpaidChallans} pending
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ${student.paidAmount.toFixed(2)} / ${student.totalAmount.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500">
                      ${student.unpaidAmount.toFixed(2)} pending
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className={`h-2 rounded-full ${
                            student.completionRate === 100 ? 'bg-green-500' :
                            student.completionRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${student.completionRate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{student.completionRate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {categorizedStudents.length === 0 && (
            <div className="text-center py-12">
              <FaDollarSign className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search, filter, or date range criteria
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FeeReports;