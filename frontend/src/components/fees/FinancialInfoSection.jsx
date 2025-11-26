import React from 'react';
import { FaDollarSign, FaCheck, FaExclamation, FaChartBar, FaReceipt, FaUser, FaCalendar } from 'react-icons/fa';

const FinancialInfoSection = ({ student }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
        <FaChartBar className="mr-2 text-green-500" /> Financial Information
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Amount */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow p-4 text-white">
          <div className="flex items-center">
            <div className="p-2 bg-blue-400 bg-opacity-30 rounded-full mr-3">
              <FaDollarSign size={20} />
            </div>
            <div>
              <p className="text-blue-100 text-xs font-medium">Total Amount</p>
              <p className="text-xl font-bold">Rs {Math.round(student.totalAmount)}</p>
            </div>
          </div>
        </div>
        
        {/* Paid Amount */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow p-4 text-white">
          <div className="flex items-center">
            <div className="p-2 bg-green-400 bg-opacity-30 rounded-full mr-3">
              <FaCheck size={20} />
            </div>
            <div>
              <p className="text-green-100 text-xs font-medium">Paid</p>
              <p className="text-xl font-bold">Rs {Math.round(student.paidAmount)}</p>
            </div>
          </div>
        </div>
        
        {/* Pending Amount */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl shadow p-4 text-white">
          <div className="flex items-center">
            <div className="p-2 bg-amber-400 bg-opacity-30 rounded-full mr-3">
              <FaExclamation size={20} />
            </div>
            <div>
              <p className="text-amber-100 text-xs font-medium">Pending</p>
              <p className="text-xl font-bold">Rs {Math.round(student.totalAmount - student.paidAmount)}</p>
            </div>
          </div>
        </div>
        
        {/* Completion Rate */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow p-4 text-white">
          <div className="flex items-center">
            <div className="p-2 bg-purple-400 bg-opacity-30 rounded-full mr-3">
              <FaChartBar size={20} />
            </div>
            <div>
              <p className="text-purple-100 text-xs font-medium">Completion Rate</p>
              <p className="text-xl font-bold">{student.completionRate}%</p>
            </div>
          </div>
        </div>
        
        {/* Total Challans */}
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl shadow p-4 text-white">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-400 bg-opacity-30 rounded-full mr-3">
              <FaReceipt size={20} />
            </div>
            <div>
              <p className="text-indigo-100 text-xs font-medium">Total Challans</p>
              <p className="text-xl font-bold">{student.totalChallans}</p>
            </div>
          </div>
        </div>
        
        {/* Paid Challans */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow p-4 text-white">
          <div className="flex items-center">
            <div className="p-2 bg-green-400 bg-opacity-30 rounded-full mr-3">
              <FaCheck size={20} />
            </div>
            <div>
              <p className="text-green-100 text-xs font-medium">Paid Challans</p>
              <p className="text-xl font-bold">{student.paidChallans}</p>
            </div>
          </div>
        </div>
        
        {/* Pending Challans */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl shadow p-4 text-white">
          <div className="flex items-center">
            <div className="p-2 bg-amber-400 bg-opacity-30 rounded-full mr-3">
              <FaExclamation size={20} />
            </div>
            <div>
              <p className="text-amber-100 text-xs font-medium">Pending Challans</p>
              <p className="text-xl font-bold">{student.pendingChallans}</p>
            </div>
          </div>
        </div>
        
        {/* Admission Paid Status */}
        <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-xl shadow p-4 text-white">
          <div className="flex items-center">
            <div className="p-2 bg-cyan-400 bg-opacity-30 rounded-full mr-3">
              <FaUser size={20} />
            </div>
            <div>
              <p className="text-cyan-100 text-xs font-medium">Admission Paid</p>
              <p className="text-xl font-bold">{student.admissionPaid ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialInfoSection;