import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaCertificate, FaSearch, FaFilter, FaUserCheck, FaUserTimes, FaUsers } from 'react-icons/fa';
import { updateStudent } from '../store/studentsSlice';
import CertificateGenerator from './students/CertificateGenerator';
import Pagination from './common/Pagination';

const CertificatesSection = () => {
  const dispatch = useDispatch();
  const { students } = useSelector(state => state.students);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [certificateType, setCertificateType] = useState('all'); // 'all', 'leaving', 'pass', 'character'
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Adjust as needed

  // Get unique classes for dropdown
  const uniqueClasses = [...new Set(students.map(student => student.class))];

  // Get sections for selected class
  const classSections = selectedClass 
    ? [...new Set(students
        .filter(student => student.class === selectedClass)
        .map(student => student.section))]
    : [];

  // Filter students based on search term, class, section, and certificate status
  const filterStudents = () => {
    return students.filter(student => {
      const matchesSearch = 
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesClass = !selectedClass || student.class === selectedClass;
      const matchesSection = !selectedSection || student.section === selectedSection;
      
      // Filter by certificate type
      const matchesCertificateType = certificateType === 'all' || 
        (certificateType === 'leaving' && student.status === 'left') ||
        (certificateType === 'pass' && student.status === 'passed_out') ||
        (certificateType === 'character' && student.status !== 'left' && student.status !== 'passed_out');
      
      return matchesSearch && matchesClass && matchesSection && matchesCertificateType;
    });
  };

  const filteredStudents = filterStudents();
  
  // Calculate pagination values
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);

  // Reset pagination when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedClass, selectedSection, certificateType]);

  // Pagination functions
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // Get students who have left (for leaving certificates) - based on filtered results
  const leftStudents = filteredStudents.filter(student => 
    student.status === 'left' || student.status === 'passed_out'
  );

  // Get students who are still studying (for character certificates) - based on filtered results
  const studyingStudents = filteredStudents.filter(student => 
    student.status !== 'left' && student.status !== 'passed_out'
  );

  const handleGenerateCertificate = (student) => {
    setSelectedStudent(student);
    setShowCertificateModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <>
      <div className="">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Certificates</h1>
            <p className="mt-1 text-sm text-gray-600">Generate and manage student certificates</p>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="my-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs font-medium">Total Students</p>
                  <p className="text-2xl font-bold mt-1">{students.length}</p>
                </div>
                <div className="p-2 bg-blue-400 bg-opacity-30 rounded-full">
                  <FaUsers size={20} />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-xs font-medium">Left Students</p>
                  <p className="text-2xl font-bold mt-1">{leftStudents.length}</p>
                </div>
                <div className="p-2 bg-red-400 bg-opacity-30 rounded-full">
                  <FaUserTimes size={20} />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-xs font-medium">Studying Students</p>
                  <p className="text-2xl font-bold mt-1">{studyingStudents.length}</p>
                </div>
                <div className="p-2 bg-green-400 bg-opacity-30 rounded-full">
                  <FaUserCheck size={20} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Certificates</h3>
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative flex-grow max-w-md">
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
              
              <div className="flex flex-wrap gap-2">
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
                
                <div className="flex items-center space-x-2">
                  <FaCertificate className="text-gray-400" />
                  <select
                    value={certificateType}
                    onChange={(e) => setCertificateType(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Certificates</option>
                    <option value="leaving">Leaving Certificates</option>
                    <option value="pass">Pass Certificates</option>
                    <option value="character">Character Certificates</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedClass('');
                      setSelectedSection('');
                      setCertificateType('all');
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
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class/Section</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Certificates</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10 flex items-center justify-center">
                          <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
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
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        student.status === 'left' || student.status === 'passed_out'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {student.status === 'left' ? 'Left School' : 
                         student.status === 'passed_out' ? 'Passed Out' : 'Studying'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        {student.status === 'left' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <FaCertificate className="mr-1" /> Leaving Certificate
                          </span>
                        ) : student.status === 'passed_out' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <FaCertificate className="mr-1" /> Pass Certificate
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            <FaCertificate className="mr-1" /> Character Certificate
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleGenerateCertificate(student)}
                          className="inline-flex items-center px-3 py-1 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                        >
                          <FaCertificate className="mr-1" /> Generate
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <FaCertificate className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter criteria
              </p>
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

      {/* Certificate Generator Modal */}
      {showCertificateModal && selectedStudent && (
        <CertificateGenerator
          student={selectedStudent}
          onClose={() => {
            setShowCertificateModal(false);
            setSelectedStudent(null);
          }}
        />
      )}
    </>
  );
};

export default CertificatesSection;