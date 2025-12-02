import React from 'react';
import { FaUser, FaCheck, FaTimes, FaDollarSign, FaChartBar, FaTag } from 'react-icons/fa';

const FeesStats = ({ filteredStudents }) => {
  // Calculate fee statistics
  const totalStudents = filteredStudents.length;
  const fullyPaidStudents = filteredStudents.filter(s => s.completionRate === 100).length;
  const pendingStudents = totalStudents - fullyPaidStudents;
  
  // Calculate total amounts
  const totalExpected = filteredStudents.reduce((sum, student) => sum + (student.totalAmount || 0), 0);
  const totalCollected = filteredStudents.reduce((sum, student) => sum + (student.paidAmount || 0), 0);
  
  // Calculate total discounts given
  const totalDiscounts = filteredStudents.reduce((sum, student) => {
    if (student.feesHistory) {
      return sum + student.feesHistory.reduce((challanSum, challan) => {
        return challanSum + (parseFloat(challan.discountAmount) || 0);
      }, 0);
    }
    return sum;
  }, 0);
  
  // Adjusted total expected amount after discounts
  const adjustedTotalExpected = totalExpected - totalDiscounts;
  const totalPending = Math.max(0, adjustedTotalExpected - totalCollected);
  
  // Calculate collection rate
  const collectionRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

  return (
    <div className="my-4">
      {/* 6-card layout for comprehensive fee statistics including discounts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs font-medium">Total Students</p>
              <p className="text-2xl font-bold mt-1">{totalStudents}</p>
            </div>
            <div className="p-2 bg-blue-400 bg-opacity-30 rounded-full">
              <FaUser size={20} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-xs font-medium">Fully Paid</p>
              <p className="text-2xl font-bold mt-1">{fullyPaidStudents}</p>
            </div>
            <div className="p-2 bg-green-400 bg-opacity-30 rounded-full">
              <FaCheck size={20} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-xs font-medium">Pending</p>
              <p className="text-2xl font-bold mt-1">{pendingStudents}</p>
            </div>
            <div className="p-2 bg-red-400 bg-opacity-30 rounded-full">
              <FaTimes size={20} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl shadow p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-xs font-medium">Fees Collected</p>
              <p className="text-2xl font-bold mt-1">Rs {isNaN(totalCollected) ? '0' : Math.round(totalCollected)}</p>
            </div>
            <div className="p-2 bg-indigo-400 bg-opacity-30 rounded-full">
              <FaDollarSign size={20} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl shadow p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-xs font-medium">Pending Fees</p>
              <p className="text-2xl font-bold mt-1">Rs {isNaN(totalPending) ? '0' : Math.round(totalPending)}</p>
            </div>
            <div className="p-2 bg-amber-400 bg-opacity-30 rounded-full">
              <FaChartBar size={20} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-xs font-medium">Discounts Given</p>
              <p className="text-2xl font-bold mt-1">Rs {isNaN(totalDiscounts) ? '0' : Math.round(totalDiscounts)}</p>
            </div>
            <div className="p-2 bg-purple-400 bg-opacity-30 rounded-full">
              <FaTag size={20} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Additional statistics row */}
      {/* <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
        <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-xl shadow p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cyan-100 text-xs font-medium">Total Expected</p>
              <p className="text-2xl font-bold mt-1">Rs {isNaN(adjustedTotalExpected) ? '0' : Math.round(adjustedTotalExpected)}</p>
            </div>
            <div className="p-2 bg-cyan-400 bg-opacity-30 rounded-full">
              <FaDollarSign size={20} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl shadow p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-xs font-medium">Collection Rate</p>
              <p className="text-2xl font-bold mt-1">{collectionRate}%</p>
            </div>
            <div className="p-2 bg-emerald-400 bg-opacity-30 rounded-full">
              <FaChartBar size={20} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-xs font-medium">Avg. Per Student</p>
              <p className="text-2xl font-bold mt-1">Rs {totalStudents > 0 ? (isNaN(adjustedTotalExpected) ? '0' : Math.round(adjustedTotalExpected / totalStudents)) : 0}</p>
            </div>
            <div className="p-2 bg-purple-400 bg-opacity-30 rounded-full">
              <FaUser size={20} />
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default FeesStats;