import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaUserCheck, FaUserTimes, FaSearch, FaFilter, FaEdit, FaDownload, FaPrint } from 'react-icons/fa';
import Pagination from '../common/Pagination';
import { markStudentAsLeft, fetchStudents } from '../../store/studentsSlice'; // Add fetchStudents import
import { getApiUrl } from '../../utils/apiConfig';
import * as XLSX from 'xlsx-js-style';

const StudentAvailabilityLists = ({ activeTab: propActiveTab, 
                                  onFilterChange,
                                  parentSearchTerm,
                                  parentSelectedClass,
                                  parentSelectedSection,
                                  students: propStudents,
                                  isCompletedBatch }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { students: reduxStudents } = useSelector(state => state.students);
  
  // Use prop students if provided, otherwise use Redux students
  const students = propStudents || reduxStudents;
  
  const [searchTerm, setSearchTerm] = useState(parentSearchTerm || '');
  const [selectedClass, setSelectedClass] = useState(parentSelectedClass || '');
  const [selectedSection, setSelectedSection] = useState(parentSelectedSection || '');
  const [localActiveTab, setLocalActiveTab] = useState('available'); // 'available', 'unavailable', or 'left'
  const [currentPage, setCurrentPage] = useState(1);
  const [isImporting, setIsImporting] = useState(false); // Add this state
  const [isImportDropdownOpen, setIsImportDropdownOpen] = useState(false); // Add this state
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false); // Add this state
  const itemsPerPage = 20;

  // Use prop activeTab if provided, otherwise use local state
  const activeTab = propActiveTab !== undefined && propActiveTab !== null ? propActiveTab : localActiveTab;

  // Update local state when parent props change
  useEffect(() => {
    if (parentSearchTerm !== undefined) setSearchTerm(parentSearchTerm);
    if (parentSelectedClass !== undefined) setSelectedClass(parentSelectedClass);
    if (parentSelectedSection !== undefined) setSelectedSection(parentSelectedSection);
  }, [parentSearchTerm, parentSelectedClass, parentSelectedSection]);

  // Get unique classes for dropdown
  const uniqueClasses = [...new Set(students.map(student => student.class))];

  // Get sections for selected class
  const classSections = selectedClass 
    ? [...new Set(students
        .filter(student => student.class === selectedClass)
        .map(student => student.section))]
    : [];

  // Categorize students based on certificate status
  const categorizeStudents = () => {
    return students.reduce((acc, student) => {
      // For completed batches, passed_out students should be treated as available
      if (isCompletedBatch && student.status === 'passed_out') {
        acc.available.push(student);
      }
      // Students who have passed out (generated pass certificate) - for non-completed batches
      else if (student.status === 'passed_out') {
        acc.unavailable.push(student);
      } 
      // Students who left in middle (generated leaving certificate)
      else if (student.status === 'left') {
        acc.left.push(student);
      }
      // Available students (studying - all students who are studying are available)
      else {
        // All students with status 'studying' are available regardless of fees status
        acc.available.push(student);
      }
      
      return acc;
    }, { available: [], unavailable: [], left: [] });
  };

  const { available, unavailable, left } = categorizeStudents();

  // Filter students based on search term, class, and section
  const filterStudents = (studentList) => {
    return studentList.filter(student => {
      const matchesSearch = 
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.grNo && student.grNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        student.class.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesClass = !selectedClass || student.class === selectedClass;
      const matchesSection = !selectedSection || student.section === selectedSection;
      
      return matchesSearch && matchesClass && matchesSection;
    });
  };

  const filteredAvailable = filterStudents(available);
  const filteredUnavailable = filterStudents(unavailable);
  const filteredLeft = filterStudents(left);

  // Get current filtered list based on active tab
  const getCurrentFilteredList = () => {
    switch (activeTab) {
      case 'available': return filteredAvailable;
      case 'unavailable': return filteredUnavailable;
      case 'left': return filteredLeft;
      default: return filteredAvailable;
    }
  };

  const currentFilteredList = getCurrentFilteredList();
  
  // Get current page students
  const getCurrentPageStudents = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return currentFilteredList.slice(startIndex, endIndex);
  };

  const currentStudents = getCurrentPageStudents();
  const totalPages = Math.ceil(currentFilteredList.length / itemsPerPage);

  // Handle edit student
  const handleEditStudent = (student) => {
    navigate('/students/admission', { state: { studentData: student } });
  };

  // Export to CSV function
  const exportToCSV = () => {
    const csvContent = [
      ['GR No', 'First Name', 'Last Name', 'Father Name', 'Religion', 'Address', 'Date of Birth', 'Place of Birth', 'Last School Attended', 'Date of Admission', 'Class', 'Section', 'Status', 'Date of Leaving', 'Class in Which Left', 'Reason of Leaving', 'Remarks'],
      ...currentFilteredList.map(student => [
        student.grNo || '',
        student.firstName || '',
        student.lastName || '',
        student.fatherName || '',
        student.religion || '',
        student.address || '',
        student.dateOfBirth || '',
        student.birthPlace || '',
        student.lastSchoolAttended || '',
        student.dateOfAdmission || '',
        student.class || '',
        student.section || '',
        // Excluding monthly fees, admission fees, total fees, fees paid
        student.status && student.status !== 'studying' ? student.status : '', // Only show status if not 'studying'
        student.dateOfLeaving || '',
        student.classInWhichLeft || '',
        student.reasonOfLeaving || '',
        student.remarks || ''
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `students_${activeTab}_report.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Export to XLSX function
  const exportToXLSX = () => {
    // Create worksheet data - excluding specified columns
    const headers = ['GR No', 'First Name', 'Last Name', 'Father Name', 'Religion', 'Address', 'Date of Birth', 'Place of Birth', 'Last School Attended', 'Date of Admission', 'Class', 'Section', 'Status', 'Last School Leaving Date', 'Last School Class', 'Reason for Leaving Last School', 'Last School Remarks'];
    
    const wsData = [
      headers,
      ...currentFilteredList.map(student => [
        student.grNo || '',
        student.firstName || '',
        student.lastName || '',
        student.fatherName || '',
        student.religion || '',
        student.address || '',
        student.dateOfBirth || '',
        student.birthPlace || '',
        student.lastSchoolAttended || '',
        student.dateOfAdmission || '',
        student.class || '',
        student.section || '',
        // Excluding monthly fees, admission fees, total fees, fees paid
        student.status && student.status !== 'studying' ? student.status : '', // Only show status if not 'studying'
        student.dateOfLeaving || '',
        student.classInWhichLeft || '',
        student.reasonOfLeaving || '',
        student.remarks || ''
      ])
    ];
    
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Style the header row
    const range = XLSX.utils.decode_range(ws['!ref']);
    
    // Apply styling to header cells
    for (let C = range.s.c; C <= range.e.c; C++) {
      const headerCellRef = XLSX.utils.encode_cell({ r: 0, c: C });
      if (ws[headerCellRef]) {
        ws[headerCellRef].s = {
          font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "3b82f6" } },
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } }
          }
        };
      }
    }
    
    // Set column widths - increased width for Address and Last School Attended
    ws["!cols"] = [
      { wch: 10 },  // GR No
      { wch: 15 },  // First Name
      { wch: 15 },  // Last Name
      { wch: 20 },  // Father Name
      { wch: 12 },  // Religion
      { wch: 40 },  // Address (increased width)
      { wch: 15 },  // Date of Birth
      { wch: 20 },  // Place of Birth
      { wch: 35 },  // Last School Attended (increased width)
      { wch: 18 },  // Date of Admission
      { wch: 10 },  // Class
      { wch: 10 },  // Section
      { wch: 12 },  // Status (excluding 'studying')
      { wch: 25 },  // Date of Leaving
      { wch: 20 },  // Class in Which Left
      { wch: 30 },  // Reason of Leaving
      { wch: 30 }   // Remarks
    ];
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    
    // Export the workbook
    XLSX.writeFile(wb, `students_${activeTab}_report.xlsx`);
  };

  // Print report function
  const printReport = () => {
    window.print();
  };

  // Download sample Excel template
  const downloadSampleTemplate = () => {
    // Create worksheet data with sample headers
    const headers = [
      'First Name', 'Last Name', 'Father Name', 'Religion', 'Address', 
      'Date of Birth', 'Place of Birth', 'Last School Attended', 
      'Date of Admission', 'Class', 'Section', 'GR No', 
      'Monthly Fees', 'Admission Fees'
    ];
    
    // Sample data rows
    const sampleData = [
      headers,
      ['Ahmed', 'Khan', 'Muhammad Khan', 'Islam', '123 Main Street', '2005-05-15', 'Aga Khan Hospital', 'Karachi Grammar School', '2023-09-01', 'Class 5', 'A', 'GR001', 3000, 4000],
      ['Fatima', 'Ahmed', 'Ali Ahmed', 'Islam', '456 Oak Avenue', '2006-08-22', 'Shalamar Hospital', 'Lahore Grammar School', '2023-09-01', 'Class 4', 'B', 'GR002', 2800, 3500]
    ];
    
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(sampleData);
    
    // Style the header row
    const range = XLSX.utils.decode_range(ws['!ref']);
    
    // Apply styling to header cells
    for (let C = range.s.c; C <= range.e.c; C++) {
      const headerCellRef = XLSX.utils.encode_cell({ r: 0, c: C });
      if (ws[headerCellRef]) {
        ws[headerCellRef].s = {
          font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "3b82f6" } },
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } }
          }
        };
      }
    }
    
    // Set column widths
    ws["!cols"] = [
      { wch: 15 },  // First Name
      { wch: 15 },  // Last Name
      { wch: 20 },  // Father Name
      { wch: 12 },  // Religion
      { wch: 30 },  // Address
      { wch: 15 },  // Date of Birth
      { wch: 20 },  // Place of Birth
      { wch: 25 },  // Last School Attended
      { wch: 18 },  // Date of Admission
      { wch: 10 },  // Class
      { wch: 10 },  // Section
      { wch: 10 },  // GR No
      { wch: 15 },  // Monthly Fees
      { wch: 15 }   // Admission Fees
    ];
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Student_Template');
    
    // Export the workbook
    XLSX.writeFile(wb, 'student_import_template.xlsx');
  };

  // Handle Excel import
  const handleImportExcel = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check if file is Excel format
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      alert('Please select a valid Excel file (.xlsx or .xls)');
      event.target.value = ''; // Reset file input
      return;
    }

    // Show confirmation dialog
    if (!window.confirm('This will import student data from the Excel file. Do you want to continue?')) {
      event.target.value = ''; // Reset file input
      return;
    }

    try {
      // Set importing state
      setIsImporting(true);
      
      // Read Excel file
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get first worksheet
          const worksheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[worksheetName];
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          // Process and validate data
          let importedCount = 0;
          let errorCount = 0;
          const errors = [];
          
          // First, fetch batches to find the active one (similar to addStudent thunk)
          const batchesResponse = await fetch(getApiUrl('batches'));
          let activeBatch = null;
          if (batchesResponse.ok) {
            const batches = await batchesResponse.json();
            activeBatch = batches.find(batch => batch.status === 'active');
          }
          
          // Determine academic year based on the currently active batch
          let academicYear;
          if (activeBatch) {
            academicYear = activeBatch.name;
          } else {
            // Fallback to current year calculation if no active batch
            const currentYear = new Date().getFullYear();
            const nextYear = currentYear + 1;
            academicYear = `${currentYear}-${nextYear}`;
          }
          
          for (const row of jsonData) {
            try {
              // Map Excel columns to student fields
              const studentData = {
                firstName: row['First Name'] || row['firstName'] || row['FirstName'] || '',
                lastName: row['Last Name'] || row['lastName'] || row['LastName'] || '',
                fatherName: row['Father Name'] || row['fatherName'] || row['FatherName'] || '',
                religion: row['Religion'] || row['religion'] || '',
                address: row['Address'] || row['address'] || '',
                dateOfBirth: row['Date of Birth'] || row['dateOfBirth'] || row['DateOfBirth'] || '',
                birthPlace: row['Place of Birth'] || row['birthPlace'] || row['BirthPlace'] || '',
                lastSchoolAttended: row['Last School Attended'] || row['lastSchoolAttended'] || row['LastSchoolAttended'] || '',
                dateOfAdmission: row['Date of Admission'] || row['dateOfAdmission'] || row['DateOfAdmission'] || new Date().toISOString().split('T')[0],
                class: row['Class'] || row['class'] || '',
                section: row['Section'] || row['section'] || 'A',
                grNo: row['GR No'] || row['grNo'] || row['GRNo'] || '',
                monthlyFees: parseFloat(row['Monthly Fees'] || row['monthlyFees'] || row['MonthlyFees'] || 0),
                admissionFees: parseFloat(row['Admission Fees'] || row['admissionFees'] || row['AdmissionFees'] || 0),
                status: 'studying',
                // Default values for required fields
                totalFees: parseFloat(row['Monthly Fees'] || row['monthlyFees'] || row['MonthlyFees'] || 0) + parseFloat(row['Admission Fees'] || row['admissionFees'] || row['AdmissionFees'] || 0),
                feesPaid: 0,
                familyId: `family-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                relationship: 'self',
                academicYear: academicYear // Add academic year field
              };
              
              // Validate required fields
              if (!studentData.firstName || !studentData.lastName || !studentData.class) {
                errors.push(`Row missing required fields (First Name, Last Name, Class): ${JSON.stringify(row)}`);
                errorCount++;
                continue;
              }
              
              // Send to backend API using proper API configuration
              const response = await fetch(getApiUrl('students'), {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(studentData),
              });
              
              if (response.ok) {
                importedCount++;
              } else {
                const errorData = await response.json();
                errors.push(`Failed to import student ${studentData.firstName} ${studentData.lastName}: ${errorData.error || 'Unknown error'}`);
                errorCount++;
              }
            } catch (rowError) {
              errors.push(`Error processing row: ${rowError.message}`);
              errorCount++;
            }
          }
          
          // Show results
          let message = `Import completed!\n\nSuccessfully imported: ${importedCount} students`;
          if (errorCount > 0) {
            message += `\nErrors: ${errorCount}\n\nCheck console for details.`;
            console.error('Import errors:', errors);
          }
          
          alert(message);
          
          // Refresh student data if import was successful
          if (importedCount > 0) {
            dispatch(fetchStudents());
          }
        } catch (parseError) {
          console.error('Error parsing Excel file:', parseError);
          alert('Error parsing Excel file. Please check the file format and try again.');
        } finally {
          // Reset importing state
          setIsImporting(false);
        }
      };
      
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Error importing Excel file:', error);
      alert('Error importing file. Please try again.');
      setIsImporting(false); // Reset importing state on error
    }
    
    // Reset file input
    event.target.value = '';
  };

  // Notify parent of filter changes
  const notifyParentOfFilterChange = () => {
    if (onFilterChange) {
      // Calculate filtered stats to send to parent
      const allFilteredStudents = filterStudents(students);
      
      const filteredAvailableStudents = allFilteredStudents.filter(student => {
        // Available students are those who are studying (regardless of fees status)
        return student.status !== 'passed_out' && student.status !== 'left';
      });

      const filteredUnavailableStudents = allFilteredStudents.filter(student => {
        // Unavailable students are those who have passed out
        return student.status === 'passed_out';
      });

      const filteredLeftStudents = allFilteredStudents.filter(student => {
        // Left students are those who left in middle
        return student.status === 'left';
      });

      // Family groups based on filtered students
      const familyGroups = {};
      allFilteredStudents.forEach(student => {
        const familyId = student.familyId || `unknown-${student.id}`;
        if (!familyGroups[familyId]) {
          familyGroups[familyId] = [];
        }
        familyGroups[familyId].push(student);
      });
      const familyCount = Object.keys(familyGroups).length;

      onFilterChange({
        stats: {
          available: filteredAvailableStudents.length,
          unavailable: filteredUnavailableStudents.length,
          left: filteredLeftStudents.length,
          families: familyCount
        },
        searchTerm,
        selectedClass,
        selectedSection
      });
    }
  };

  // Call notifyParentOfFilterChange when filters change
  useEffect(() => {
    notifyParentOfFilterChange();
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [searchTerm, selectedClass, selectedSection]);

  return (
    <>
      {/* Students Table with integrated filters */}
      <div className="bg-white shadow p-4">
        {/* Search and Filters - Move inside table section */}
        <div className="mb-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative flex-grow max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by student name, GR No, or class..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <FaFilter className="text-gray-400 h-4 w-4" />
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="">All Classes</option>
                  {uniqueClasses.map((cls) => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <FaFilter className="text-gray-400 h-4 w-4" />
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  disabled={!selectedClass}
                  className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="">All Sections</option>
                  {classSections.map((section) => (
                    <option key={section} value={section}>{section}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <button
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    onMouseEnter={() => setIsExportDropdownOpen(true)}
                    onMouseLeave={() => setIsExportDropdownOpen(false)}
                  >
                    <FaDownload className="mr-1" /> Export
                  </button>
                  {isExportDropdownOpen && (
                    <div 
                      className="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
                      onMouseEnter={() => setIsExportDropdownOpen(true)}
                      onMouseLeave={() => setIsExportDropdownOpen(false)}
                    >
                      <div className="py-1">
                        <button
                          onClick={exportToCSV}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Export as CSV
                        </button>
                        <button
                          onClick={exportToXLSX}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Export as Excel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative">
                  <button
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    onMouseEnter={() => setIsImportDropdownOpen(true)}
                    onMouseLeave={() => setIsImportDropdownOpen(false)}
                    disabled={isImporting}
                  >
                    <FaDownload className="mr-1" /> {isImporting ? 'Importing...' : 'Import'}
                  </button>
                  {isImportDropdownOpen && (
                    <div 
                      className="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
                      onMouseEnter={() => setIsImportDropdownOpen(true)}
                      onMouseLeave={() => setIsImportDropdownOpen(false)}
                    >
                      <div className="py-1">
                        <button
                          onClick={() => document.getElementById('import-excel-file').click()}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          disabled={isImporting}
                        >
                          Import from Excel
                        </button>
                        <button
                          onClick={downloadSampleTemplate}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Download Sample Template
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <input 
                  id="import-excel-file" 
                  type="file" 
                  accept=".xlsx, .xls" 
                  className="hidden" 
                  onChange={handleImportExcel}
                />
                <button
                  onClick={printReport}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <FaPrint className="mr-1" /> Print
                </button>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedClass('');
                    setSelectedSection('');
                  }}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
          
          {/* Summary Statistics */}
          <div className="mt-3 flex items-center text-sm text-gray-600">
            <span>
              Showing {currentFilteredList.length} of {
                activeTab === 'available' ? available.length :
                activeTab === 'unavailable' ? unavailable.length :
                left.length
              } {activeTab === 'unavailable' ? 'passed out' : activeTab === 'left' ? 'left in middle' : activeTab} students
            </span>
            {(selectedClass || selectedSection || searchTerm) && (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedClass('');
                  setSelectedSection('');
                }}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                (Clear filters)
              </button>
            )}
          </div>
        </div>

        {/* Students Table */}
        <div className="overflow-hidden rounded-md border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GR No</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Father's Name</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class & Section</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Religion</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10 flex items-center justify-center">
                        <img src={student.photo} alt={student.firstName} className="w-10 h-10 rounded-xl" />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {student.grNo}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{student.firstName} {student.lastName}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.fatherName}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm text-gray-900">{student.class}</div>
                      <div className="text-sm text-gray-500">Section {student.section}</div>
                      {/* Show fees status for monthly fees only */}
                      {/* {parseFloat(student.totalFees || 0) > parseFloat(student.admissionFees || 0) && (
                        <div className="mt-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            // Check if monthly challans have been generated
                            student.feesHistory && student.feesHistory.some(challan => challan.type === 'monthly')
                              ? parseFloat(student.feesPaid || 0) >= parseFloat(student.totalFees || 0) 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800' // No challans generated yet
                          }`}>
                            Monthly Fees: {
                              // Check if monthly challans have been generated
                              student.feesHistory && student.feesHistory.some(challan => challan.type === 'monthly')
                                ? parseFloat(student.feesPaid || 0) >= parseFloat(student.totalFees || 0) 
                                  ? 'Paid' 
                                  : 'Pending'
                                : 'Not Generated'
                            }
                          </span>
                        </div>
                      )} */}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.religion}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditStudent(student)}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <FaEdit className="mr-1" /> Edit Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {currentFilteredList.length === 0 && (
            <div className="text-center py-8">
              <div className="flex justify-center">
                {activeTab === 'available' ? 
                  <FaUserCheck className="mx-auto h-8 w-8 text-gray-400" /> : 
                  activeTab === 'unavailable' ?
                  <FaUserTimes className="mx-auto h-8 w-8 text-gray-400" /> :
                  <FaUserTimes className="mx-auto h-8 w-8 text-gray-400" />
                }
              </div>
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                No {activeTab === 'unavailable' ? 'passed out' : activeTab === 'left' ? 'left in middle' : activeTab} students found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
        
        {/* Pagination */}
        {currentFilteredList.length > itemsPerPage && (
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={currentFilteredList.length}
              itemsPerPage={itemsPerPage}
              paginate={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default StudentAvailabilityLists;