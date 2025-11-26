import React, { useState } from 'react';
import { FaDollarSign, FaMoneyBillWave } from 'react-icons/fa';

const StaffFinancialModal = ({ staffMember, onClose, onAddAdvance, onPaySalary }) => {
  const [amount, setAmount] = useState('');
  const [amountType, setAmountType] = useState('advance'); // 'advance' or 'salary'
  const [advanceReason, setAdvanceReason] = useState('');
  const [salaryMonth, setSalaryMonth] = useState(new Date().toISOString().slice(0, 7)); // Default to current month
  const [paymentMethod, setPaymentMethod] = useState('cash');

  // Calculate total salary (base + allowances) for display
  const calculateTotalSalary = () => {
    const baseSalary = parseFloat(staffMember.salary || 0);
    const totalAllowances = (staffMember.allowances || []).reduce((sum, allowance) => {
      return sum + parseFloat(allowance.amount || 0);
    }, 0);
    return baseSalary + totalAllowances;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (amountType === 'advance') {
      if (amount && advanceReason) {
        onAddAdvance({
          staffId: staffMember.id,
          advanceAmount: amount,
          reason: advanceReason
        });
        onClose();
      }
    } else {
      // For salary, we don't need amount as it's calculated automatically
      if (salaryMonth && paymentMethod) {
        onPaySalary({
          staffId: staffMember.id,
          month: salaryMonth,
          paymentMethod
        });
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Add Payment - {staffMember.firstName} {staffMember.lastName}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount Type</label>
            <select
              value={amountType}
              onChange={(e) => setAmountType(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="advance">Advance</option>
              <option value="salary">Salary</option>
            </select>
          </div>
          
          {amountType === 'advance' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaDollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter advance amount"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <input
                  type="text"
                  value={advanceReason}
                  onChange={(e) => setAdvanceReason(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Reason for advance"
                  required
                />
              </div>
            </>
          ) : (
            <>
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">Monthly Salary</p>
                <p className="text-lg font-bold text-gray-900">Rs {calculateTotalSalary().toFixed(2)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salary Month</label>
                <input
                  type="month"
                  value={salaryMonth}
                  onChange={(e) => setSalaryMonth(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="cash">Cash</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
            </>
          )}
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {amountType === 'advance' ? 'Add Advance' : 'Pay Salary'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffFinancialModal;