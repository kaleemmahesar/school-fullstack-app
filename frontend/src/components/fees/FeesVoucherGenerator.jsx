import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { FaFileInvoice, FaSearch, FaFilter, FaDownload, FaPrint } from 'react-icons/fa';
import PageHeader from '../common/PageHeader';

const FeesVoucherGenerator = () => {
  const { students } = useSelector(state => state.students);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [generationType, setGenerationType] = useState('all'); // 'all', 'class', 'single'
  const [selectedStudent, setSelectedStudent] = useState('');
  const [voucherMonth, setVoucherMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
  const [voucherYear, setVoucherYear] = useState(new Date().getFullYear().toString());
  const [showPreview, setShowPreview] = useState(false);
  const [previewVouchers, setPreviewVouchers] = useState([]);

  // Get unique classes for dropdown
  const uniqueClasses = [...new Set(students.map(student => student.class))];

  // Get sections for selected class
  const classSections = selectedClass 
    ? [...new Set(students
        .filter(student => student.class === selectedClass)
        .map(student => student.section))]
    : [];

  // Filter students based on search term, class, and section
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.class.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesClass = !selectedClass || student.class === selectedClass;
    const matchesSection = !selectedSection || student.section === selectedSection;
    
    return matchesSearch && matchesClass && matchesSection;
  });

  // Generate fees for a student
  const generateStudentVoucher = (student) => {
    const monthlyFee = parseFloat(student.monthlyFee) || 0;
    const examFee = parseFloat(student.examFee) || 0;
    const idCardFee = parseFloat(student.idCardFee) || 0;
    const transportFee = parseFloat(student.transportFee) || 0;
    const previousDues = parseFloat(student.previousDues) || 0;
    const lateFee = parseFloat(student.lateFee) || 0;
    const discount = parseFloat(student.discount) || 0;
    const admissionFee = generationType === 'single' ? (parseFloat(student.admissionFee) || 0) : 0;
    const oldBalance = generationType === 'single' ? (parseFloat(student.oldBalance) || 0) : 0;
    
    const totalAmount = monthlyFee + examFee + idCardFee + transportFee + 
                       previousDues + lateFee + admissionFee + oldBalance - discount;
    
    return {
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`,
      class: student.class,
      section: student.section,
      fatherName: student.fatherName,
      rollNumber: student.rollNumber,
      voucherMonth,
      voucherYear,
      dueDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 7).toLocaleDateString(),
      fees: {
        monthlyFee,
        examFee,
        idCardFee,
        transportFee,
        previousDues,
        lateFee,
        discount,
        admissionFee,
        oldBalance
      },
      totalAmount
    };
  };

  // Generate vouchers based on selected type
  const generateVouchers = () => {
    let vouchers = [];
    
    if (generationType === 'all') {
      vouchers = filteredStudents.map(student => generateStudentVoucher(student));
    } else if (generationType === 'class') {
      vouchers = filteredStudents.map(student => generateStudentVoucher(student));
    } else if (generationType === 'single' && selectedStudent) {
      const student = students.find(s => s.id === selectedStudent);
      if (student) {
        vouchers = [generateStudentVoucher(student)];
      }
    }
    
    setPreviewVouchers(vouchers);
    setShowPreview(true);
  };

  // Print vouchers
  const printVouchers = () => {
    const printContent = document.getElementById('voucher-print-content').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Fees Vouchers</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .voucher { 
              border: 1px solid #333; 
              padding: 20px; 
              margin-bottom: 20px; 
              width: 800px;
              page-break-after: always;
            }
            .header { 
              text-align: center; 
              border-bottom: 2px solid #333; 
              padding-bottom: 10px; 
              margin-bottom: 20px; 
            }
            .student-info { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 20px; 
            }
            .info-group { 
              margin-bottom: 10px; 
            }
            .info-label { 
              font-weight: bold; 
              display: inline-block; 
              width: 120px; 
            }
            .fees-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 20px; 
            }
            .fees-table th, 
            .fees-table td { 
              border: 1px solid #333; 
              padding: 8px; 
              text-align: left; 
            }
            .fees-table th { 
              background-color: #f0f0f0; 
            }
            .total-row { 
              font-weight: bold; 
            }
            .footer { 
              text-align: center; 
              margin-top: 30px; 
              font-size: 12px; 
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none !important; }
              .voucher { 
                page-break-after: always; 
                border: none;
              }
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // Download vouchers as PDF
  const downloadVouchers = () => {
    // In a real implementation, this would generate and download a PDF
    alert('Downloading vouchers as PDF...');
  };

  return (
    <>
      <PageHeader
        title="Fees Vouchers Generator"
        subtitle="Create fees vouchers for all students, by class, or for a single student"
        actionButton={null}
      />

      {/* Generation Controls */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Generation Type</label>
            <div className="flex rounded-md shadow-sm">
              <button
                onClick={() => setGenerationType('all')}
                className={`flex-1 inline-flex items-center justify-center px-3 py-2 border text-sm font-medium rounded-l-md ${
                  generationType === 'all'
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                All Students
              </button>
              <button
                onClick={() => setGenerationType('class')}
                className={`flex-1 inline-flex items-center justify-center px-3 py-2 border text-sm font-medium ${
                  generationType === 'class'
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                By Class
              </button>
              <button
                onClick={() => setGenerationType('single')}
                className={`flex-1 inline-flex items-center justify-center px-3 py-2 border text-sm font-medium rounded-r-md ${
                  generationType === 'single'
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Single Student
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Voucher Month</label>
            <select
              value={voucherMonth}
              onChange={(e) => setVoucherMonth(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              {Array.from({length: 12}, (_, i) => new Date(0, i).toLocaleString('default', { month: 'long' })).map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Voucher Year</label>
            <input
              type="number"
              value={voucherYear}
              onChange={(e) => setVoucherYear(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              min="2020"
              max="2030"
            />
          </div>
          
          {generationType === 'single' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Student</label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a student</option>
                {filteredStudents.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.firstName} {student.lastName} - {student.class}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        
        {(generationType === 'class' || generationType === 'all') && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
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
        )}
        
        <div className="flex justify-end">
          <button
            onClick={generateVouchers}
            disabled={generationType === 'single' && !selectedStudent}
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${
              generationType === 'single' && !selectedStudent ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <FaFileInvoice className="mr-2" /> Generate Vouchers
          </button>
        </div>
      </div>

      {/* Students Table (for class/all generation) */}
      {(generationType === 'class' || generationType === 'all') && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Students ({filteredStudents.length})
          </h3>
          
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class/Section</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Fee</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Fees</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {student.firstName} {student.lastName}
                          </div>
                          <div className="text-sm text-gray-500">ID: {student.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.class}</div>
                      <div className="text-sm text-gray-500">Section {student.section}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Rs. {student.monthlyFee || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Rs. {student.totalFees || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredStudents.length === 0 && (
              <div className="text-center py-12">
                <FaFileInvoice className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
                <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Voucher Preview */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">Voucher Preview</h3>
              <div className="flex space-x-2">
                <button
                  onClick={printVouchers}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 no-print"
                >
                  <FaPrint className="mr-2" /> Print
                </button>
                <button
                  onClick={downloadVouchers}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 no-print"
                >
                  <FaDownload className="mr-2" /> Download
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-500 hover:text-gray-700 no-print"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="py-6 px-6">
              <div id="voucher-print-content">
                {previewVouchers.map((voucher, index) => (
                  <div key={`${voucher.studentId}-${index}`} className="voucher">
                    <div className="header">
                      <h1>SCHOOL MANAGEMENT SYSTEM</h1>
                      <h2>FEES VOUCHER</h2>
                      <p>Month: {voucher.voucherMonth} {voucher.voucherYear}</p>
                    </div>
                    
                    <div className="student-info">
                      <div>
                        <div className="info-group">
                          <span className="info-label">Student Name:</span>
                          <span>{voucher.studentName}</span>
                        </div>
                        <div className="info-group">
                          <span className="info-label">Father Name:</span>
                          <span>{voucher.fatherName}</span>
                        </div>
                        <div className="info-group">
                          <span className="info-label">Class/Section:</span>
                          <span>{voucher.class} - {voucher.section}</span>
                        </div>
                      </div>
                      <div>
                        <div className="info-group">
                          <span className="info-label">Student ID:</span>
                          <span>{voucher.studentId}</span>
                        </div>
                        <div className="info-group">
                          <span className="info-label">Roll Number:</span>
                          <span>{voucher.rollNumber}</span>
                        </div>
                        <div className="info-group">
                          <span className="info-label">Due Date:</span>
                          <span>{voucher.dueDate}</span>
                        </div>
                      </div>
                    </div>
                    
                    <table className="fees-table">
                      <thead>
                        <tr>
                          <th>Description</th>
                          <th>Amount (Rs.)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Monthly Fee</td>
                          <td>{voucher.fees.monthlyFee.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td>Exam Fee</td>
                          <td>{voucher.fees.examFee.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td>ID Card Fee</td>
                          <td>{voucher.fees.idCardFee.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td>Transport Fee</td>
                          <td>{voucher.fees.transportFee.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td>Previous Dues</td>
                          <td>{voucher.fees.previousDues.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td>Late Fee</td>
                          <td>{voucher.fees.lateFee.toFixed(2)}</td>
                        </tr>
                        {voucher.fees.admissionFee > 0 && (
                          <tr>
                            <td>Admission Fee</td>
                            <td>{voucher.fees.admissionFee.toFixed(2)}</td>
                          </tr>
                        )}
                        {voucher.fees.oldBalance > 0 && (
                          <tr>
                            <td>Old Balance</td>
                            <td>{voucher.fees.oldBalance.toFixed(2)}</td>
                          </tr>
                        )}
                        {voucher.fees.discount > 0 && (
                          <tr>
                            <td>Discount</td>
                            <td>-{voucher.fees.discount.toFixed(2)}</td>
                          </tr>
                        )}
                        <tr className="total-row">
                          <td>Total Amount</td>
                          <td>{voucher.totalAmount.toFixed(2)}</td>
                        </tr>
                      </tbody>
                    </table>
                    
                    <div className="footer">
                      <p><strong>Instructions:</strong></p>
                      <p>1. Please pay the fees before the due date to avoid late fees.</p>
                      <p>2. Keep this voucher for your records.</p>
                      <p>3. For any queries, contact the school administration.</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FeesVoucherGenerator;