import React, { useState, useEffect } from 'react';
import { FaUser, FaCalendar, FaDollarSign, FaReceipt, FaCheck, FaUsers, FaChalkboardTeacher } from 'react-icons/fa';
import SearchableStudentDropdown from '../common/SearchableStudentDropdown';

const ChallanModals = ({
  showGenerateModal,
  setShowGenerateModal,
  challanData,
  setChallanData,
  students,
  classes,
  handleStudentChange,
  submitChallan,
  showBulkGenerateModal,
  setShowBulkGenerateModal,
  submitBulkGenerate,
  showBulkUpdateModal,
  setShowBulkUpdateModal,
  submitBulkUpdate,
  bulkSelectedChallans,
  showPaymentModal,
  setShowPaymentModal,
  paymentData,
  setPaymentData,
  submitPayment,
  detailViewStudent,
  batches // Add batches prop
}) => {
  // State for challan generation mode (single, class, all)
  const [generationMode, setGenerationMode] = useState('single'); // 'single', 'class', 'all'
  
  // Get student's monthly fees when student is selected
  const getStudentMonthlyFees = (studentId) => {
    if (!studentId) return 0;
    const student = students.find(s => s.id === studentId);
    if (!student) return 0;
    
    // First check if student has individual fees defined
    if (student.monthlyFees) {
      const individualFees = parseFloat(student.monthlyFees) || 0;
      if (individualFees > 0) {
        return individualFees;
      }
    }
    
    // Find the class fees for this student's class
    const studentClass = classes.find(c => c.name === student.class);
    if (studentClass && studentClass.monthlyFees) {
      return parseFloat(studentClass.monthlyFees) || 0;
    }
    
    // Fallback to student's monthlyFees if class data not found
    return student.monthlyFees ? parseFloat(student.monthlyFees) || 0 : 0;
  };

  // Update amount when student changes
  const handleStudentChangeWithFees = (studentId) => {
    const monthlyFees = getStudentMonthlyFees(studentId);
    setChallanData({
      ...challanData,
      studentId,
      amount: monthlyFees
    });
  };

  // Get class-based fees for bulk generation
  const getClassBasedFees = (className) => {
    // Find the class fees for this student's class
    const studentClass = classes.find(c => c.name === className);
    if (studentClass && studentClass.monthlyFees) {
      return parseFloat(studentClass.monthlyFees) || 0;
    }
    
    // If no class data found, return 0 as fallback
    return 0;
  };

  // State for bulk generation form
  const [bulkGenerateData, setBulkGenerateData] = useState({
    month: new Date().toISOString().slice(0, 7),
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: '',
    classId: '' // For class-based generation
  });

  // Handle bulk generate form changes
  const handleBulkGenerateChange = (field, value) => {
    setBulkGenerateData({
      ...bulkGenerateData,
      [field]: value
    });
  };

  // Set default values for challanData when modal opens
  useEffect(() => {
    if (showGenerateModal) {
      // Set previous month as default
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth(); // Current month (0-11)
      
      // Calculate previous month
      let previousYear = year;
      let previousMonth = month - 1;
      
      // Handle year transition (January -> December of previous year)
      if (previousMonth < 0) {
        previousMonth = 11;
        previousYear = year - 1;
      }
      
      // Format as YYYY-MM
      const defaultMonth = previousYear + '-' + (previousMonth + 1).toString().padStart(2, '0');
      
      // Set due date to 10 days from today
      const dueDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      // Only set default values if they're not already set
      setChallanData(prevData => ({
        ...prevData,
        month: prevData.month || defaultMonth,
        dueDate: prevData.dueDate || dueDate
      }));
    }
  }, [showGenerateModal, setChallanData]);

  // Submit bulk generate with class-based fees
  const submitBulkGenerateWithClassFees = (e) => {
    e.preventDefault();
    submitBulkGenerate(bulkGenerateData);
  };

  // Check if a month is within a batch's date range
  const isMonthInBatchRange = (month, batch) => {
    if (!month || !batch || !batch.startDate || !batch.endDate) return true;
    
    try {
      // Parse the month (YYYY-MM format)
      const [year, monthIndex] = month.split('-').map(Number);
      const monthStart = new Date(year, monthIndex - 1, 1); // First day of the month
      const monthEnd = new Date(year, monthIndex, 0); // Last day of the month
      
      // Parse batch dates
      const batchStart = new Date(batch.startDate);
      const batchEnd = new Date(batch.endDate);
      
      // Check if the month overlaps with the batch period
      return monthStart <= batchEnd && monthEnd >= batchStart;
    } catch (error) {
      console.error('Error checking month in batch range:', error);
      return true; // Allow if there's an error
    }
  };

  // Get the student's batch
  const getStudentBatch = (studentId) => {
    if (!studentId) return null;
    const student = students.find(s => s.id === studentId);
    if (!student || !student.academicYear) return null;
    
    // Find the batch that matches the student's academic year
    return batches.find(batch => batch.name === student.academicYear);
  };

  // Check if the selected month is valid for the student's batch
  const isMonthValidForStudentBatch = (month, studentId) => {
    if (!month || !studentId) return true;
    
    const batch = getStudentBatch(studentId);
    if (!batch) return true; // Allow if no batch found
    
    return isMonthInBatchRange(month, batch);
  };

  // Get students by class - FIXED to use class name instead of classId
  const getStudentsByClass = (classId) => {
    if (!classId) return [];
    
    // Find the class name from the class ID
    const selectedClass = classes.find(c => c.id == classId);
    if (!selectedClass) return [];
    
    // Filter students by class name (since students store class name, not classId)
    return students.filter(s => s.class === selectedClass.name);
  };

  // Get count of students for current selection
  const getStudentCount = () => {
    if (generationMode === 'single') return 1;
    if (generationMode === 'class') {
      const classStudents = getStudentsByClass(bulkGenerateData.classId);
      return classStudents.length;
    }
    if (generationMode === 'all') return students.length;
    return 0;
  };

  // Reset generation mode when modal closes
  useEffect(() => {
    if (!showGenerateModal) {
      setGenerationMode('single');
      setBulkGenerateData({
        month: new Date().toISOString().slice(0, 7),
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: '',
        classId: ''
      });
    }
  }, [showGenerateModal]);

  return (
    <>
      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md" style={{ minWidth: '500px' }}>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Process Payment</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const discountAmount = parseFloat(formData.get('discountAmount')) || 0;
              const discountReason = formData.get('discountReason') || '';
              
              // Get the original challan amount
              const targetChallan = detailViewStudent?.feesHistory?.find(c => c.id === paymentData.challanId);
              const originalAmount = parseFloat(targetChallan?.amount) || 0;
              const actualAmountPaid = originalAmount - discountAmount;
              
              const data = {
                challanId: paymentData.challanId,
                paymentMethod: formData.get('paymentMethod'),
                paymentDate: formData.get('paymentDate'),
                discountAmount: discountAmount,
                discountReason: discountReason,
                actualAmountPaid: actualAmountPaid
              };
              submitPayment(data);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  name="paymentMethod"
                  defaultValue={paymentData.paymentMethod}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="cash">Cash</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="easypaisa">EasyPaisa</option>
                  <option value="jazzcash">JazzCash</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                <input
                  type="date"
                  name="paymentDate"
                  defaultValue={paymentData.paymentDate}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              {/* Discount Fields */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount Amount</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaDollarSign className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        name="discountAmount"
                        defaultValue={paymentData.discountAmount}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Final Amount</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaDollarSign className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        readOnly
                        value={(parseFloat(detailViewStudent?.feesHistory?.find(c => c.id === paymentData.challanId)?.amount) || 0) - (parseFloat(paymentData.discountAmount) || 0)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Reason</label>
                  <input
                    type="text"
                    name="discountReason"
                    defaultValue={paymentData.discountReason}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter reason for discount"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  <FaCheck className="mr-2" /> Process Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generate Challan Modal - Enhanced with multiple options */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Generate New Challan</h3>
            
            {/* Generation Mode Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Generation Type</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setGenerationMode('single')}
                  className={`p-4 border-2 rounded-lg flex flex-col items-center justify-center transition-all ${
                    generationMode === 'single'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FaUser className="text-2xl mb-2" />
                  <span className="text-sm font-medium">Single Student</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setGenerationMode('class')}
                  className={`p-4 border-2 rounded-lg flex flex-col items-center justify-center transition-all ${
                    generationMode === 'class'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FaChalkboardTeacher className="text-2xl mb-2" />
                  <span className="text-sm font-medium">For Class</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setGenerationMode('all')}
                  className={`p-4 border-2 rounded-lg flex flex-col items-center justify-center transition-all ${
                    generationMode === 'all'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FaUsers className="text-2xl mb-2" />
                  <span className="text-sm font-medium">All Students</span>
                </button>
              </div>
            </div>

            {/* Form based on generation mode */}
            <form onSubmit={(e) => {
              // Validate month against batch range before submitting
              if (generationMode === 'single' && challanData.studentId && challanData.month) {
                const isValid = isMonthValidForStudentBatch(challanData.month, challanData.studentId);
                if (!isValid) {
                  e.preventDefault();
                  alert('Selected month is outside the student\'s batch period. Please select a month within the batch dates.');
                  return;
                }
              }
              
              // Prepare data based on mode
              if (generationMode === 'single') {
                submitChallan(e);
              } else {
                // For class or all students mode
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = {
                  month: formData.get('month'),
                  dueDate: formData.get('dueDate'),
                  description: formData.get('description') || '',
                  classId: generationMode === 'class' ? bulkGenerateData.classId : null,
                  mode: generationMode
                };
                
                // Show confirmation
                const studentCount = getStudentCount();
                const confirmMsg = `Generate challans for ${studentCount} student(s)?\n\nMonth: ${data.month}\nDue Date: ${data.dueDate}`;
                if (window.confirm(confirmMsg)) {
                  submitBulkGenerate(data);
                  setShowGenerateModal(false);
                }
              }
            }} className="space-y-4">
              
              {/* Single Student Mode */}
              {generationMode === 'single' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaUser className="h-5 w-5 text-gray-400" />
                      </div>
                      <SearchableStudentDropdown
                        students={students}
                        value={challanData.studentId}
                        onChange={handleStudentChangeWithFees}
                        placeholder="Select a student..."
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaCalendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="month"
                        name="month"
                        value={challanData.month}
                        onChange={(e) => setChallanData({...challanData, month: e.target.value})}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    {/* Show warning if month is outside batch range */}
                    {challanData.studentId && challanData.month && !isMonthValidForStudentBatch(challanData.month, challanData.studentId) && (
                      <p className="mt-1 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100">
                        Warning: Selected month is outside the student's batch period. Please select a month within the batch dates.
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount (Monthly Fees)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaDollarSign className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        value={challanData.amount}
                        onChange={(e) => setChallanData({...challanData, amount: e.target.value})}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter amount"
                        required
                        readOnly
                      />
                    </div>
                    <p className="mt-1 text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-100">
                      Auto-filled from student's class monthly fees: Rs {getStudentMonthlyFees(challanData.studentId)}. This amount is fixed based on the student's class fees.
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaCalendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        name="dueDate"
                        value={challanData.dueDate}
                        onChange={(e) => setChallanData({...challanData, dueDate: e.target.value})}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      name="description"
                      value={challanData.description}
                      onChange={(e) => setChallanData({...challanData, description: e.target.value})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter description (optional)"
                      rows="2"
                    />
                  </div>
                </>
              )}

              {/* Class Mode or All Students Mode */}
              {(generationMode === 'class' || generationMode === 'all') && (
                <>
                  {generationMode === 'class' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaChalkboardTeacher className="h-5 w-5 text-gray-400" />
                        </div>
                        <select
                          value={bulkGenerateData.classId}
                          onChange={(e) => setBulkGenerateData({...bulkGenerateData, classId: e.target.value})}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          <option value="">Select a class...</option>
                          {classes.map(cls => (
                            <option key={cls.id} value={cls.id}>{cls.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaCalendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="month"
                        name="month"
                        defaultValue={bulkGenerateData.month}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaCalendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        name="dueDate"
                        defaultValue={bulkGenerateData.dueDate}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      name="description"
                      defaultValue={bulkGenerateData.description}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter description (optional)"
                      rows="2"
                    />
                  </div>
                  
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <p className="text-sm text-blue-700">
                      <strong>Note:</strong> Amounts will be automatically calculated based on each student's class fees structure.
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Target students: <strong>{getStudentCount()}</strong> student(s)
                    </p>
                  </div>
                </>
              )}
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                  disabled={generationMode === 'single' && challanData.studentId && challanData.month && !isMonthValidForStudentBatch(challanData.month, challanData.studentId)}
                >
                  <FaReceipt className="mr-2" /> 
                  {generationMode === 'single' ? 'Generate Challan' : 
                   generationMode === 'class' ? `Generate for Class (${getStudentCount()} students)` : 
                   `Generate for All (${getStudentCount()} students)`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Generate Modal */}
      {showBulkGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Bulk Generate Challanss</h3>
            <form onSubmit={submitBulkGenerateWithClassFees} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <input
                  type="month"
                  value={bulkGenerateData.month}
                  onChange={(e) => handleBulkGenerateChange('month', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={bulkGenerateData.dueDate}
                  onChange={(e) => handleBulkGenerateChange('dueDate', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={bulkGenerateData.description}
                  onChange={(e) => handleBulkGenerateChange('description', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter description (optional)"
                />
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> Amounts will be automatically calculated based on each student's class fees structure.
                </p>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBulkGenerateModal(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                >
                  <FaReceipt className="mr-2" /> Generate Challans
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Update Modal */}
      {showBulkUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Bulk Update Challans</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const data = {
                paymentMethod: formData.get('paymentMethod'),
                paymentDate: formData.get('paymentDate')
              };
              submitBulkUpdate(data);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  name="paymentMethod"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="cash">Cash</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="easypaisa">EasyPaisa</option>
                  <option value="jazzcash">JazzCash</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                <input
                  type="date"
                  name="paymentDate"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBulkUpdateModal(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  <FaCheck className="mr-2" /> Update {bulkSelectedChallans.length} Challans
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ChallanModals;