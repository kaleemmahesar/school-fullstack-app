import React from 'react';
import { FaChartBar, FaFileAlt, FaClipboardList, FaGraduationCap } from 'react-icons/fa';
import PageHeader from '../common/PageHeader';
import PermissionChecker from '../common/PermissionChecker';

const TeacherDashboard = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Teacher Dashboard"
        description="Access your teaching resources and student information"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <PermissionChecker permission="marksheets">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaFileAlt className="text-blue-600 text-xl" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Marksheets</h3>
                <p className="text-sm text-gray-500">Manage student grades</p>
              </div>
            </div>
          </div>
        </PermissionChecker>
        
        <PermissionChecker permission="reports">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <FaChartBar className="text-green-600 text-xl" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Reports</h3>
                <p className="text-sm text-gray-500">View student reports</p>
              </div>
            </div>
          </div>
        </PermissionChecker>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FaClipboardList className="text-purple-600 text-xl" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Class Schedule</h3>
              <p className="text-sm text-gray-500">View your timetable</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <FaGraduationCap className="text-yellow-600 text-xl" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Resources</h3>
              <p className="text-sm text-gray-500">Access teaching materials</p>
            </div>
          </div>
        </div>
      </div>
      
      <PermissionChecker permission="marksheets">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Marksheets</h3>
          <div className="text-center py-8 text-gray-500">
            <p>No recent marksheets to display</p>
          </div>
        </div>
      </PermissionChecker>
      
      <PermissionChecker permission="reports">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Student Performance</h3>
          <div className="text-center py-8 text-gray-500">
            <p>No performance data to display</p>
          </div>
        </div>
      </PermissionChecker>
    </div>
  );
};

export default TeacherDashboard;