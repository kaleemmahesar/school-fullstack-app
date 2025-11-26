import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { bulkUpdateChallanStatuses } from '../../store/studentsSlice';
import { FaBarcode, FaQrcode, FaDollarSign, FaSearch, FaCreditCard, FaMoneyCheck, FaMobileAlt } from 'react-icons/fa';
import PageHeader from '../common/PageHeader';

const BarcodePayment = () => {
  const dispatch = useDispatch();
  const { students } = useSelector(state => state.students);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scannedStudent, setScannedStudent] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedChallans, setSelectedChallans] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const barcodeInputRef = useRef(null);

  // Focus on barcode input when component mounts
  React.useEffect(() => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, []);

  // Find student by barcode/ID
  const findStudentByBarcode = (barcode) => {
    // In a real implementation, this would be a student ID or barcode
    // For demo purposes, we'll use student ID
    return students.find(student => student.id === barcode);
  };

  // Handle barcode scan
  const handleBarcodeScan = (e) => {
    if (e.key === 'Enter') {
      const student = findStudentByBarcode(barcodeInput);
      if (student) {
        setScannedStudent(student);
        // Auto-select all pending challans for the student
        if (student.feesHistory) {
          const pendingChallanIds = student.feesHistory
            .filter(challan => !challan.paid)
            .map(challan => challan.id);
          setSelectedChallans(pendingChallanIds);
        }
      } else {
        alert('Student not found. Please check the barcode/ID and try again.');
      }
      setBarcodeInput('');
    }
  };

  // Toggle challan selection
  const toggleChallanSelection = (challanId) => {
    if (selectedChallans.includes(challanId)) {
      setSelectedChallans(selectedChallans.filter(id => id !== challanId));
    } else {
      setSelectedChallans([...selectedChallans, challanId]);
    }
  };

  // Select all pending challans
  const selectAllPendingChallans = () => {
    if (scannedStudent && scannedStudent.feesHistory) {
      const pendingChallanIds = scannedStudent.feesHistory
        .filter(challan => !challan.paid)
        .map(challan => challan.id);
      setSelectedChallans(pendingChallanIds);
    }
  };

  // Deselect all challans
  const deselectAllChallans = () => {
    setSelectedChallans([]);
  };

  // Check if all pending challans are selected
  const areAllPendingChallansSelected = () => {
    if (!scannedStudent || !scannedStudent.feesHistory) return false;
    const pendingChallanIds = scannedStudent.feesHistory
      .filter(challan => !challan.paid)
      .map(challan => challan.id);
    return pendingChallanIds.length > 0 && 
           pendingChallanIds.every(id => selectedChallans.includes(id));
  };

  // Process payment for selected challans
  const processPayment = () => {
    if (selectedChallans.length === 0 || !scannedStudent) return;
    
    // Create update objects for each selected challan
    const challanUpdates = selectedChallans.map(challanId => ({
      studentId: scannedStudent.id,
      challanId: challanId,
      paymentMethod: paymentMethod,
      paymentDate: paymentDate
    }));
    
    // Dispatch action to update all selected challans
    dispatch(bulkUpdateChallanStatuses({ challanUpdates }));
    
    // Reset selection and close modal
    setSelectedChallans([]);
    setShowPaymentModal(false);
    setScannedStudent(null);
  };

  // Get total amount for selected challans
  const getSelectedChallansTotal = () => {
    if (!scannedStudent || !scannedStudent.feesHistory) return 0;
    
    let total = 0;
    selectedChallans.forEach(challanId => {
      const challan = scannedStudent.feesHistory.find(c => c.id === challanId);
      if (challan) {
        total += challan.amount || 0;
      }
    });
    return total;
  };

  // Get pending challans for scanned student
  const getPendingChallans = () => {
    if (!scannedStudent || !scannedStudent.feesHistory) return [];
    return scannedStudent.feesHistory.filter(challan => !challan.paid);
  };

  return (
    <>
      <PageHeader
        title="Barcode Payment System"
        subtitle="Scan barcodes to quickly process student fee payments"
        actionButton={null}
      />

      {/* Barcode Scanner Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-4 bg-gray-100 rounded-full mb-4">
            <FaBarcode className="h-12 w-12 text-gray-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Scan Student Barcode/ID</h3>
          <p className="text-sm text-gray-500 mt-1">Use a barcode scanner or manually enter student ID</p>
        </div>
        
        <div className="max-w-md mx-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaQrcode className="h-5 w-5 text-gray-400" />
            </div>
            <input
              ref={barcodeInputRef}
              type="text"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              onKeyDown={handleBarcodeScan}
              placeholder="Scan barcode or enter student ID..."
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-center text-lg"
              autoFocus
            />
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">Press Enter after scanning or typing</p>
        </div>
      </div>

      {/* Scanned Student Information */}
      {scannedStudent && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
              <div className="ml-4">
                <h3 className="text-xl font-bold text-gray-900">
                  {scannedStudent.firstName} {scannedStudent.lastName}
                </h3>
                <p className="text-sm text-gray-500">
                  ID: {scannedStudent.id} • {scannedStudent.class} - Section {scannedStudent.section}
                </p>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <button
                onClick={() => {
                  setScannedStudent(null);
                  setSelectedChallans([]);
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Scan Another Student
              </button>
            </div>
          </div>

          {/* Pending Challans */}
          <div className="mb-4 flex justify-between items-center">
            <h4 className="text-lg font-semibold text-gray-900">
              Pending Challans ({getPendingChallans().length})
            </h4>
            <div>
              {getPendingChallans().length > 0 && (
                <div className="flex space-x-2">
                  {areAllPendingChallansSelected() ? (
                    <button
                      onClick={deselectAllChallans}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Deselect All
                    </button>
                  ) : (
                    <button
                      onClick={selectAllPendingChallans}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Select All
                    </button>
                  )}
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    disabled={selectedChallans.length === 0}
                    className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                      selectedChallans.length === 0
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                    }`}
                  >
                    <FaDollarSign className="mr-1" /> Pay Selected ({selectedChallans.length})
                  </button>
                </div>
              )}
            </div>
          </div>

          {getPendingChallans().length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={areAllPendingChallansSelected()}
                        onChange={areAllPendingChallansSelected() ? deselectAllChallans : selectAllPendingChallans}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getPendingChallans().map((challan) => (
                    <tr key={challan.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedChallans.includes(challan.id)}
                          onChange={() => toggleChallanSelection(challan.id)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {challan.month}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${challan.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {challan.dueDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <FaDollarSign className="mx-auto h-12 w-12 text-green-500" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">All fees paid</h3>
              <p className="mt-1 text-sm text-gray-500">No pending challans for this student</p>
            </div>
          )}
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && scannedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Process Payment</h3>
            
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Student:</span>
                <span className="font-medium">{scannedStudent.firstName} {scannedStudent.lastName}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Selected Challans:</span>
                <span className="font-medium">{selectedChallans.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Amount:</span>
                <span className="font-medium text-lg text-green-600">${getSelectedChallansTotal().toFixed(2)}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`flex flex-col items-center justify-center p-3 border rounded-lg ${
                      paymentMethod === 'cash'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <FaMoneyCheck className="text-xl mb-1" />
                    <span className="text-sm">Cash</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('bank')}
                    className={`flex flex-col items-center justify-center p-3 border rounded-lg ${
                      paymentMethod === 'bank'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <FaCreditCard className="text-xl mb-1" />
                    <span className="text-sm">Bank Transfer</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('easypaisa')}
                    className={`flex flex-col items-center justify-center p-3 border rounded-lg ${
                      paymentMethod === 'easypaisa'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <FaMobileAlt className="text-xl mb-1" />
                    <span className="text-sm">EasyPaisa</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('jazzcash')}
                    className={`flex flex-col items-center justify-center p-3 border rounded-lg ${
                      paymentMethod === 'jazzcash'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <FaMobileAlt className="text-xl mb-1" />
                    <span className="text-sm">JazzCash</span>
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={processPayment}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <FaDollarSign className="mr-2" /> Process Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!scannedStudent && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">How to Use Barcode Payment</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 rounded-full mb-3">
                1
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Scan Barcode</h4>
              <p className="text-sm text-gray-500">Use a barcode scanner to scan the student's ID card or manually enter the student ID.</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 rounded-full mb-3">
                2
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Review Challans</h4>
              <p className="text-sm text-gray-500">All pending challans for the student will be displayed. Select the ones you want to pay.</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 rounded-full mb-3">
                3
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Process Payment</h4>
              <p className="text-sm text-gray-500">Choose payment method and process the payment for selected challans.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BarcodePayment;