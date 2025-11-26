import React from 'react';
import { FaUserFriends, FaDollarSign, FaPrint } from 'react-icons/fa';
import WhatsAppFeeReminder from './WhatsAppFeeReminder';

const FamilyFeesView = ({ familyGroups, students, onPayFees, onPrintChallan }) => {
  return (
    <tbody className="bg-white divide-y divide-gray-200">
      {familyGroups.map((family) => (
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
            <tr key={challan.id} className="hover:bg-gray-50">
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
                          onPayFees(challan.id);
                        }
                      }}
                      className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-lg text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    >
                      <FaDollarSign className="mr-1" /> Pay
                    </button>
                  ) : null}
                  <WhatsAppFeeReminder 
                    student={students.find(s => s.id === challan.studentId)} 
                  />
                  <button
                    onClick={() => {
                      // Find the student for this challan
                      const student = students.find(s => s.id === challan.studentId);
                      if (student) {
                        onPrintChallan(challan, student);
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
      ))}
    </tbody>
  );
};

export default FamilyFeesView;