import React, { useState, useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { fetchStudents, generateChallan, bulkGenerateChallans, bulkUpdateChallanStatuses, payFees } from '../store/studentsSlice';
import { FaSearch, FaPlus, FaDollarSign, FaCalendar, FaUser, FaReceipt, FaCheck, FaTimes, FaFilter, FaPrint, FaDownload, FaEye, FaUsers, FaUserFriends } from 'react-icons/fa';
import ChallanPrintView from './ChallanPrintView';
import { printChallanAsPDF } from '../utils/challanPrinter';

const FeesSection = () => {
  const dispatch = useDispatch();
  const { students, loading, error } = useSelector(state => state.students);
  const schoolInfoFromStore = useSelector(state => state.settings.schoolInfo);
  const [searchTerm, setSearchTerm] = useState('');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const [detailViewStudent, setDetailViewStudent] = useState(null);
  const [challanData, setChallanData] = useState({
    studentId: '',
    month: '',
    amount: '',
    dueDate: '',
    description: ''
  });
  const [filterStatus, setFilterStatus] = useState('all');
  const [showPrintView, setShowPrintView] = useState(false);
  const [printChallan, setPrintChallan] = useState(null);
  const [printStudent, setPrintStudent] = useState(null);
  const [showBulkGenerateModal, setShowBulkGenerateModal] = useState(false);
  const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false);
  const [bulkSelectedChallans, setBulkSelectedChallans] = useState([]);
  const [paymentData, setPaymentData] = useState({
    challanId: '',
    paymentMethod: 'cash',
    paymentDate: ''
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  // Add state for bulk generate options
  const [bulkGenerateOptions, setBulkGenerateOptions] = useState({
    generateFor: 'all',
    selectedClass: '',
    selectedSection: ''
  });
  // Add state for class and section filters
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  // Add state for view mode (student or family)
  const [viewMode, setViewMode] = useState('student'); // 'student' or 'family'

  useEffect(() => {
    dispatch(fetchStudents());
  }, [dispatch]);

  // Update detailViewStudent when students data changes
  useEffect(() => {
    if (detailViewStudent && showStudentDetails) {
      const updatedStudent = students.find(s => s.id === detailViewStudent.id);
      if (updatedStudent) {
        // Generate stats for the updated student
        const monthlyChallans = updatedStudent.feesHistory ? updatedStudent.feesHistory.filter(challan => challan.type !== 'admission') : [];
        const admissionChallans = updatedStudent.feesHistory ? updatedStudent.feesHistory.filter(challan => challan.type === 'admission') : [];
        
        const totalChallans = monthlyChallans.length;
        const paidChallans = monthlyChallans.filter(challan => challan.status === 'paid').length;
        const pendingChallans = totalChallans - paidChallans;
        
        // Calculate total amount
        const totalAmount = monthlyChallans.reduce((sum, challan) => sum + (challan.amount || 0), 0);
        
        const paidAmount = monthlyChallans
          .filter(challan => challan.status === 'paid')
          .reduce((sum, challan) => sum + (challan.amount || 0), 0);
        
        const pendingAmount = totalAmount - paidAmount;
        
        // Check if admission fees have been paid
        const admissionPaid = admissionChallans.length > 0 && admissionChallans.every(challan => challan.status === 'paid');
        
        setDetailViewStudent({
          ...updatedStudent,
          totalChallans,
          paidChallans,
          pendingChallans,
          totalAmount,
          paidAmount,
          pendingAmount,
          admissionPaid,
          completionRate: totalChallans > 0 ? Math.round((paidChallans / totalChallans) * 100) : 0
        });
      }
    }
  }, [students, detailViewStudent, showStudentDetails]);

  // Bulk operation functions
  const handleBulkGenerate = () => {
    setShowBulkGenerateModal(true);
  };

  const handleBulkUpdate = () => {
    setShowBulkUpdateModal(true);
  };

  // Challan selection functions
  const isChallanSelected = (challanId) => {
    return bulkSelectedChallans.includes(challanId);
  };

  const handleSelectChallan = (challanId) => {
    // Prevent selecting paid challans
    if (detailViewStudent && detailViewStudent.feesHistory) {
      const challan = detailViewStudent.feesHistory.find(c => c.id === challanId);
      if (challan && challan.status === 'paid') {
        return; // Don't allow selecting paid challans
      }
    }
    
    if (isChallanSelected(challanId)) {
      setBulkSelectedChallans(bulkSelectedChallans.filter(id => id !== challanId));
    } else {
      setBulkSelectedChallans([...bulkSelectedChallans, challanId]);
    }
  };

  const areAllChallansSelected = detailViewStudent && 
    detailViewStudent.feesHistory && 
    detailViewStudent.feesHistory.length > 0 &&
    detailViewStudent.feesHistory
      .filter(challan => challan.status !== 'paid')
      .every(challan => isChallanSelected(challan.id));

  const handleSelectAllChallans = () => {
    if (areAllChallansSelected) {
      // Deselect all
      setBulkSelectedChallans([]);
    } else {
      // Select only pending challans
      if (detailViewStudent && detailViewStudent.feesHistory) {
        const pendingChallanIds = detailViewStudent.feesHistory
          .filter(challan => challan.status !== 'paid')
          .map(challan => challan.id);
        setBulkSelectedChallans(pendingChallanIds);
      }
    }
  };

  // Generate fee statistics for all students
  const generateStudentFeeStats = () => {
    return students.map(student => {
      const monthlyChallans = student.feesHistory ? student.feesHistory.filter(challan => challan.type !== 'admission') : [];
      const admissionChallans = student.feesHistory ? student.feesHistory.filter(challan => challan.type === 'admission') : [];
      
      const totalChallans = monthlyChallans.length;
      const paidChallans = monthlyChallans.filter(challan => challan.status === 'paid').length;
      const pendingChallans = totalChallans - paidChallans;
      
      const totalAmount = monthlyChallans.reduce((sum, challan) => sum + (challan.amount || 0), 0);
      
      const paidAmount = monthlyChallans
        .filter(challan => challan.status === 'paid')
        .reduce((sum, challan) => sum + (challan.amount || 0), 0);
      
      const pendingAmount = totalAmount - paidAmount;
      
      const admissionPaid = admissionChallans.length > 0 && admissionChallans.every(challan => challan.status === 'paid');
      
      return {
        ...student,
        totalChallans,
        paidChallans,
        pendingChallans,
        totalAmount,
        paidAmount,
        pendingAmount,
        admissionPaid,
        completionRate: totalChallans > 0 ? Math.round((paidChallans / totalChallans) * 100) : (admissionPaid ? 100 : 0)
      };
    });
  };

  const studentStats = generateStudentFeeStats();

  const filteredStudents = studentStats.filter(student => {
    const matchesSearch = 
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.section.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'paid' && student.completionRate === 100 && student.admissionPaid) || 
      (filterStatus === 'pending' && (student.completionRate < 100 || !student.admissionPaid));
      
    // Add class and section filters
    const matchesClass = !selectedClass || student.class === selectedClass;
    const matchesSection = !selectedSection || student.section === selectedSection;
    
    return matchesSearch && matchesStatus && matchesClass && matchesSection;
  });

  // Get unique classes for dropdown (similar to CertificatesSection)
  const uniqueClasses = [...new Set(students.map(student => student.class))];

  // Get sections for selected class (similar to CertificatesSection)
  const classSections = selectedClass 
    ? [...new Set(students
        .filter(student => student.class === selectedClass)
        .map(student => student.section))]
    : [];

  // Get all challans grouped by family for family view
  const getFamilyChallans = () => {
    const familyMap = {};
    
    // Group students by familyId and collect all their challans
    filteredStudents.forEach(student => {
      if (!familyMap[student.familyId]) {
        familyMap[student.familyId] = {
          familyId: student.familyId,
          students: [],
          challans: [],
          totalChallans: 0,
          paidChallans: 0,
          pendingChallans: 0,
          totalAmount: 0,
          paidAmount: 0,
          pendingAmount: 0,
          completionRate: 0,
          familyName: `${student.firstName} ${student.lastName}'s Family`
        };
      }
      
      familyMap[student.familyId].students.push(student);
      
      // Add student's challans to family challans list
      if (student.feesHistory && student.feesHistory.length > 0) {
        student.feesHistory.forEach(challan => {
          familyMap[student.familyId].challans.push({
            ...challan,
            studentName: `${student.firstName} ${student.lastName}`,
            studentClass: student.class,
            studentSection: student.section,
            studentId: student.id
          });
        });
      }
      
      // Aggregate statistics
      familyMap[student.familyId].totalChallans += student.totalChallans;
      familyMap[student.familyId].paidChallans += student.paidChallans;
      familyMap[student.familyId].pendingChallans += student.pendingChallans;
      familyMap[student.familyId].totalAmount += student.totalAmount;
      familyMap[student.familyId].paidAmount += student.paidAmount;
      familyMap[student.familyId].pendingAmount += student.pendingAmount;
    });
    
    // Calculate completion rate for each family
    Object.values(familyMap).forEach(family => {
      // Check if all family challans are paid
      const allChallansPaid = family.totalChallans > 0 && family.paidChallans === family.totalChallans;
      // Check if all family admission fees are paid
      const allAdmissionPaid = family.students.every(student => student.admissionPaid);
      
      family.completionRate = family.totalChallans > 0 
        ? Math.round((family.paidChallans / family.totalChallans) * 100) 
        : (allAdmissionPaid ? 100 : 0);
    });
    
    return Object.values(familyMap);
  };

  const familyGroups = getFamilyChallans();

  // Submit bulk generate function
  const submitBulkGenerate = (data) => {
    let studentIds = [];
    
    if (viewMode === 'student') {
      // Student view logic
      if (selectedClass) {
        if (selectedSection) {
          // Generate for specific class and section
          studentIds = filteredStudents
            .filter(student => student.class === selectedClass && student.section === selectedSection)
            .map(student => student.id);
        } else {
          // Generate for specific class only
          studentIds = filteredStudents
            .filter(student => student.class === selectedClass)
            .map(student => student.id);
        }
      } else {
        // If no class filter is selected, generate for all filtered students
        studentIds = filteredStudents.map(student => student.id);
      }
    } else {
      // Family view logic - generate for all students in filtered families
      studentIds = filteredStudents.map(student => student.id);
    }
    
    if (studentIds.length > 0) {
      dispatch(bulkGenerateChallans({ 
        studentIds, 
        challanTemplate: {
          month: data.month,
          amount: data.amount,
          dueDate: data.dueDate,
          description: data.description
        }
      }));
      setShowBulkGenerateModal(false);
      // Reset bulk generate options
      setBulkGenerateOptions({
        generateFor: 'all',
        selectedClass: '',
        selectedSection: ''
      });
    } else {
      alert('No students found for the selected criteria.');
    }
  };

  // Submit bulk update function
  const submitBulkUpdate = (data) => {
    // Filter out any paid challans from the selection
    const pendingChallanIds = bulkSelectedChallans.filter(challanId => {
      if (detailViewStudent && detailViewStudent.feesHistory) {
        const challan = detailViewStudent.feesHistory.find(c => c.id === challanId);
        return challan && challan.status !== 'paid';
      }
      return false;
    });
    
    const challanUpdates = pendingChallanIds.map(challanId => {
      for (const student of students) {
        if (student.feesHistory) {
          const challan = student.feesHistory.find(c => c.id === challanId);
          if (challan) {
            return {
              studentId: student.id,
              challanId: challanId,
              paymentMethod: data.paymentMethod,
              paymentDate: data.paymentDate || new Date().toISOString().split('T')[0] // Today's date if not provided
            };
          }
        }
      }
      return null;
    }).filter(update => update !== null);
    
    if (challanUpdates.length > 0) {
      dispatch(bulkUpdateChallanStatuses({ challanUpdates }));
      
      // Show success message
      setTimeout(() => {
        alert(`Successfully updated ${challanUpdates.length} challan(s)!`);
      }, 100);
    }
    
    setShowBulkUpdateModal(false);
    setBulkSelectedChallans([]);
  };

  // Submit payment function
  const processPayment = (data) => {
    dispatch(payFees(data));
    setShowPaymentModal(false);
  };

  const handleGenerateChallan = () => {
    const today = new Date();
    const currentMonth = today.toISOString().slice(0, 7);
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + 7);
    
    setChallanData({
      studentId: '',
      month: currentMonth,
      amount: '',
      dueDate: dueDate.toISOString().split('T')[0],
      description: ''
    });
    setShowGenerateModal(true);
  };

  const handleStudentChange = (e) => {
    const studentId = e.target.value;
    setChallanData(prev => ({
      ...prev,
      studentId: studentId
    }));
    
    if (studentId) {
      const student = students.find(s => s.id === studentId);
      if (student) {
        setChallanData(prev => ({
          ...prev,
          studentId: studentId,
          amount: student.monthlyFees || ''
        }));
      }
    }
  };

  // Export to CSV function
  const exportToCSV = (data, filename) => {
    const csvContent = [
      Object.keys(data[0]).join(','),
      ...data.map(item => Object.values(item).map(value => 
        typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
      ).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export students data to CSV
  const exportStudentsToCSV = () => {
    const exportData = filteredStudents.map(student => ({
      'Student ID': student.id,
      'Name': `${student.firstName} ${student.lastName}`,
      'Class': student.class,
      'Section': student.section,
      'Total Challans': student.totalChallans,
      'Paid Challans': student.paidChallans,
      'Pending Challans': student.pendingChallans,
      'Total Amount': student.totalAmount,
      'Paid Amount': student.paidAmount,
      'Pending Amount': student.pendingAmount,
      'Completion Rate': `${student.completionRate}%`
    }));
    
    exportToCSV(exportData, 'students_fees_report');
  };

  const submitChallan = (e) => {
    e.preventDefault();
    dispatch(generateChallan(challanData));
    
    // Find the student to pass to print function
    const student = students.find(s => s.id === challanData.studentId);
    if (student) {
      // Create a temporary challan object for printing
      // Convert month format from YYYY-MM to Month YYYY for display
      const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
      const [year, monthIndex] = challanData.month.split('-');
      const monthName = monthNames[parseInt(monthIndex) - 1];
      const formattedMonth = `${monthName} ${year}`;
      // Calculate next challan number
      const existingChallans = student.feesHistory || [];
      const nextChallanNumber = (existingChallans.length + 1).toString().padStart(2, '0');

      const tempChallan = {
        id: `challan-${student.grNo}-${nextChallanNumber}`,
        month: formattedMonth,
        amount: challanData.amount,
        dueDate: challanData.dueDate,
        description: challanData.description,
        status: 'pending',
        date: new Date().toISOString().split('T')[0]
      };
      
      // Show the print view after a short delay to ensure state update
      setTimeout(() => {
        handlePrintChallan(tempChallan, student);
      }, 500);
    }
    
    setShowGenerateModal(false);
    
    setChallanData({
      studentId: '',
      month: '',
      amount: '',
      dueDate: '',
      description: ''
    });
  };

  const handleViewDetails = (student) => {
    setDetailViewStudent(student);
    setShowStudentDetails(true);
  };

  const handleClosePrintView = () => {
    setShowPrintView(false);
    setPrintChallan(null);
    setPrintStudent(null);
  };

  // Function to handle challan printing
  const handlePrintChallan = async (challan, student) => {
    setPrintChallan(challan);
    setPrintStudent(student);
    setShowPrintView(true);
  };

  // Function to actually print the challan
  const handlePrintAction = async () => {
    if (printChallan && printStudent) {
      try {
        // Create safe school info with fallback values
        const safeSchoolInfo = {
          schoolName: schoolInfoFromStore?.schoolName || schoolInfoFromStore?.name || "School Management System",
          schoolAddress: schoolInfoFromStore?.schoolAddress || schoolInfoFromStore?.address || "123 Education Street, Learning City",
          schoolPhone: schoolInfoFromStore?.schoolPhone || schoolInfoFromStore?.phone || "+1 (555) 123-4567"
        };
        
        // Create a simplified, print-optimized HTML version
        const printContent = `
          <div style="width: 80mm; font-family: Arial, Helvetica, sans-serif; font-size: 12px; padding: 10px;">
            <!-- School Header -->
            <div style="text-align: center; border-bottom: 1px solid #ccc; padding-bottom: 10px; margin-bottom: 10px;">
              <h1 style="font-size: 16px; font-weight: bold; margin: 0 0 5px 0;">${safeSchoolInfo.schoolName}</h1>
              <p style="font-size: 10px; margin: 0 0 2px 0;">${safeSchoolInfo.schoolAddress}</p>
              <p style="font-size: 10px; margin: 0;">Phone: ${safeSchoolInfo.schoolPhone}</p>
            </div>

            <!-- Challan Header -->
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <div>
                <h2 style="font-size: 14px; font-weight: bold; margin: 0 0 3px 0;">Fee Challan</h2>
                <p style="font-size: 10px; margin: 0;">ID: ${printChallan.id}</p>
              </div>
              <div style="background: ${printChallan.status === 'paid' ? '#d1fae5' : '#fef3c7'}; 
                          color: ${printChallan.status === 'paid' ? '#065f46' : '#92400e'}; 
                          padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold;">
                ${printChallan.status === 'paid' ? 'PAID' : 'PENDING'}
              </div>
            </div>

            <!-- Student Information -->
            <div style="margin-bottom: 10px;">
              <h3 style="font-size: 12px; font-weight: bold; margin: 0 0 5px 0;">Student Information</h3>
              <div style="background: #f9fafb; padding: 8px; border-radius: 4px;">
                <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 2px; font-size: 10px;">
                  <span style="font-weight: bold;">Name:</span>
                  <span>${printStudent.firstName} ${printStudent.lastName}</span>
                  
                  <span style="font-weight: bold;">Class:</span>
                  <span>${printStudent.class} - Section ${printStudent.section}</span>
                  
                  <span style="font-weight: bold;">Month:</span>
                  <span>${printChallan.month}</span>
                </div>
              </div>
            </div>

            <!-- Fee Details -->
            <div style="margin-bottom: 10px;">
              <h3 style="font-size: 12px; font-weight: bold; margin: 0 0 5px 0;">Fee Details</h3>
              <div style="border: 1px solid #ccc; border-radius: 4px;">
                <div style="display: flex; justify-content: space-between; padding: 6px; background: #f9fafb; border-bottom: 1px solid #ccc; font-size: 10px; font-weight: bold;">
                  <span>Description</span>
                  <span>Amount</span>
                </div>
                <div style="padding: 6px; font-size: 10px;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                    <span>Monthly Tuition Fee</span>
                    <span>Rs ${Math.round(printChallan.amount)}</span>
                  </div>
                  ${printChallan.description ? `
                  <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                    <span>${printChallan.description}</span>
                    <span>Rs 0</span>
                  </div>
                  ` : ''}
                  <div style="display: flex; justify-content: space-between; margin-top: 5px; padding-top: 5px; border-top: 1px solid #ccc; font-weight: bold;">
                    <span>Total Amount</span>
                    <span>Rs ${Math.round(printChallan.amount)}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Dates -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-bottom: 10px;">
              <div>
                <h4 style="font-size: 10px; font-weight: bold; margin: 0 0 3px 0;">Issue Date</h4>
                <div style="background: #f9fafb; padding: 6px; border-radius: 4px; border: 1px solid #ccc; font-size: 10px;">
                  ${new Date(printChallan.date || new Date()).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              </div>
              <div>
                <h4 style="font-size: 10px; font-weight: bold; margin: 0 0 3px 0;">Due Date</h4>
                <div style="background: #f9fafb; padding: 6px; border-radius: 4px; border: 1px solid #ccc; font-size: 10px;">
                  ${new Date(printChallan.dueDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>

            <!-- Payment Information -->
            ${printChallan.status === 'paid' && printChallan.paymentMethod ? `
            <div style="margin-bottom: 10px;">
              <h3 style="font-size: 12px; font-weight: bold; margin: 0 0 5px 0;">Payment Information</h3>
              <div style="background: #d1fae5; padding: 8px; border-radius: 4px; border: 1px solid #10b981; font-size: 10px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2px; margin-bottom: 2px;">
                  <div style="font-weight: bold;">Payment Method:</div>
                  <div style="text-transform: capitalize;">${printChallan.paymentMethod}</div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2px;">
                  <div style="font-weight: bold;">Payment Date:</div>
                  <div>${new Date(printChallan.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}</div>
                </div>
              </div>
            </div>
            ` : ''}

            <!-- Footer -->
            <div style="text-align: center; font-size: 10px; color: #6b7280; padding-top: 8px; border-top: 1px solid #ccc;">
              ${printChallan.status === 'paid' ? 
                '<p>Thank you for your payment.</p>' : 
                '<p>Please pay by the due date.</p>'}
              <p style="margin-top: 3px;">Generated on ${new Date().toLocaleDateString()}</p>
            </div>
          </div>
        `;

        // Use browser print dialog with thermal printer optimized styles
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
          <html>
            <head>
              <title>Challan Print</title>
              <style>
                @media print {
                  @page {
                    size: 80mm auto;
                    margin: 0;
                  }
                  body {
                    margin: 0;
                    padding: 0;
                    font-family: Arial, Helvetica, sans-serif;
                    font-size: 12px;
                    width: 80mm;
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
      } catch (error) {
        console.error('Error printing challan:', error);
      }
    }
  };

  // Function to download the challan as PDF
  const handleDownloadAction = async () => {
    if (printChallan && printStudent) {
      try {
        const filename = `challan_${printStudent.firstName}_${printStudent.lastName}_${printChallan.month.replace(/\s+/g, '_')}.pdf`;
        const success = await printChallanAsPDF(printChallan, printStudent, filename, schoolInfoFromStore);
        if (success) {
          console.log('Challan downloaded successfully');
        } else {
          console.error('Failed to download challan');
        }
      } catch (error) {
        console.error('Error downloading challan:', error);
      }
    }
  };

  const handlePayFees = (challanId) => {
    setPaymentData({
      challanId: challanId,
      paymentMethod: 'cash',
      paymentDate: new Date().toISOString().split('T')[0] // Today's date
    });
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (detailViewStudent && paymentData.challanId) {
      const challan = detailViewStudent.feesHistory.find(c => c.id === paymentData.challanId);
      if (challan) {
        // Ensure we have a payment date, defaulting to today if not provided
        const paymentDate = paymentData.paymentDate || new Date().toISOString().split('T')[0];
        
        dispatch(payFees({
          studentId: detailViewStudent.id,
          amount: challan.amount,
          month: challan.id, // Using challan ID for identification
          paymentMethod: paymentData.paymentMethod,
          paymentDate: paymentDate
        }));
        
        // Show success message
        setTimeout(() => {
          alert('Payment processed successfully!');
        }, 100);
      }
    }
    setShowPaymentModal(false);
  };

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
      {/* Challan Print View */}
      {showPrintView && printChallan && printStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Challan Preview</h3>
              <button 
                onClick={handleClosePrintView}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="py-4 px-6">
              <div className="mb-4 flex justify-center">
                <ChallanPrintView 
                  challan={printChallan} 
                  student={printStudent} 
                  schoolInfo={schoolInfoFromStore}
                  onPrint={handlePrintAction}
                  onDownload={handleDownloadAction}
                />
              </div>
              
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Process Payment</h3>
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={paymentData.paymentMethod}
                  onChange={(e) => setPaymentData({...paymentData, paymentMethod: e.target.value})}
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
                  value={paymentData.paymentDate}
                  onChange={(e) => setPaymentData({...paymentData, paymentDate: e.target.value})}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
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
                  <FaDollarSign className="mr-2" /> Process Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generate Challan Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Generate New Challan</h3>
            <form onSubmit={submitChallan} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    value={challanData.studentId}
                    onChange={handleStudentChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Student</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.firstName} {student.lastName} - {student.class} {student.section}
                      </option>
                    ))}
                  </select>
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
                    value={challanData.month}
                    onChange={(e) => setChallanData({...challanData, month: e.target.value})}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
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
                  value={challanData.description}
                  onChange={(e) => setChallanData({...challanData, description: e.target.value})}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter description (optional)"
                  rows="2"
                />
              </div>
              
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
                >
                  <FaReceipt className="mr-2" /> Generate Challan
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
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Bulk Generate Challans</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const data = {
                month: formData.get('month'),
                amount: formData.get('amount'),
                dueDate: formData.get('dueDate'),
                description: formData.get('description')
              };
              submitBulkGenerate(data);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <input
                  type="month"
                  name="month"
                  defaultValue={new Date().toISOString().slice(0, 7)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input
                  type="number"
                  name="amount"
                  placeholder="Enter amount"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  defaultValue={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  name="description"
                  placeholder="Enter description (optional)"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
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

      <div className="">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Fees Management</h1>
            <p className="mt-1 text-sm text-gray-600">Manage student fees, challans, and payments</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <button
              onClick={handleGenerateChallan}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            >
              <FaPlus className="mr-2" /> Generate Challan
            </button>
            <button
              onClick={exportStudentsToCSV}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <FaDownload className="mr-2" /> Export CSV
            </button>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="my-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs font-medium">Total Students</p>
                  <p className="text-2xl font-bold mt-1">{filteredStudents.length}</p>
                </div>
                <div className="p-2 bg-blue-400 bg-opacity-30 rounded-full">
                  <FaUser size={20} />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-xs font-medium">Fully Paid</p>
                  <p className="text-2xl font-bold mt-1">{filteredStudents.filter(s => s.completionRate === 100).length}</p>
                </div>
                <div className="p-2 bg-green-400 bg-opacity-30 rounded-full">
                  <FaCheck size={20} />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-xs font-medium">Pending</p>
                  <p className="text-2xl font-bold mt-1">{filteredStudents.filter(s => s.completionRate < 100).length}</p>
                </div>
                <div className="p-2 bg-red-400 bg-opacity-30 rounded-full">
                  <FaTimes size={20} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setViewMode('student')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  viewMode === 'student'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaUser className="inline mr-2" />
                Student View
              </button>
              <button
                onClick={() => setViewMode('family')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  viewMode === 'family'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaUsers className="inline mr-2" />
                Family View
              </button>
            </nav>
          </div>
        </div>

        {/* Student Fees Summary Table */}
        {!showStudentDetails ? (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {viewMode === 'student' ? 'Student Fees Summary' : 'Family Fees Summary'}
            </h3>
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="relative flex-grow max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder={viewMode === 'student' 
                      ? "Search by student name, class, or section..." 
                      : "Search by family name..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {/* Status Filter */}
                  <div className="flex items-center space-x-2">
                    <FaFilter className="text-gray-400" />
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Status</option>
                      <option value="paid">Fully Paid</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                  
                  {/* Class Filter - only show in student view */}
                  {viewMode === 'student' && (
                    <div className="flex items-center space-x-2">
                      <FaFilter className="text-gray-400" />
                      <select
                        value={selectedClass}
                        onChange={(e) => {
                          setSelectedClass(e.target.value);
                          setSelectedSection(''); // Reset section when class changes
                        }}
                        className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">All Classes</option>
                        {uniqueClasses.map((cls) => (
                          <option key={cls} value={cls}>{cls}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  {/* Section Filter - only show in student view */}
                  {viewMode === 'student' && (
                    <div className="flex items-center space-x-2">
                      <FaFilter className="text-gray-400" />
                      <select
                        value={selectedSection}
                        onChange={(e) => setSelectedSection(e.target.value)}
                        disabled={!selectedClass}
                        className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">All Sections</option>
                        {classSections.map((section) => (
                          <option key={section} value={section}>{section}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  {/* Bulk Generate Button */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleBulkGenerate}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <FaReceipt className="mr-1" /> Bulk Generate
                    </button>
                  </div>
                  
                  {/* Clear Filters Button */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setFilterStatus('all');
                        setSelectedClass('');
                        setSelectedSection('');
                      }}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {viewMode === 'student' ? (
                      <>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class/Section</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Challans</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </>
                    ) : (
                      <>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class/Section</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {viewMode === 'student' ? (
                    filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{student.paidChallans}/{student.totalChallans}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">Rs {Math.round(student.paidAmount)}/{Math.round(student.totalAmount)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${student.completionRate}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-700">{student.completionRate}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleViewDetails(student)}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <FaEye className="mr-1" /> View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    familyGroups.map((family) => (
                      <React.Fragment key={family.familyId}>
                        {/* Family Header Row */}
                        <tr className="bg-gray-50">
                          <td className="px-6 py-3" colSpan="6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <FaUserFriends className="text-gray-500 mr-2" />
                                <div>
                                  <div className="text-sm font-bold text-gray-900">
                                    {family.familyName}
                                  </div>
                                  <div className="text-xs text-gray-500">Family ID: {family.familyId}</div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4">
                                <div className="text-sm">
                                  <span className="text-gray-500">Students: </span>
                                  <span className="font-medium">{family.students.length}</span>
                                </div>
                                <div className="text-sm">
                                  <span className="text-gray-500">Challans: </span>
                                  <span className="font-medium">{family.paidChallans}/{family.totalChallans}</span>
                                </div>
                                <div className="text-sm">
                                  <span className="text-gray-500">Amount: </span>
                                  <span className="font-medium">Rs {Math.round(family.paidAmount)}/{Math.round(family.totalAmount)}</span>
                                </div>
                                <div className="flex items-center">
                                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                                    <div 
                                      className="bg-blue-600 h-2 rounded-full" 
                                      style={{ width: `${family.completionRate}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs font-medium text-gray-700">{family.completionRate}%</span>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                        {/* Individual Challan Rows */}
                        {family.challans.map((challan) => (
                          <tr key={`${family.familyId}-${challan.id}`} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {challan.studentName}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {challan.studentId}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{challan.studentClass}</div>
                              <div className="text-sm text-gray-500">Section {challan.studentSection}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{challan.month}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">Rs {Math.round(challan.amount)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                challan.status === 'paid' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {challan.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-2">
                                {challan.status !== 'paid' ? (
                                  <button
                                    onClick={() => {
                                      // Find the student for this challan
                                      const student = students.find(s => s.id === challan.studentId);
                                      if (student) {
                                        handlePayFees(challan.id);
                                      }
                                    }}
                                    className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-lg text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                                  >
                                    <FaDollarSign className="mr-1" /> Pay
                                  </button>
                                ) : null}
                                <button
                                  onClick={() => {
                                    // Find the student for this challan
                                    const student = students.find(s => s.id === challan.studentId);
                                    if (student) {
                                      handlePrintChallan(challan, student);
                                    }
                                  }}
                                  className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                                >
                                  <FaPrint className="mr-1" /> Print
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
              {(viewMode === 'student' ? filteredStudents.length === 0 : familyGroups.every(f => f.challans.length === 0)) && (
                <div className="text-center py-12">
                  <FaUser className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No {viewMode === 'student' ? 'students' : 'challans'} found</h3>
                  <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Student Details View
          <div className="bg-white rounded-2xl shadow-lg p-6">
            {detailViewStudent && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <button
                      onClick={() => setShowStudentDetails(false)}
                      className="mr-4 text-gray-500 hover:text-gray-700"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div className="flex items-center">
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12" />
                      <div className="ml-4">
                        <h3 className="text-xl font-bold text-gray-900">
                          {detailViewStudent.firstName} {detailViewStudent.lastName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {detailViewStudent.class} - Section {detailViewStudent.section}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Completion Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{detailViewStudent.completionRate}%</p>
                  </div>
                </div>

                {/* Student Stats */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-800">Total Challans</p>
                    <p className="text-2xl font-bold text-blue-900">{detailViewStudent.totalChallans || 0}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-800">Paid Challans</p>
                    <p className="text-2xl font-bold text-green-900">{detailViewStudent.paidChallans || 0}</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">Pending Challans</p>
                    <p className="text-2xl font-bold text-yellow-900">{detailViewStudent.pendingChallans || 0}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-purple-800">Total Amount</p>
                    <p className="text-2xl font-bold text-purple-900">Rs {Math.round(detailViewStudent.totalAmount) || 0}</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4">
                    <p className="text-sm text-red-800">Pending Amount</p>
                    <p className="text-2xl font-bold text-red-900">Rs {isNaN(detailViewStudent.pendingAmount) ? '0' : Math.round(detailViewStudent.pendingAmount || 0).toLocaleString()}</p>
                  </div>
                </div>

                {/* Detailed Challans Table */}
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Challan Details</h4>
                  <div>
                    {bulkSelectedChallans.length > 0 && (
                      <button
                        onClick={handleBulkUpdate}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                      >
                        <FaCheck className="mr-1" /> Update {bulkSelectedChallans.length} Selected
                      </button>
                    )}
                  </div>
                </div>
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <input
                            type="checkbox"
                            checked={areAllChallansSelected}
                            onChange={handleSelectAllChallans}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
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
                      {detailViewStudent.feesHistory && detailViewStudent.feesHistory.map((challan) => (
                        <tr key={challan.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={isChallanSelected(challan.id)}
                              onChange={() => handleSelectChallan(challan.id)}
                              disabled={challan.status === 'paid'}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {challan.month}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            Rs {Math.round(challan.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(challan.dueDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              challan.status === 'paid' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {challan.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              {challan.status !== 'paid' ? (
                                <button
                                  onClick={() => handlePayFees(challan.id)}
                                  className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-lg text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                                >
                                  <FaDollarSign className="mr-1" /> Pay
                                </button>
                              ) : null}
                              <button
                                onClick={() => handlePrintChallan(challan, detailViewStudent)}
                                className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                              >
                                <FaPrint className="mr-1" /> Print
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {(!detailViewStudent.feesHistory || detailViewStudent.feesHistory.length === 0) && (
                    <div className="text-center py-12">
                      <FaReceipt className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No challans found</h3>
                      <p className="mt-1 text-sm text-gray-500">This student has no fee challans yet</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default FeesSection;