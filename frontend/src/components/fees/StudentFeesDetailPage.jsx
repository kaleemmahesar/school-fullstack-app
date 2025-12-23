import React from 'react';
import { FaEye, FaChartBar, FaDollarSign, FaCheck, FaExclamation, FaReceipt, FaUser, FaPlus, FaPrint, FaTag } from 'react-icons/fa';

const StudentFeesDetailPage = ({
  detailViewStudent,
  students,
  classes,
  setShowStudentDetails,
  handleSelectAllChallans,
  areAllChallansSelected,
  bulkSelectedChallans,
  handleBulkUpdate,
  isChallanSelected,
  handleSelectChallan,
  handlePrintChallan,
  setPaymentData,
  setShowPaymentModal,
  setChallanData,
  setShowGenerateModal
}) => {
  // Get student's monthly fees from class data
  const getStudentMonthlyFees = (student) => {
    if (!student || !classes) return 0;
    
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

  // Calculate the monthly fees for display
  const monthlyFees = detailViewStudent ? getStudentMonthlyFees(detailViewStudent) : 0;

  // Recalculate student stats to ensure consistency
  const generateStudentStats = (student) => {
    if (!student) return {};
    
    const monthlyChallans = student.feesHistory ? student.feesHistory.filter(challan => challan.type !== 'admission') : [];
    const admissionChallans = student.feesHistory ? student.feesHistory.filter(challan => challan.type === 'admission') : [];
    
    const totalMonthlyChallans = monthlyChallans.length;
    const paidMonthlyChallans = monthlyChallans.filter(challan => challan.status === 'paid').length;
    
    const totalAdmissionChallans = admissionChallans.length;
    const paidAdmissionChallans = admissionChallans.filter(challan => challan.status === 'paid').length;
    
    // Total challans include both monthly and admission
    const totalChallans = totalMonthlyChallans + totalAdmissionChallans;
    const paidChallans = paidMonthlyChallans + paidAdmissionChallans;
    
    const totalMonthlyAmount = monthlyChallans.reduce((sum, challan) => sum + (challan.amount || 0), 0);
    const totalAdmissionAmount = admissionChallans.reduce((sum, challan) => sum + (challan.amount || 0), 0);
    const totalAmount = totalMonthlyAmount + totalAdmissionAmount;
    
    // Calculate total discounts for the student
    const totalDiscounts = (monthlyChallans.reduce((sum, challan) => sum + (parseFloat(challan.discountAmount) || 0), 0) +
                          admissionChallans.reduce((sum, challan) => sum + (parseFloat(challan.discountAmount) || 0), 0));
    
    // Adjusted total amount after discounts
    const adjustedTotalAmount = totalAmount - totalDiscounts;
    
    const paidMonthlyAmount = monthlyChallans
      .filter(challan => challan.status === 'paid')
      .reduce((sum, challan) => {
        // If discount information exists, use the discounted amount
        if (challan.discountAmount > 0) {
          return sum + ((challan.amount - challan.discountAmount) || challan.discountedAmount || 0);
        }
        return sum + (challan.amount || 0);
      }, 0);
    const paidAdmissionAmount = admissionChallans
      .filter(challan => challan.status === 'paid')
      .reduce((sum, challan) => {
        // If discount information exists, use the discounted amount
        if (challan.discountAmount > 0) {
          return sum + ((challan.amount - challan.discountAmount) || challan.discountedAmount || 0);
        }
        return sum + (challan.amount || 0);
      }, 0);
    const paidAmount = paidMonthlyAmount + paidAdmissionAmount;
    
    const pendingAmount = Math.max(0, adjustedTotalAmount - paidAmount);
    
    const admissionPaid = admissionChallans.length > 0 && admissionChallans.every(challan => challan.status === 'paid');
    
    const completionRate = totalChallans > 0 ? Math.round((paidChallans / totalChallans) * 100) : (admissionPaid ? 100 : 0);
    
    return {
      ...student,
      totalChallans,
      paidChallans,
      totalAmount,
      adjustedTotalAmount,
      paidAmount,
      pendingAmount,
      admissionPaid,
      completionRate,
      totalDiscounts
    };
  };

  // Generate updated stats for the detail view student
  const updatedStudentStats = detailViewStudent ? generateStudentStats(detailViewStudent) : {};

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {detailViewStudent && (
        <div key={`${detailViewStudent.id}-${detailViewStudent.feesHistory ? detailViewStudent.feesHistory.map(ch => `${ch.id}-${ch.status}`).join('-') : 'no-history'}`}>
          
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center mr-4">
                  <FaUser className="text-gray-500 text-2xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{detailViewStudent.firstName} {detailViewStudent.lastName}</h2>
                  <p className="text-gray-600">{detailViewStudent.class} - {detailViewStudent.section} (GR No: {detailViewStudent.grNo || 'N/A'})</p>
                </div>
              </div>
              <button
                onClick={() => setShowStudentDetails(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaEye className="mr-2" /> Back to All Students
              </button>
            </div>
          
          {/* Financial Info Section - Improved Layout */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-md p-6 mb-6 border border-blue-100">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaChartBar className="mr-2 text-blue-500" /> Financial Overview
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Total Amount */}
              <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-full mr-3">
                    <FaDollarSign className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium">Total Amount</p>
                    <p className="text-xl font-bold text-gray-900">Rs {isNaN(updatedStudentStats.adjustedTotalAmount) ? '0' : Math.round(updatedStudentStats.adjustedTotalAmount || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              {/* Paid Amount */}
              <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-full mr-3">
                    <FaCheck className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium">Paid</p>
                    <p className="text-xl font-bold text-gray-900">Rs {Math.round(updatedStudentStats.paidAmount || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              {/* Pending Amount */}
              <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-amber-100 rounded-full mr-3">
                    <FaExclamation className="text-amber-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium">Pending</p>
                    <p className="text-xl font-bold text-gray-900">Rs {isNaN(updatedStudentStats.pendingAmount) ? '0' : Math.round(updatedStudentStats.pendingAmount || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              {/* Completion Rate */}
              <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-full mr-3">
                    <FaChartBar className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium">Completion</p>
                    <p className="text-xl font-bold text-gray-900">{updatedStudentStats.completionRate || 0}%</p>
                  </div>
                </div>
              </div>
              
              {/* Discounts Given */}
              <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-pink-100 rounded-full mr-3">
                    <FaTag className="text-pink-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium">Discounts</p>
                    <p className="text-xl font-bold text-gray-900">Rs {isNaN(updatedStudentStats.totalDiscounts) ? '0' : Math.round(updatedStudentStats.totalDiscounts || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Fee Challans</h3>
                      <p className="text-sm text-gray-500">Manage and track student fee payments</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={handleSelectAllChallans}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        {areAllChallansSelected ? 'Deselect All' : 'Select All'}
                      </button>
                      <button
                        onClick={() => {
                          setChallanData({
                            studentId: detailViewStudent.id,
                            month: '',
                            amount: monthlyFees || 0,
                            dueDate: '',
                            description: ''
                          });
                          setShowGenerateModal(true);
                        }}
                        disabled={detailViewStudent.status === 'passed_out' || detailViewStudent.status === 'left'}
                        className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                          detailViewStudent.status === 'passed_out' || detailViewStudent.status === 'left'
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                        }`}
                      >
                        <FaPlus className="mr-1" /> Generate Challan
                      </button>
                      <button
                        onClick={handleBulkUpdate}
                        disabled={bulkSelectedChallans.length === 0}
                        className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                          bulkSelectedChallans.length === 0 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                        }`}
                      >
                        <FaCheck className="mr-1" /> Mark as Paid ({bulkSelectedChallans.length})
                      </button>

                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">
                    Challan History ({detailViewStudent.feesHistory ? detailViewStudent.feesHistory.length : 0})
                  </h4>
                  
                  {detailViewStudent.feesHistory && detailViewStudent.feesHistory.length > 0 ? (
                    <div className="overflow-hidden rounded-lg border border-gray-200">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              <input
                                type="checkbox"
                                checked={areAllChallansSelected}
                                onChange={handleSelectAllChallans}
                                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                              />
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {detailViewStudent.feesHistory
                            .slice()
                            .sort((a, b) => new Date(b.date || b.dueDate) - new Date(a.date || a.dueDate))
                            .map((challan) => (
                            <tr key={challan.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                {challan.status !== 'paid' ? (
                                  <input
                                    type="checkbox"
                                    checked={isChallanSelected(challan.id)}
                                    onChange={() => handleSelectChallan(challan.id)}
                                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                  />
                                ) : (
                                  <span className="text-green-500">✓</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {challan.month}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <div>
                                  <div>Rs {isNaN(challan.amount) ? '0' : Math.round(challan.amount).toLocaleString()}</div>
                                  {challan.discountAmount > 0 && (
                                    <div className="text-xs text-red-600">
                                      Discount: Rs {isNaN(challan.discountAmount) ? '0' : Math.round(challan.discountAmount).toLocaleString()}
                                    </div>
                                  )}
                                  {challan.discountAmount > 0 && (
                                    <div className="text-xs font-medium text-green-600">
                                      Paid: Rs {isNaN(challan.amount - challan.discountAmount) ? (isNaN(challan.discountedAmount) ? '0' : Math.round(challan.discountedAmount).toLocaleString()) : Math.round((challan.amount - challan.discountAmount) || challan.discountedAmount).toLocaleString()}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(challan.dueDate).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  challan.status === 'paid' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {challan.status === 'paid' ? 'Paid' : 'Pending'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex flex-wrap justify-end gap-1">
                                  <button
                                    onClick={() => {
                                      const student = students.find(s => s.id === detailViewStudent.id);
                                      if (student) {
                                        handlePrintChallan(challan, student);
                                      }
                                    }}
                                    className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                  >
                                    <FaPrint className="mr-1" /> Print
                                  </button>
                                  {challan.status !== 'paid' && (
                                    <button
                                      onClick={() => {
                                        setPaymentData({
                                          challanId: challan.id,
                                          paymentMethod: 'cash',
                                          paymentDate: new Date().toISOString().split('T')[0]
                                        });
                                        setShowPaymentModal(true);
                                      }}
                                      className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-lg text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                    >
                                      <FaDollarSign className="mr-1" /> Pay
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FaReceipt className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No challans found</h3>
                      <p className="mt-1 text-sm text-gray-500">This student doesn't have any fee challans yet.</p>
                      <div className="mt-4">
                        <button
                          onClick={() => {
                            setChallanData({
                              studentId: detailViewStudent.id,
                              month: '',
                              amount: monthlyFees || 0,
                              dueDate: '',
                              description: ''
                            });
                            setShowGenerateModal(true);
                          }}
                          disabled={detailViewStudent.status === 'passed_out' || detailViewStudent.status === 'left'}
                          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                            detailViewStudent.status === 'passed_out' || detailViewStudent.status === 'left'
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                          }`}
                        >
                          <FaPlus className="mr-2" /> Generate First Challan
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                  <FaUser className="mr-2 text-blue-500" /> Student Information
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-900">{detailViewStudent.grNo || 'N/A'}</p>
                      <p className="text-xs text-gray-500">GR No</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-900">{detailViewStudent.class} - {detailViewStudent.section}</p>
                      <p className="text-xs text-gray-500">Class/Section</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-900">{detailViewStudent.fatherName || 'N/A'}</p>
                        <p className="text-xs text-gray-500">Father's Name</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-900">
                        {detailViewStudent.dateOfBirth 
                            ? new Date(detailViewStudent.dateOfBirth).toLocaleDateString() 
                            : 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500">Date of Birth</p>
                    </div>
                </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">Rs {Math.round(monthlyFees).toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Monthly Fees</p>
                  </div>
                  
                  
                  
                  {/* <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">{detailViewStudent.address || 'N/A'}</p>
                    <p className="text-xs text-gray-500">Address</p>
                  </div> */}
                  
                  {/* Show existing challan months */}
                  {detailViewStudent.feesHistory && detailViewStudent.feesHistory.filter(challan => challan.type === 'monthly').length > 0 && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm font-medium text-gray-900 mb-2">Existing Challan Months</p>
                      <div className="flex flex-wrap gap-1">
                        {detailViewStudent.feesHistory
                          .filter(challan => challan.type === 'monthly')
                          .map(challan => (
                            <span key={challan.id} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {challan.month}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900">Admission Paid</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        updatedStudentStats.admissionPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {updatedStudentStats.admissionPaid ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* <div className="bg-white rounded-2xl shadow-lg p-6">
                <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                  <FaChartBar className="mr-2 text-green-500" /> Fee Summary
                </h4>
                <div className="space-y-4">
                  <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Monthly Fees</p>
                        <p className="text-xs text-gray-500">Per month</p>
                      </div>
                      <p className="text-lg font-bold text-blue-600">Rs {Math.round(monthlyFees).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Admission Fees</p>
                        <p className="text-xs text-gray-500">One time</p>
                      </div>
                      <p className="text-lg font-bold text-green-600">Rs {Math.round(detailViewStudent.admissionFees || 0).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Total Fees</p>
                        <p className="text-xs text-gray-500">Monthly + Admission</p>
                      </div>
                      <p className="text-lg font-bold text-purple-600">Rs {Math.round(updatedStudentStats.totalAmount || 0).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900">Admission Paid</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        updatedStudentStats.admissionPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {updatedStudentStats.admissionPaid ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentFeesDetailPage;