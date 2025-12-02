import React from 'react';
import { FaEye, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import WhatsAppFeeReminder from './WhatsAppFeeReminder';

const StudentFeesView = ({ filteredStudents, onViewDetails }) => {
  return (
    <tbody className="bg-white divide-y divide-gray-200">
      {filteredStudents.map((student) => (
        <tr 
          key={student.id} 
          className={`hover:bg-gray-50 border-l-4 ${
            student.completionRate < 100 
              ? 'border-l-red-500' 
              : 'border-l-green-500'
          }`}
        >
          <td className="px-4 py-3 whitespace-nowrap">
            <div className="flex items-center">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8 flex items-center justify-center">
                <img src={student.photo} alt={student.firstName} className="w-8 h-8 rounded-xl" />
              </div>
            </div>
          </td>
          <td className="px-4 py-3 whitespace-nowrap">
            <div className="text-sm text-gray-900">
              {student.grNo ? student.grNo.replace('GR', '') : 'N/A'}
            </div>
          </td>
          <td className="px-4 py-3 whitespace-nowrap">
            <div className="text-sm font-medium text-gray-900">{student.firstName} {student.lastName}</div>
          </td>
          <td className="px-4 py-3 whitespace-nowrap">
            <div className="text-sm text-gray-900">{student.class} {student.section}</div>
          </td>
          <td className="px-4 py-3 whitespace-nowrap">
            <div className="text-sm text-gray-900">{student.paidChallans}/{student.totalChallans}</div>
          </td>
          <td className="px-4 py-3 whitespace-nowrap">
            <div className="text-sm text-gray-900">Rs {Math.round(student.paidAmount)}/{Math.round(student.totalAmount)}</div>
          </td>
          <td className="px-4 py-3 whitespace-nowrap">
            <div className="flex items-center">
              <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                <div 
                  className={`h-2 rounded-full ${
                    student.completionRate >= 75 ? 'bg-green-500' : 
                    student.completionRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${student.completionRate}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-900">{student.completionRate}%</span>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <div className="flex items-center justify-end space-x-2">
              {student.completionRate < 100 ? (
                <FaExclamationCircle className="text-red-500" />
              ) : (
                <FaCheckCircle className="text-green-500" />
              )}
              {student.completionRate < 100 ? (
                <WhatsAppFeeReminder student={student} />
              ) : null}
              <button
                onClick={() => onViewDetails(student)}
                className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
              >
                <FaEye className="mr-1" /> View Details
              </button>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  );
};

export default StudentFeesView;