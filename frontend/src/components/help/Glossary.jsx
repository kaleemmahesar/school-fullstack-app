import React, { useState } from 'react';
import { FaBook, FaSearch, FaGraduationCap, FaChalkboardTeacher, FaMoneyBillWave, FaChartLine, FaCog } from 'react-icons/fa';

const Glossary = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const glossaryTerms = [
    {
      term: "Admission Fees",
      definition: "One-time fees collected when a student is first enrolled in the school. This is separate from monthly tuition fees.",
      category: "Fees"
    },
    {
      term: "Challan",
      definition: "A payment document that specifies the amount owed, due date, and payment details. Used for fee collection in traditional schools.",
      category: "Fees"
    },
    {
      term: "Class",
      definition: "An academic grouping of students, typically organized by grade level (e.g., Class 1, Class 2). Each class can have multiple sections.",
      category: "Academic"
    },
    {
      term: "Family",
      definition: "A grouping of students who are related (siblings, children of the same parent). Families enable bulk fee management and relationship tracking.",
      category: "Students"
    },
    {
      term: "Funding Type",
      definition: "The financial model of the school - either Traditional (collects fees from students) or NGO Funded (operates on subsidies).",
      category: "Administration"
    },
    {
      term: "GR Number",
      definition: "Unique identification number assigned to each student for record-keeping and tracking purposes.",
      category: "Students"
    },
    {
      term: "Monthly Fees",
      definition: "Recurring tuition fees collected on a monthly basis from students in traditional schools.",
      category: "Fees"
    },
    {
      term: "NGO Subsidy",
      definition: "Financial support provided by non-governmental organizations to fund school operations in NGO-funded schools.",
      category: "Finance"
    },
    {
      term: "Section",
      definition: "A subdivision within a class used to organize students into smaller groups (e.g., Section A, Section B).",
      category: "Academic"
    },
    {
      term: "Subsidy",
      definition: "Financial assistance provided to support school operations, typically received quarterly in NGO-funded schools.",
      category: "Finance"
    },
    {
      term: "Total Fees",
      definition: "The sum of all fees owed by a student, including admission fees and monthly tuition fees.",
      category: "Fees"
    },
    {
      term: "Transfer Student",
      definition: "A student who joins the school from another educational institution, requiring special documentation of previous schooling.",
      category: "Students"
    }
  ];

  // Filter terms based on search
  const filteredTerms = glossaryTerms.filter(term => 
    term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
    term.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
    term.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group terms by category
  const groupedTerms = filteredTerms.reduce((acc, term) => {
    if (!acc[term.category]) {
      acc[term.category] = [];
    }
    acc[term.category].push(term);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FaBook className="text-white text-xl mr-3" />
              <h2 className="text-xl font-bold text-white">Glossary of Terms</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Search */}
          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-blue-200" />
              </div>
              <input
                type="text"
                placeholder="Search terms, definitions, or categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-blue-300 rounded-lg bg-blue-500 bg-opacity-20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-grow p-6">
          {filteredTerms.length === 0 ? (
            <div className="text-center py-12">
              <FaSearch className="mx-auto text-gray-400 text-2xl mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No terms found</h3>
              <p className="text-gray-500">Try adjusting your search terms</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.keys(groupedTerms).map((category) => (
                <div key={category}>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center">
                    {category === 'Students' && <FaGraduationCap className="mr-2 text-blue-600" />}
                    {category === 'Academic' && <FaBook className="mr-2 text-green-600" />}
                    {category === 'Fees' && <FaMoneyBillWave className="mr-2 text-yellow-600" />}
                    {category === 'Finance' && <FaChartLine className="mr-2 text-purple-600" />}
                    {category === 'Administration' && <FaCog className="mr-2 text-indigo-600" />}
                    {category}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {groupedTerms[category].map((term, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <h4 className="font-bold text-gray-900 mb-2">{term.term}</h4>
                        <p className="text-gray-600 text-sm">{term.definition}</p>
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {term.category}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <p className="text-sm text-gray-500">
            {filteredTerms.length} of {glossaryTerms.length} terms displayed
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Close Glossary
          </button>
        </div>
      </div>
    </div>
  );
};

export default Glossary;