import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaTimes, FaUser, FaChalkboardTeacher, FaBook, FaMoneyBillWave, FaDollarSign, FaClipboardList, FaCertificate } from 'react-icons/fa';

const UniversalSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();
  const searchRef = useRef(null);
  
  // Get data from Redux store
  const students = useSelector(state => state.students.students);
  const staff = useSelector(state => state.staff.staff);
  const classes = useSelector(state => state.classes.classes);
  const expenses = useSelector(state => state.expenses.expenses);
  const subsidies = useSelector(state => state.subsidies.subsidies);
  
  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Perform search when searchTerm changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const results = [];
    
    // Search students
    students.forEach(student => {
      if (
        student.firstName.toLowerCase().includes(term) ||
        student.lastName.toLowerCase().includes(term) ||
        student.grNo.toLowerCase().includes(term) ||
        student.class.toLowerCase().includes(term) ||
        student.section.toLowerCase().includes(term) ||
        student.fatherName.toLowerCase().includes(term)
      ) {
        results.push({
          id: student.id,
          type: 'student',
          title: `${student.firstName} ${student.lastName}`,
          subtitle: `GR No: ${student.grNo} | Class: ${student.class} - ${student.section}`,
          icon: <FaUser className="text-blue-500" />,
          path: `/students`
        });
      }
    });
    
    // Search staff
    staff.forEach(member => {
      if (
        member.firstName.toLowerCase().includes(term) ||
        member.lastName.toLowerCase().includes(term) ||
        member.employeeId.toLowerCase().includes(term) ||
        member.position.toLowerCase().includes(term) ||
        member.department.toLowerCase().includes(term)
      ) {
        results.push({
          id: member.id,
          type: 'staff',
          title: `${member.firstName} ${member.lastName}`,
          subtitle: `ID: ${member.employeeId} | ${member.position}`,
          icon: <FaChalkboardTeacher className="text-green-500" />,
          path: `/staff`
        });
      }
    });
    
    // Search classes
    classes.forEach(cls => {
      if (
        cls.name.toLowerCase().includes(term) ||
        cls.sections.some(section => section.name.toLowerCase().includes(term))
      ) {
        results.push({
          id: cls.id,
          type: 'class',
          title: cls.name,
          subtitle: `${cls.sections.length} sections | Monthly fees: Rs ${cls.monthlyFees}`,
          icon: <FaBook className="text-purple-500" />,
          path: `/classes`
        });
      }
    });
    
    // Search expenses
    expenses.forEach(expense => {
      if (
        expense.description.toLowerCase().includes(term) ||
        expense.category.toLowerCase().includes(term)
      ) {
        results.push({
          id: expense.id,
          type: 'expense',
          title: expense.description,
          subtitle: `Category: ${expense.category} | Amount: Rs ${expense.amount}`,
          icon: <FaMoneyBillWave className="text-red-500" />,
          path: `/expenses`
        });
      }
    });
    
    // Search subsidies
    subsidies.forEach(subsidy => {
      if (
        subsidy.ngoName.toLowerCase().includes(term) ||
        subsidy.quarter.toLowerCase().includes(term) ||
        subsidy.description.toLowerCase().includes(term)
      ) {
        results.push({
          id: subsidy.id,
          type: 'subsidy',
          title: `${subsidy.ngoName} - ${subsidy.quarter} ${subsidy.year}`,
          subtitle: `Amount: Rs ${subsidy.amount} | Status: ${subsidy.status}`,
          icon: <FaDollarSign className="text-yellow-500" />,
          path: `/subsidies`
        });
      }
    });
    
    setSearchResults(results.slice(0, 10)); // Limit to 10 results
  }, [searchTerm, students, staff, classes, expenses, subsidies]);
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      // Navigate to the first result
      navigate(searchResults[0].path);
      setIsOpen(false);
      setSearchTerm('');
    }
  };
  
  const handleResultClick = (path) => {
    navigate(path);
    setIsOpen(false);
    setSearchTerm('');
  };
  
  return (
    <div className="relative" ref={searchRef}>
      <form onSubmit={handleSearch} className="relative">
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search students, staff, classes..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
          />
          {searchTerm && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                type="button"
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={() => setSearchTerm('')}
              >
                <FaTimes />
              </button>
            </div>
          )}
        </div>
      </form>
      
      {isOpen && searchTerm && (
        <div className="absolute z-50 mt-1 w-full rounded-md bg-white shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
          {searchResults.length > 0 ? (
            <div className="py-1">
              {searchResults.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100"
                  onClick={() => handleResultClick(result.path)}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {result.icon}
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="font-medium text-gray-900">{result.title}</div>
                      <div className="text-gray-500">{result.subtitle}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-3 text-sm text-gray-700">
              No results found for "{searchTerm}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UniversalSearch;