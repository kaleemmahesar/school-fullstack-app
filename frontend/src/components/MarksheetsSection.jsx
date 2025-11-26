import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMarks, addMarks, updateMarks, deleteMarks } from '../store/marksSlice';
import { fetchExams } from '../store/examsSlice';
import { FaPlus, FaEye, FaEdit, FaTrash, FaSearch, FaGraduationCap, FaClipboard, FaFilter, FaDownload } from 'react-icons/fa';
import StudentMarksheetForm from './marksheets/StudentMarksheetForm';
import ClassExamMarksheetForm from './marksheets/ClassExamMarksheetForm';
import IndividualMarksheetPrintView from './marksheets/IndividualMarksheetPrintView';

import Pagination from './common/Pagination';
import { getCurrentAcademicYear } from '../utils/dateUtils';

const MarksheetsSection = () => {
  const dispatch = useDispatch();
  const { students } = useSelector(state => state.students);
  const { classes } = useSelector(state => state.classes);
  const { marks, loading, error } = useSelector(state => state.marks);
  const { exams } = useSelector(state => state.exams);
  
  const [view, setView] = useState('list');
  const [showForm, setShowForm] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedStudentData, setSelectedStudentData] = useState(null);
  const [currentMarks, setCurrentMarks] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedBatch, setSelectedBatch] = useState(''); // Add batch filter state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    studentId: '',
    studentName: '',
    class: '',
    section: '',
    examType: '',
    year: new Date().getFullYear().toString(),
    marks: []
  });

  // Fetch marks and exams data on component mount
  useEffect(() => {
    dispatch(fetchMarks());
    dispatch(fetchExams());
  }, [dispatch]);

  // Set current academic year as default batch
  useEffect(() => {
    if (!selectedBatch && students.length > 0) {
      const currentAcademicYear = getCurrentAcademicYear();
      // Check if current academic year exists in the data
      const hasCurrentBatch = students.some(student => student.academicYear === currentAcademicYear);
      
      // If current academic year exists, set it as default
      if (hasCurrentBatch) {
        setSelectedBatch(currentAcademicYear);
      } else {
        // Otherwise, set to the most recent batch
        const uniqueBatches = [...new Set(students.map(student => student.academicYear).filter(Boolean))];
        if (uniqueBatches.length > 0) {
          // Sort batches and get the most recent one
          const sortedBatches = uniqueBatches.sort((a, b) => {
            const aYear = parseInt(a.split('-')[0]);
            const bYear = parseInt(b.split('-')[0]);
            return bYear - aYear;
          });
          setSelectedBatch(sortedBatches[0]);
        }
      }
    }
  }, [students, selectedBatch]);

  // Get unique batches from students
  const uniqueBatches = useMemo(() => {
    const batches = students.map(student => student.academicYear).filter(Boolean);
    return [...new Set(batches)];
  }, [students]);

  // Filter exams based on current academic year
  const filteredExams = useMemo(() => {
    const currentAcademicYear = getCurrentAcademicYear();
    return exams.filter(exam => 
      exam.academicYear === currentAcademicYear
    );
  }, [exams]);

  // Filter exams by selected class for the forms
  const formFilteredExams = useMemo(() => {
    // This will be filtered by class in the forms themselves
    return filteredExams;
  }, [filteredExams]);

  // Get students with their marksheet counts
  const studentsWithMarks = useMemo(() => {
    return students.map(student => {
      const studentMarks = marks.filter(mark => mark.studentId === student.id);
      const studentName = `${student.firstName} ${student.lastName}`;
      
      return {
        ...student,
        name: studentName,
        marksCount: studentMarks.length,
        marks: studentMarks
      };
    });
  }, [students, marks]);

  // Filter students based on search, filters, and batch
  const filteredStudents = useMemo(() => {
    return studentsWithMarks.filter(student => {
      const matchesSearch = 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.section.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesClass = !selectedClass || student.class === selectedClass;
      const matchesSection = !selectedSection || student.section === selectedSection;
      const matchesBatch = !selectedBatch || student.academicYear === selectedBatch; // Add batch filter
      
      return matchesSearch && matchesClass && matchesSection && matchesBatch;
    });
  }, [studentsWithMarks, searchTerm, selectedClass, selectedSection, selectedBatch]);

  // Calculate pagination values
  const totalPages = useMemo(() => Math.ceil(filteredStudents.length / itemsPerPage), [filteredStudents, itemsPerPage]);
  const indexOfLastItem = useMemo(() => currentPage * itemsPerPage, [currentPage, itemsPerPage]);
  const indexOfFirstItem = useMemo(() => indexOfLastItem - itemsPerPage, [indexOfLastItem, itemsPerPage]);
  const currentStudents = useMemo(() => filteredStudents.slice(indexOfFirstItem, indexOfLastItem), [filteredStudents, indexOfFirstItem, indexOfLastItem]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedClass, selectedSection, selectedBatch]); // Add selectedBatch to dependency array

  // Pagination functions
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  
  // Handle functions
  const handleBackToList = () => {
    setView('list');
    setSelectedStudentData(null);
    setCurrentMarks(null);
  };
  
  const handleViewDetails = (student) => {
    setSelectedStudentData(student);
    setView('detail');
  };

  const handleViewMarksheet = (marksheet) => {
    setCurrentMarks(marksheet);
    setView('marksheet-view'); // New view state for viewing
  };

  const handleEdit = (marksheet) => {
    setCurrentMarks(marksheet);
    setView('marksheet-edit'); // New view state for editing
  };
  
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this marksheet?')) {
      dispatch(deleteMarks(id));
    }
  };
  
  const handleSaveMarks = (marksheetData) => {
    // Handle bulk marksheets (array of marksheets)
    if (Array.isArray(marksheetData)) {
      marksheetData.forEach(marksheet => {
        if (marksheet.id && marks.find(m => m.id === marksheet.id)) {
          dispatch(updateMarks(marksheet));
        } else {
          dispatch(addMarks(marksheet));
        }
      });
    } 
    // Handle single marksheet
    else {
      if (marksheetData.id && marks.find(m => m.id === marksheetData.id)) {
        dispatch(updateMarks(marksheetData));
      } else {
        dispatch(addMarks(marksheetData));
      }
    }
  };
  
  const resetForm = () => {
    setShowForm(false);
    setBulkMode(false);
    setCurrentMarks(null);
  };
  
  const downloadMarksheet = () => {
    alert('In a full implementation, this would download the marksheet as a PDF');
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedClass('');
    setSelectedSection('');
    setSelectedBatch(getCurrentAcademicYear()); // Reset to current batch
    setCurrentPage(1);
  };

  return (
    <div className="">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 print:hidden">Marksheets Management</h1>
          <p className="mt-1 text-sm text-gray-600 print:hidden">
            {view === 'list' 
              ? 'Manage student marks and generate report cards' 
              : view === 'detail'
              ? `Marksheets for ${selectedStudentData?.name}`
              : 'Student Marksheet'}
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          {view === 'list' ? (
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setBulkMode(false);
                  setShowForm(!showForm);
                  if (!showForm) {
                    // Reset form data when opening the form
                    setFormData({
                      studentId: '',
                      studentName: '',
                      class: '',
                      section: '',
                      examType: '',
                      year: new Date().getFullYear().toString(),
                      marks: []
                    });
                    setCurrentMarks(null);
                  }
                }}
                className={`print:hidden inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  !bulkMode 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700' 
                    : 'bg-gray-500 hover:bg-gray-600'
                }`}
              >
                <FaPlus className="mr-2" /> {showForm && !bulkMode ? 'Cancel' : 'Add Marksheet'}
              </button>
              <button
                onClick={() => {
                  setBulkMode(true);
                  setShowForm(true);
                }}
                className={`print:hidden inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                  bulkMode 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' 
                    : 'bg-gray-500 hover:bg-gray-600'
                }`}
              >
                <FaClipboard className="mr-2" /> Bulk Entry
              </button>
            </div>
          ) : (
            <button
              onClick={handleBackToList}
              className="print:hidden inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to List
            </button>
          )}
        </div>
      </div>

      {view === 'detail' && selectedStudentData && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
              <div className="ml-4">
                <h2 className="text-xl font-bold text-gray-900">{selectedStudentData.name}</h2>
                <p className="text-gray-600">{selectedStudentData.class} - Section {selectedStudentData.section}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Marksheets</p>
              <p className="text-2xl font-bold text-gray-900">{selectedStudentData.marksCount}</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subjects</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selectedStudentData.marks && selectedStudentData.marks.map((marksheet) => (
                  <tr key={marksheet.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{marksheet.examType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {marksheet.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {marksheet.marks.length} subjects
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleViewMarksheet(marksheet)}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <FaEye className="mr-1" /> View
                        </button>
                        <button
                          onClick={() => handleEdit(marksheet)}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <FaEdit className="mr-1" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(marksheet.id)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-lg text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
                        >
                          <FaTrash className="mr-1" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!selectedStudentData.marks || selectedStudentData.marks.length === 0) && (
              <div className="text-center py-12">
                <FaGraduationCap className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No marksheets found</h3>
                <p className="mt-1 text-sm text-gray-500">This student has no marksheets yet</p>
              </div>
            )}
          </div>
        </div>
      )}

      {view === 'marksheet-view' && currentMarks && (
        <div className="bg-white rounded-2xl shadow-lg p-6 max-h-[calc(100vh-100px)] overflow-y-auto">
          <div className="flex justify-between items-center mb-6 sticky top-0 bg-white py-2 z-10">
            <h2 className="text-xl font-bold text-gray-900">View Student Marksheet</h2>
            <button
              onClick={handleBackToList}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to List
            </button>
          </div>
          
          <div className="mb-6">
            <IndividualMarksheetPrintView
              marksheetData={currentMarks}
              studentData={students.find(s => s.id === currentMarks.studentId)}
              classData={classes.find(c => c.name === currentMarks.class)}
              positionData={{ position: currentMarks.position, totalStudents: currentMarks.totalStudents }}
            />
          </div>
          
          <div className="flex justify-center mt-6 space-x-4 sticky bottom-0 bg-white py-2 z-10">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Marksheet
            </button>
            <button
              onClick={downloadMarksheet}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </button>
            <button
              onClick={() => handleEdit(currentMarks)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaEdit className="mr-2" /> Edit Marksheet
            </button>
          </div>
        </div>
      )}

      {view === 'marksheet-edit' && currentMarks && (
        <StudentMarksheetForm
          classes={classes}
          students={studentsWithMarks}
          exams={formFilteredExams}
          currentMarks={currentMarks}
          onSubmit={(marksheetData) => {
            handleSaveMarks(marksheetData);
            setView('detail'); // Go back to student details after editing
            alert('Marksheet updated successfully!');
          }}
          onCancel={() => setView('detail')} // Go back to student details on cancel
        />
      )}

      {view === 'list' && (
        <>
          {showForm && !bulkMode && (
            <StudentMarksheetForm
              classes={classes}
              students={studentsWithMarks}
              exams={formFilteredExams} // Pass filtered exams
              currentMarks={currentMarks}
              onSubmit={(marksheetData) => {
                handleSaveMarks(marksheetData);
                resetForm();
                alert('Marksheet saved successfully!');
              }}
              onCancel={resetForm}
            />
          )}

          {showForm && bulkMode && (
            <ClassExamMarksheetForm
              classes={classes}
              students={studentsWithMarks}
              exams={formFilteredExams} // Pass filtered exams
              onSubmit={(marksheetsData) => {
                handleSaveMarks(marksheetsData);
                resetForm();
                alert(`Successfully saved marksheets for ${marksheetsData.length} students!`);
              }}
              onCancel={resetForm}
            />
          )}

          {/* Show student list when no form is active */}
          {!showForm && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Marksheets</h3>
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="relative flex-grow max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaSearch className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search by student name, class, or section..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center space-x-2">
                      <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">All Classes</option>
                        {classes && classes.map(cls => (
                          <option key={cls.id} value={cls.name}>{cls.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <select
                        value={selectedSection}
                        onChange={(e) => setSelectedSection(e.target.value)}
                        className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">All Sections</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <select
                        value={selectedBatch}
                        onChange={(e) => setSelectedBatch(e.target.value)}
                        className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">All Batches</option>
                        {uniqueBatches.map(batch => (
                          <option key={batch} value={batch}>{batch}</option>
                        ))}
                      </select>
                    </div>
                    
                    <button
                      onClick={clearFilters}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <FaFilter className="mr-1" /> Clear Filters
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class/Section</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marksheets</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentStudents
                      .map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {student.name}
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
                            <div className="text-sm text-gray-900">{student.marksCount} marksheets</div>
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
                      ))}
                  </tbody>
                </table>
                {filteredStudents.length === 0 && (
                  <div className="text-center py-12">
                    <FaGraduationCap className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
                    <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria</p>
                  </div>
                )}
                
                {/* Pagination */}
                {filteredStudents.length > itemsPerPage && (
                  <div className="mt-4">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      itemsPerPage={itemsPerPage}
                      totalItems={filteredStudents.length}
                      paginate={paginate}
                      nextPage={nextPage}
                      prevPage={prevPage}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MarksheetsSection;