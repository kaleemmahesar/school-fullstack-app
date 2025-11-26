import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { FaIdCard, FaBus, FaUmbrellaBeach, FaListOl, FaSearch, FaFilter } from 'react-icons/fa';
import PageHeader from '../common/PageHeader';

const SpecializedStudentLists = () => {
  const { students } = useSelector(state => state.students);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [activeTab, setActiveTab] = useState('rollno'); // 'rollno', 'tour', 'idcard', 'transported'

  // Get unique classes for dropdown
  const uniqueClasses = [...new Set(students.map(student => student.class))];

  // Get sections for selected class
  const classSections = selectedClass 
    ? [...new Set(students
        .filter(student => student.class === selectedClass)
        .map(student => student.section))]
    : [];

  // For this implementation, we'll simulate these lists:
  // - Roll No List: All students with assigned roll numbers (using student ID as roll number)
  // - Tour/Picnic List: Students who have paid a certain amount (simulating tour fee)
  // - ID Card List: Students who have paid admission fees
  // - Transported Students: Students with a specific flag (we'll add this to mock data)

  // Filter students based on search term, class, and section
  const filterStudents = (studentList) => {
    return studentList.filter(student => {
      const matchesSearch = 
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.class.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesClass = !selectedClass || student.class === selectedClass;
      const matchesSection = !selectedSection || student.section === selectedSection;
      
      return matchesSearch && matchesClass && matchesSection;
    });
  };

  // For demonstration, we'll create filtered lists based on criteria
  const getRollNoList = () => {
    // All students get roll numbers (using their ID as roll number)
    return students.map(student => ({
      ...student,
      rollNo: `RN-${student.id}` // Simulated roll number
    }));
  };

  const getTourList = () => {
    // Students who have paid more than a certain amount (simulating tour fee payment)
    return students.filter(student => 
      parseFloat(student.feesPaid) >= 5000
    );
  };

  const getIdCardList = () => {
    // Students who have paid admission fees
    return students.filter(student => 
      parseFloat(student.admissionFees) > 0 && 
      parseFloat(student.feesPaid) >= parseFloat(student.admissionFees)
    );
  };

  const getTransportedList = () => {
    // For now, we'll simulate transported students as those in specific classes
    // In a real implementation, this would be a flag in the student data
    return students.filter(student => 
      ['Class 8', 'Class 9', 'Class 10'].includes(student.class)
    );
  };

  const filteredRollNo = filterStudents(getRollNoList());
  const filteredTour = filterStudents(getTourList());
  const filteredIdCard = filterStudents(getIdCardList());
  const filteredTransported = filterStudents(getTransportedList());

  // Function to export data to CSV
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

  return (
    <>
      <PageHeader
        title="Specialized Student Lists"
        subtitle="Roll No, Tour/Picnic, ID Card, and Transported Students Lists"
        actionButton={
          <button
            onClick={() => {
              const currentList = activeTab === 'rollno' ? filteredRollNo :
                               activeTab === 'tour' ? filteredTour :
                               activeTab === 'idcard' ? filteredIdCard :
                               filteredTransported;
              const filename = activeTab === 'rollno' ? 'roll_no_list' :
                              activeTab === 'tour' ? 'tour_picnic_list' :
                              activeTab === 'idcard' ? 'id_card_list' :
                              'transported_students_list';
              exportToCSV(currentList, filename);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
          >
            Export CSV
          </button>
        }
      />

      {/* Tabs for different lists */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex flex-wrap space-x-8">
            <button
              onClick={() => setActiveTab('rollno')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'rollno'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <FaListOl className="mr-2" />
                Roll No List
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {filteredRollNo.length}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('tour')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tour'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <FaUmbrellaBeach className="mr-2" />
                Tour / Picnic List
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {filteredTour.length}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('idcard')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'idcard'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <FaIdCard className="mr-2" />
                ID Card List
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {filteredIdCard.length}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('transported')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'transported'
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <FaBus className="mr-2" />
                Transported Students
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  {filteredTransported.length}
                </span>
              </div>
            </button>
          </nav>
        </div>

        {/* Search and Filters */}
        <div className="mt-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-grow max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by student name, email, or class..."
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
            </div>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {activeTab === 'rollno' && (
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
                )}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class/Section</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {activeTab === 'tour' && 'Tour Fee Paid'}
                  {activeTab === 'idcard' && 'ID Card Status'}
                  {activeTab === 'transported' && 'Transport Route'}
                  {activeTab === 'rollno' && 'Status'}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(activeTab === 'rollno' ? filteredRollNo :
                activeTab === 'tour' ? filteredTour :
                activeTab === 'idcard' ? filteredIdCard :
                filteredTransported).map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  {activeTab === 'rollno' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.rollNo}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{student.firstName} {student.lastName}</div>
                        <div className="text-sm text-gray-500">ID: {student.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.email}</div>
                    <div className="text-sm text-gray-500">{student.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.class}</div>
                    <div className="text-sm text-gray-500">Section {student.section}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {activeTab === 'tour' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ${student.feesPaid} Paid
                      </span>
                    )}
                    {activeTab === 'idcard' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Issued
                      </span>
                    )}
                    {activeTab === 'transported' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Route {student.section}
                      </span>
                    )}
                    {activeTab === 'rollno' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Assigned
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(activeTab === 'rollno' ? filteredRollNo :
            activeTab === 'tour' ? filteredTour :
            activeTab === 'idcard' ? filteredIdCard :
            filteredTransported).length === 0 && (
            <div className="text-center py-12">
              <div className="flex justify-center">
                {activeTab === 'rollno' && <FaListOl className="mx-auto h-12 w-12 text-gray-400" />}
                {activeTab === 'tour' && <FaUmbrellaBeach className="mx-auto h-12 w-12 text-gray-400" />}
                {activeTab === 'idcard' && <FaIdCard className="mx-auto h-12 w-12 text-gray-400" />}
                {activeTab === 'transported' && <FaBus className="mx-auto h-12 w-12 text-gray-400" />}
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No students found in {activeTab === 'rollno' ? 'Roll No' :
                                    activeTab === 'tour' ? 'Tour/Picnic' :
                                    activeTab === 'idcard' ? 'ID Card' :
                                    'Transported Students'} list
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SpecializedStudentLists;