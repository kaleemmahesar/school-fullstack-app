import React, { useState } from 'react';
import { FaDollarSign, FaMoneyBillWave, FaRupeeSign } from 'react-icons/fa';

const StaffFinancialModal = ({ staffMember, onClose, onAddAdvance, onPaySalary }) => {
  const [amount, setAmount] = useState('');
  const [amountType, setAmountType] = useState('advance'); // 'advance' or 'salary'
  const [advanceReason, setAdvanceReason] = useState('');
  const [salaryMonth, setSalaryMonth] = useState(new Date().toISOString().slice(0, 7)); // Default to current month
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [chequeAmount, setChequeAmount] = useState('');
  const [chequeAmountInWords, setChequeAmountInWords] = useState('');
  const [chequeDate, setChequeDate] = useState(new Date().toISOString().split('T')[0]);

  // Calculate total salary (base + allowances) for display
  const calculateTotalSalary = () => {
    const baseSalary = parseFloat(staffMember.salary || 0);
    const totalAllowances = (staffMember.allowances || []).reduce((sum, allowance) => {
      return sum + parseFloat(allowance.amount || 0);
    }, 0);
    return baseSalary + totalAllowances;
  };

  // Convert number to words for cheque amount
  const calculateAmountInWords = (num) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    if (num === 0) return 'Zero';
    
    let result = '';
    
    if (num >= 10000000) {
      result += ones[Math.floor(num / 10000000)] + ' Crore ';
      num %= 10000000;
    }
    
    if (num >= 100000) {
      result += ones[Math.floor(num / 100000)] + ' Lakh ';
      num %= 100000;
    }
    
    if (num >= 1000) {
      result += ones[Math.floor(num / 1000)] + ' Thousand ';
      num %= 1000;
    }
    
    if (num >= 100) {
      result += ones[Math.floor(num / 100)] + ' Hundred ';
      num %= 100;
    }
    
    if (num > 0) {
      if (num < 20) {
        result += ones[num] + ' ';
      } else {
        result += tens[Math.floor(num / 10)] + ' ' + ones[num % 10] + ' ';
      }
    }
    
    return result + 'Rupees Only';
  };

  // Handle cheque amount change
  const handleChequeAmountChange = (e) => {
    const amount = e.target.value;
    setChequeAmount(amount);
    setChequeAmountInWords(calculateAmountInWords(parseInt(amount) || 0));
  };

  // Show cheque print view
  const showChequePrintView = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Cheque Print Preview</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            margin: 20px;
            background: #f5f5f5;
          }
          .cheque-container {
            width: 800px;
            height: 400px;
            margin: 0 auto;
            background: white;
            border: 2px solid #333;
            padding: 30px;
            position: relative;
            box-shadow: 0 0 10px rgba(0,0,0,0.3);
          }
          .cheque-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
          }
          .bank-info {
            font-weight: bold;
            font-size: 18px;
            color: #1a365d;
          }
          .date-box {
            border: 2px solid #333;
            padding: 5px 15px;
            text-align: center;
          }
          .pay-field {
            margin: 20px 0;
            border-bottom: 1px solid #999;
            padding-bottom: 5px;
          }
          .amount-section {
            margin: 20px 0;
          }
          .amount-words {
            margin: 20px 0;
            border-bottom: 1px solid #999;
            padding-bottom: 5px;
          }
          .signature-area {
            position: absolute;
            bottom: 30px;
            right: 30px;
            text-align: right;
          }
          .signature-line {
            border-top: 2px solid #333;
            width: 150px;
            margin-top: 40px;
            padding-top: 5px;
          }
          .print-controls {
            text-align: center;
            margin: 20px;
          }
          .print-btn {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 10px 20px;
            font-size: 16px;
            cursor: pointer;
            border-radius: 5px;
            margin: 0 10px;
          }
          .print-btn:hover {
            background: #2563eb;
          }
          .close-btn {
            background: #6b7280;
          }
          .close-btn:hover {
            background: #4b5563;
          }
        </style>
      </head>
      <body>
        <div class="print-controls">
          <button class="print-btn" onclick="window.print()">🖨️ Print Cheque</button>
          <button class="print-btn close-btn" onclick="window.close()">❌ Close</button>
        </div>
        
        <div class="cheque-container">
          <div class="cheque-header">
            <div class="bank-info">
              STATE BANK OF PAKISTAN<br/>
              <span style="font-size: 14px; font-weight: normal;">Main Branch, Karachi</span><br/>
              <span style="font-size: 12px; font-weight: normal;">A/C No: 0011-2233445566</span>
            </div>
            <div class="date-box">
              <div style="font-size: 12px;">Date</div>
              <div style="font-weight: bold;">${new Date(chequeDate).toLocaleDateString('en-GB')}</div>
            </div>
          </div>
          
          <div class="pay-field">
            <strong>Pay</strong> ${staffMember.firstName} ${staffMember.lastName}
            <span style="font-size: 12px; margin-left: 10px;">(${staffMember.designation})</span>
          </div>
          
          <div class="amount-section">
            <strong>Rupees</strong> Rs. ${parseFloat(chequeAmount).toLocaleString()}
          </div>
          
          <div class="amount-words">
            <strong>Amount in words:</strong> ${chequeAmountInWords}
          </div>
          
          <div class="signature-area">
            <div>For office use only</div>
            <div style="margin: 30px 0;">_________________________</div>
            <div style="font-size: 12px;">Account Officer</div>
            
            <div style="margin-top: 40px;">
              <div style="font-size: 12px;">On behalf of</div>
              <div style="font-size: 12px;">STATE BANK OF PAKISTAN</div>
            </div>
            <div class="signature-line">
              <div style="font-size: 12px;">Authorized Signatory</div>
            </div>
          </div>
        </div>
        
        <script>
          // Auto-focus for better user experience
          window.focus();
          
          // Add keyboard shortcuts
          document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
              window.close();
            } else if (e.ctrlKey && e.key === 'p') {
              e.preventDefault();
              window.print();
            }
          });
        </script>
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Process the payment in the background
    onPaySalary({
      staffId: staffMember.id,
      month: salaryMonth,
      paymentMethod: 'cheque',
      chequeAmount: chequeAmount,
      chequeAmountInWords: chequeAmountInWords,
      chequeDate: chequeDate
    });
    
    // Close the modal
    onClose();
  };

  // Handle form submission
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
      // For salary, check payment method
      if (salaryMonth) {
        if (paymentMethod === 'cheque') {
          // For cheque, we need amount fields to be filled
          if (chequeAmount && chequeAmountInWords) {
            // Show cheque print preview
            showChequePrintView();
          }
        } else {
          // For other payment methods
          onPaySalary({
            staffId: staffMember.id,
            month: salaryMonth,
            paymentMethod: paymentMethod
          });
          onClose();
        }
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

              {/* Cheque Payment Form - Only shown when cheque is selected */}
              {paymentMethod === 'cheque' && (
                <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50 mt-4">
                  <h4 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                    <FaRupeeSign className="mr-2" /> Cheque Payment Details
                  </h4>
                  
                  {/* Cheque Preview */}
                  <div className="bg-white border border-gray-300 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Pay</p>
                        <p className="text-lg font-semibold">{staffMember.firstName} {staffMember.lastName}</p>
                        <p className="text-xs text-gray-500">({staffMember.designation})</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Date: {new Date(chequeDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Rupees</p>
                        <p className="text-xl font-bold">{parseFloat(chequeAmount || 0).toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">In Words:</p>
                      <p className="text-sm font-semibold">{chequeAmountInWords || 'Amount in words will appear here'}</p>
                    </div>
                  </div>
                  
                  {/* Cheque Input Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Amount (Rs.)</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaRupeeSign className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          value={chequeAmount}
                          onChange={handleChequeAmountChange}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter amount"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <input
                        type="date"
                        value={chequeDate}
                        onChange={(e) => setChequeDate(e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> This is a preview of the cheque. Please ensure all details are correct before printing on real cheque.
                    </p>
                  </div>
                </div>
              )}
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
              disabled={paymentMethod === 'cheque' && (!chequeAmount || !chequeAmountInWords)}
              className={`inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                (paymentMethod === 'cheque' && (!chequeAmount || !chequeAmountInWords))
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
              }`}
            >
              {amountType === 'advance' ? 'Add Advance' : 
               paymentMethod === 'cheque' ? 'Print Cheque & Pay' : 'Pay Salary'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffFinancialModal;