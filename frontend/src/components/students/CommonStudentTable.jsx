import React from 'react';
import { FaEdit, FaUserGraduate, FaUserCheck, FaUserTimes, FaCertificate } from 'react-icons/fa';

const CommonStudentTable = ({ 
  students, 
  columns = ['photo', 'grNo', 'name', 'fatherName', 'class', 'section'], 
  actions = ['edit'],
  onEditStudent,
  onViewDetails,
  onGenerateCertificate,
  emptyMessage = "No students found",
  showStatus = false,
  customRenderers = {}
}) => {
  // Default column configuration
  const columnConfig = {
    photo: { label: 'Photo', className: 'px-4 py-3 whitespace-nowrap' },
    grNo: { label: 'GR No', className: 'px-4 py-3 whitespace-nowrap' },
    name: { label: 'Name', className: 'px-4 py-3 whitespace-nowrap' },
    fatherName: { label: "Father's Name", className: 'px-4 py-3 whitespace-nowrap' },
    class: { label: 'Class', className: 'px-4 py-3 whitespace-nowrap' },
    section: { label: 'Section', className: 'px-4 py-3 whitespace-nowrap' },
    status: { label: 'Status', className: 'px-4 py-3 whitespace-nowrap' },
    certificates: { label: 'Certificates', className: 'px-4 py-3 whitespace-nowrap' },
    marksheets: { label: 'Marksheets', className: 'px-4 py-3 whitespace-nowrap' },
    challans: { label: 'Challans', className: 'px-4 py-3 whitespace-nowrap' },
    amount: { label: 'Amount', className: 'px-4 py-3 whitespace-nowrap' }
  };

  // Action button configuration
  const actionConfig = {
    edit: {
      label: 'Edit Details',
      icon: <FaEdit className="mr-1" />,
      className: 'inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50',
      handler: onEditStudent
    },
    view: {
      label: 'View Details',
      icon: null,
      className: 'inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
      handler: onViewDetails
    },
    certificate: {
      label: 'Generate',
      icon: <FaCertificate className="mr-1" />,
      className: 'inline-flex items-center px-3 py-1 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700',
      handler: onGenerateCertificate
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th 
                key={column} 
                scope="col" 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {columnConfig[column]?.label || column}
              </th>
            ))}
            {actions.length > 0 && (
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {students.map((student) => (
            <tr key={student.id} className="hover:bg-gray-50">
              {columns.includes('photo') && (
                <td className={columnConfig.photo.className}>
                  <div className="flex items-center">
                    {student.photo ? (
                      <img 
                        src={student.photo} 
                        alt={`${student.firstName} ${student.lastName}`} 
                        className="w-8 h-8 rounded-full object-cover border-2 border-gray-300"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.parentElement.innerHTML = `
                            <div class="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8 flex items-center justify-center">
                              <svg class="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                              </svg>
                            </div>
                          `;
                        }}
                      />
                    ) : (
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8 flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </td>
              )}
              
              {columns.includes('grNo') && (
                <td className={columnConfig.grNo.className}>
                  <div className="text-sm text-gray-900">
                    {student.grNo ? student.grNo.replace('GR', '') : 'N/A'}
                  </div>
                </td>
              )}
              
              {columns.includes('name') && (
                <td className={columnConfig.name.className}>
                  <div className="text-sm font-medium text-gray-900">{student.firstName} {student.lastName}</div>
                </td>
              )}
              
              {columns.includes('fatherName') && (
                <td className={columnConfig.fatherName.className}>
                  <div className="text-sm text-gray-900">{student.fatherName}</div>
                </td>
              )}
              
              {columns.includes('class') && (
                <td className={columnConfig.class.className}>
                  <div className="text-sm text-gray-900">{student.class}</div>
                </td>
              )}
              
              {columns.includes('section') && (
                <td className={columnConfig.section.className}>
                  <div className="text-sm text-gray-900">{student.section}</div>
                </td>
              )}
              
              {columns.includes('status') && showStatus && (
                <td className={columnConfig.status.className}>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    student.status === 'left' || student.status === 'passed_out'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {student.status === 'left' ? 'Left School' : 
                     student.status === 'passed_out' ? 'Passed Out' : 'Studying'}
                  </span>
                </td>
              )}
              
              {columns.includes('certificates') && (
                <td className={columnConfig.certificates.className}>
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
              )}
              
              {columns.includes('marksheets') && (
                <td className={columnConfig.marksheets.className}>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    student.marksCount > 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {student.marksCount} marksheet{student.marksCount !== 1 ? 's' : ''}
                  </span>
                </td>
              )}
              
              {columns.includes('challans') && (
                <td className={columnConfig.challans.className}>
                  {customRenderers.challans ? (
                    customRenderers.challans(student)
                  ) : (
                    <div className="text-sm text-gray-900">
                      {student.challans || 'N/A'}
                    </div>
                  )}
                </td>
              )}
              
              {columns.includes('amount') && (
                <td className={columnConfig.amount.className}>
                  {customRenderers.amount ? (
                    customRenderers.amount(student)
                  ) : (
                    <div className="text-sm text-gray-900">
                      {student.amount || 'N/A'}
                    </div>
                  )}
                </td>
              )}
              
              {actions.length > 0 && (
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-2 justify-end">
                    {actions.map((action) => {
                      const config = actionConfig[action];
                      if (!config) return null;
                      
                      return (
                        <button
                          key={action}
                          onClick={() => config.handler && config.handler(student)}
                          className={config.className}
                        >
                          {config.icon}
                          {config.label}
                        </button>
                      );
                    })}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      
      {students.length === 0 && (
        <div className="text-center py-8">
          <div className="flex justify-center">
            <FaUserGraduate className="mx-auto h-8 w-8 text-gray-400" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">{emptyMessage}</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default CommonStudentTable;