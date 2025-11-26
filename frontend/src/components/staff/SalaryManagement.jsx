import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateStaff } from '../../store/staffSlice';
import { FaMoneyBillWave, FaSearch, FaFilter, FaFileInvoice, FaCheck, FaTimes } from 'react-icons/fa';
import PageHeader from '../common/PageHeader';

const SalaryManagement = () => {
  const dispatch = useDispatch();
  const { staff } = useSelector(state => state.staff);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [salaryMonth, setSalaryMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
  const [salaryYear, setSalaryYear] = useState(new Date().getFullYear().toString());
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [salaryDetails, setSalaryDetails] = useState({
    basicSalary: '',
    allowances: '',
    deductions: '',
    absentDays: '',
    paymentMethod: 'cash'
  });

  // Get unique departments for dropdown
  const uniqueDepartments = [...new Set(staff.map(member => member.department))];

  // Filter staff based on search term and department
  const filteredStaff = staff.filter(member => {
    const matchesSearch = 
      `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = !selectedDepartment || member.department === selectedDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  // Calculate net salary
  const calculateNetSalary = (basic, allowances, deductions, absentDays) => {
    const basicSalary = parseFloat(basic) || 0;
    const allowanceAmount = parseFloat(allowances) || 0;
    const deductionAmount = parseFloat(deductions) || 0;
    const absentCount = parseInt(absentDays) || 0;
    
    // Calculate absent deduction (assuming 1 day salary deduction per absent day)
    const perDaySalary = basicSalary / 30;
    const absentDeduction = absentCount * perDaySalary;
    
    return basicSalary + allowanceAmount - deductionAmount - absentDeduction;
  };

  // Open salary modal for a staff member
  const openSalaryModal = (staffMember) => {
    setSelectedStaff(staffMember);
    setSalaryDetails({
      basicSalary: staffMember.salary || '',
      allowances: staffMember.allowances || '',
      deductions: staffMember.deductions || '',
      absentDays: staffMember.absentDays || '',
      paymentMethod: 'cash'
    });
    setShowSalaryModal(true);
  };

  // Process salary payment
  const processSalaryPayment = () => {
    if (!selectedStaff) return;
    
    const netSalary = calculateNetSalary(
      salaryDetails.basicSalary,
      salaryDetails.allowances,
      salaryDetails.deductions,
      salaryDetails.absentDays
    );
    
    // In a real implementation, this would dispatch an action to save salary payment
    console.log('Processing salary payment:', {
      staffId: selectedStaff.id,
      month: salaryMonth,
      year: salaryYear,
      ...salaryDetails,
      netSalary
    });
    
    alert(`Processed salary payment of Rs. ${netSalary.toFixed(2)} for ${selectedStaff.firstName} ${selectedStaff.lastName}`);
    setShowSalaryModal(false);
    setSelectedStaff(null);
  };

  // Get staff by ID
  const getStaffById = (staffId) => {
    return staff.find(member => member.id === staffId);
  };

  return (
    <>
      <PageHeader
        title="Salary Management"
        subtitle="Create salary slips, manage allowances, and process salary payments"
        actionButton={null}
      />

      {/* Filters and Controls */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Salary Month</label>
            <select
              value={salaryMonth}
              onChange={(e) => setSalaryMonth(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              {Array.from({length: 12}, (_, i) => new Date(0, i).toLocaleString('default', { month: 'long' }).toUpperCase()).map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Salary Year</label>
            <input
              type="number"
              value={salaryYear}
              onChange={(e) => setSalaryYear(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              min="2020"
              max="2030"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Departments</option>
              {uniqueDepartments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
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
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Staff Members ({filteredStaff.length})
        </h3>
        
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Member</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Basic Salary</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStaff.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {member.firstName} {member.lastName}
                        </div>
                        <div className="text-sm text-gray-500">ID: {member.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.position}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Rs. {member.salary || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      member.salaryStatus === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : member.salaryStatus === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {member.salaryStatus === 'paid' ? 'Paid' : member.salaryStatus === 'pending' ? 'Pending' : 'Not Generated'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openSalaryModal(member)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <FaMoneyBillWave className="mr-1" /> Process Salary
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredStaff.length === 0 && (
            <div className="text-center py-12">
              <FaMoneyBillWave className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No staff members found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Salary Modal */}
      {showSalaryModal && selectedStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">
                Process Salary for {selectedStaff.firstName} {selectedStaff.lastName}
              </h3>
              <button
                onClick={() => setShowSalaryModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="py-6 px-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Basic Salary</label>
                  <input
                    type="number"
                    value={salaryDetails.basicSalary}
                    onChange={(e) => setSalaryDetails({...salaryDetails, basicSalary: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Allowances</label>
                  <input
                    type="number"
                    value={salaryDetails.allowances}
                    onChange={(e) => setSalaryDetails({...salaryDetails, allowances: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deductions</label>
                  <input
                    type="number"
                    value={salaryDetails.deductions}
                    onChange={(e) => setSalaryDetails({...salaryDetails, deductions: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Absent Days</label>
                  <input
                    type="number"
                    value={salaryDetails.absentDays}
                    onChange={(e) => setSalaryDetails({...salaryDetails, absentDays: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSalaryDetails({...salaryDetails, paymentMethod: 'cash'})}
                    className={`flex items-center justify-center px-4 py-3 border rounded-lg ${
                      salaryDetails.paymentMethod === 'cash'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <FaMoneyBillWave className="mr-2" /> Cash
                  </button>
                  <button
                    onClick={() => setSalaryDetails({...salaryDetails, paymentMethod: 'bank'})}
                    className={`flex items-center justify-center px-4 py-3 border rounded-lg ${
                      salaryDetails.paymentMethod === 'bank'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <FaMoneyBillWave className="mr-2" /> Bank Transfer
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Basic Salary:</span>
                  <span className="font-medium">Rs. {parseFloat(salaryDetails.basicSalary || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Allowances:</span>
                  <span className="font-medium">Rs. {parseFloat(salaryDetails.allowances || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Deductions:</span>
                  <span className="font-medium">Rs. {parseFloat(salaryDetails.deductions || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Absent Deduction:</span>
                  <span className="font-medium">
                    Rs. {((parseFloat(salaryDetails.basicSalary || 0) / 30) * parseInt(salaryDetails.absentDays || 0)).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                  <span className="text-gray-900 font-medium">Net Salary:</span>
                  <span className="text-gray-900 font-bold">
                    Rs. {calculateNetSalary(
                      salaryDetails.basicSalary,
                      salaryDetails.allowances,
                      salaryDetails.deductions,
                      salaryDetails.absentDays
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowSalaryModal(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FaTimes className="mr-2" /> Cancel
                </button>
                <button
                  onClick={processSalaryPayment}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <FaCheck className="mr-2" /> Process Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SalaryManagement;