import React, { useState } from 'react';
import { FaUserShield, FaUserTie, FaBook, FaUsers, FaChalkboardTeacher, FaMoneyBillWave, FaHandHoldingUsd, FaChartLine, FaTimes, FaChevronRight, FaBuilding } from 'react-icons/fa';

const RoleBasedGuide = ({ isOpen, onClose, userRole }) => {
  const [selectedRole, setSelectedRole] = useState(userRole || 'Administrator');
  const [currentSection, setCurrentSection] = useState(null);

  if (!isOpen) return null;

  const guides = {
    Administrator: {
      title: "Administrator Guide",
      description: "Complete guide for managing the entire school system",
      sections: [
        {
          id: 'school-setup',
          title: 'School Configuration',
          icon: <FaBuilding className="text-blue-600" />,
          content: `
            <h4 class="font-bold text-lg mb-3">School Configuration</h4>
            <p class="mb-3">As an administrator, you have full control over school settings:</p>
            
            <div class="bg-blue-50 rounded-lg p-4 mb-4">
              <h5 class="font-bold text-blue-800 mb-2">Key Tasks:</h5>
              <ul class="list-disc pl-5 space-y-1 text-blue-700">
                <li>Set school name, logo, and educational level</li>
                <li>Choose funding model (Traditional or NGO)</li>
                <li>Configure display preferences and themes</li>
                <li>Manage user accounts and permissions</li>
              </ul>
            </div>
            
            <h5 class="font-bold mt-4 mb-2">How to Access:</h5>
            <ol class="list-decimal pl-5 space-y-2">
              <li>Navigate to Settings in the main menu</li>
              <li>Update school information as needed</li>
              <li>Save changes to apply new settings</li>
            </ol>
          `
        },
        {
          id: 'user-management',
          title: 'User Management',
          icon: <FaUserShield className="text-green-600" />,
          content: `
            <h4 class="font-bold text-lg mb-3">User Management</h4>
            <p class="mb-3">Manage staff accounts and permissions:</p>
            
            <div class="bg-green-50 rounded-lg p-4 mb-4">
              <h5 class="font-bold text-green-800 mb-2">Available Actions:</h5>
              <ul class="list-disc pl-5 space-y-1 text-green-700">
                <li>Create new staff accounts</li>
                <li>Assign roles (Administrator or Staff)</li>
                <li>Reset passwords</li>
                <li>Deactivate accounts</li>
              </ul>
            </div>
            
            <h5 class="font-bold mt-4 mb-2">Best Practices:</h5>
            <ul class="list-decimal pl-5 space-y-2">
              <li>Only grant Administrator access to trusted personnel</li>
              <li>Regularly review active user accounts</li>
              <li>Use strong passwords for all accounts</li>
            </ul>
          `
        },
        {
          id: 'reports',
          title: 'System Reports',
          icon: <FaChartLine className="text-purple-600" />,
          content: `
            <h4 class="font-bold text-lg mb-3">System Reports</h4>
            <p class="mb-3">Generate comprehensive reports for stakeholders:</p>
            
            <div class="bg-purple-50 rounded-lg p-4 mb-4">
              <h5 class="font-bold text-purple-800 mb-2">Report Types:</h5>
              <ul class="list-disc pl-5 space-y-1 text-purple-700">
                <li>Financial summaries</li>
                <li>Student enrollment statistics</li>
                <li>Staff distribution reports</li>
                <li>Class capacity utilization</li>
              </ul>
            </div>
            
            <h5 class="font-bold mt-4 mb-2">Export Options:</h5>
            <ul class="list-disc pl-5 space-y-2">
              <li>PDF for printing and sharing</li>
              <li>CSV for spreadsheet analysis</li>
              <li>Direct print functionality</li>
            </ul>
          `
        }
      ]
    },
    Staff: {
      title: "Staff Guide",
      description: "Essential tasks for daily school operations",
      sections: [
        {
          id: 'student-records',
          title: 'Student Records',
          icon: <FaUsers className="text-blue-600" />,
          content: `
            <h4 class="font-bold text-lg mb-3">Student Records Management</h4>
            <p class="mb-3">Manage student information and academic records:</p>
            
            <div class="bg-blue-50 rounded-lg p-4 mb-4">
              <h5 class="font-bold text-blue-800 mb-2">Daily Tasks:</h5>
              <ul class="list-disc pl-5 space-y-1 text-blue-700">
                <li>Add new student admissions</li>
                <li>Update student contact information</li>
                <li>Record attendance</li>
                <li>Enter academic marks</li>
              </ul>
            </div>
            
            <h5 class="font-bold mt-4 mb-2">Navigation:</h5>
            <ol class="list-decimal pl-5 space-y-2">
              <li>Go to Students section in main menu</li>
              <li>Select specific student or use search</li>
              <li>Update required information</li>
              <li>Save changes</li>
            </ol>
          `
        },
        {
          id: 'class-management',
          title: 'Class Management',
          icon: <FaBook className="text-green-600" />,
          content: `
            <h4 class="font-bold text-lg mb-3">Class Management</h4>
            <p class="mb-3">Manage class information and student assignments:</p>
            
            <div class="bg-green-50 rounded-lg p-4 mb-4">
              <h5 class="font-bold text-green-800 mb-2">Key Functions:</h5>
              <ul class="list-disc pl-5 space-y-1 text-green-700">
                <li>View class rosters</li>
                <li>Assign students to classes</li>
                <li>Update section information</li>
                <li>Track student distribution</li>
              </ul>
            </div>
            
            <h5 class="font-bold mt-4 mb-2">Quick Tips:</h5>
            <ul class="list-disc pl-5 space-y-2">
              <li>Use search to find students quickly</li>
              <li>Filter by class or section for targeted actions</li>
              <li>Export class lists for attendance</li>
            </ul>
          `
        },
        {
          id: 'financial-tasks',
          title: 'Financial Tasks',
          icon: <FaMoneyBillWave className="text-yellow-600" />,
          content: `
            <h4 class="font-bold text-lg mb-3">Financial Tasks</h4>
            <p class="mb-3">Depending on your school model, perform relevant financial operations:</p>
            
            ${
              // This would be dynamically determined based on school settings
              '<div class="bg-yellow-50 rounded-lg p-4 mb-4">' +
              '<h5 class="font-bold text-yellow-800 mb-2">Traditional Schools:</h5>' +
              '<ul class="list-disc pl-5 space-y-1 text-yellow-700">' +
              '<li>Generate fee challans</li>' +
              '<li>Process student payments</li>' +
              '<li>Track pending fees</li>' +
              '</ul>' +
              '</div>' +
              '<div class="bg-blue-50 rounded-lg p-4">' +
              '<h5 class="font-bold text-blue-800 mb-2">NGO Schools:</h5>' +
              '<ul class="list-disc pl-5 space-y-1 text-blue-700">' +
              '<li>Record expense transactions</li>' +
              '<li>Categorize expenditures</li>' +
              '<li>Generate expense reports</li>' +
              '</ul>' +
              '</div>'
            }
          `
        }
      ]
    }
  };

  const currentGuide = guides[selectedRole];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">{currentGuide.title}</h2>
            <p className="text-blue-100 mt-1">{currentGuide.description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 focus:outline-none"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        <div className="flex flex-grow overflow-hidden">
          {/* Role Selection Sidebar */}
          <div className="w-1/3 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
            <h3 className="font-bold text-gray-900 mb-3">Select Your Role</h3>
            <div className="space-y-2 mb-6">
              {Object.keys(guides).map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    setSelectedRole(role);
                    setCurrentSection(null);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center ${
                    selectedRole === role
                      ? 'bg-blue-100 border border-blue-300'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {role === 'Administrator' ? (
                    <FaUserShield className="text-blue-600 mr-3" />
                  ) : (
                    <FaUserTie className="text-green-600 mr-3" />
                  )}
                  <span className="font-medium">{role}</span>
                </button>
              ))}
            </div>

            <h3 className="font-bold text-gray-900 mb-3">Guide Sections</h3>
            <div className="space-y-2">
              {currentGuide.sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setCurrentSection(section)}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between ${
                    currentSection && currentSection.id === section.id
                      ? 'bg-blue-100 border border-blue-300'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="mr-3">
                      {section.icon}
                    </div>
                    <span className="font-medium">{section.title}</span>
                  </div>
                  <FaChevronRight className="text-gray-400" />
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="w-2/3 overflow-y-auto p-6">
            {currentSection ? (
              <div>
                <div className="flex items-center mb-4">
                  <div className="mr-3 text-xl">
                    {currentSection.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{currentSection.title}</h3>
                </div>
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: currentSection.content }}
                />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center">
                <div>
                  <div className="mx-auto bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mb-6">
                    <FaBook className="text-gray-400 text-4xl" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Select a Guide Section</h3>
                  <p className="text-gray-600">
                    Choose a section from the sidebar to view detailed instructions for that area.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleBasedGuide;