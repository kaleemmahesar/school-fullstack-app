import React from 'react';
import { useSelector } from 'react-redux';
import { usePermissions } from '../hooks/usePermissions';
import PermissionChecker from './common/PermissionChecker';

const RBACTestPage = () => {
  const currentUser = useSelector(state => state.users.currentUser);
  const { 
    hasPermission, 
    hasAnyPermission, 
    hasAllPermissions, 
    isOwner, 
    isAdmin, 
    isTeacher, 
    isStaff 
  } = usePermissions();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">RBAC Test Page</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Current User Information</h2>
        {currentUser ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Username: <span className="font-medium">{currentUser.username}</span></p>
              <p className="text-gray-600">Role: <span className="font-medium">{currentUser.role}</span></p>
            </div>
            <div>
              <p className="text-gray-600">Permissions: <span className="font-medium">{currentUser.permissions.join(', ')}</span></p>
            </div>
          </div>
        ) : (
          <p className="text-gray-600">No user logged in</p>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Permission Checks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded p-4">
            <h3 className="font-medium text-gray-700 mb-2">Role Checks</h3>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span>Is Owner:</span>
                <span className={`font-medium ${isOwner() ? 'text-green-600' : 'text-red-600'}`}>
                  {isOwner() ? 'Yes' : 'No'}
                </span>
              </li>
              <li className="flex justify-between">
                <span>Is Admin:</span>
                <span className={`font-medium ${isAdmin() ? 'text-green-600' : 'text-red-600'}`}>
                  {isAdmin() ? 'Yes' : 'No'}
                </span>
              </li>
              <li className="flex justify-between">
                <span>Is Teacher:</span>
                <span className={`font-medium ${isTeacher() ? 'text-green-600' : 'text-red-600'}`}>
                  {isTeacher() ? 'Yes' : 'No'}
                </span>
              </li>
              <li className="flex justify-between">
                <span>Is Staff:</span>
                <span className={`font-medium ${isStaff() ? 'text-green-600' : 'text-red-600'}`}>
                  {isStaff() ? 'Yes' : 'No'}
                </span>
              </li>
            </ul>
          </div>
          
          <div className="border border-gray-200 rounded p-4">
            <h3 className="font-medium text-gray-700 mb-2">Permission Checks</h3>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span>Has 'students' permission:</span>
                <span className={`font-medium ${hasPermission('students') ? 'text-green-600' : 'text-red-600'}`}>
                  {hasPermission('students') ? 'Yes' : 'No'}
                </span>
              </li>
              <li className="flex justify-between">
                <span>Has 'fees' permission:</span>
                <span className={`font-medium ${hasPermission('fees') ? 'text-green-600' : 'text-red-600'}`}>
                  {hasPermission('fees') ? 'Yes' : 'No'}
                </span>
              </li>
              <li className="flex justify-between">
                <span>Has 'expenses' permission:</span>
                <span className={`font-medium ${hasPermission('expenses') ? 'text-green-600' : 'text-red-600'}`}>
                  {hasPermission('expenses') ? 'Yes' : 'No'}
                </span>
              </li>
              <li className="flex justify-between">
                <span>Has 'settings' permission:</span>
                <span className={`font-medium ${hasPermission('settings') ? 'text-green-600' : 'text-red-600'}`}>
                  {hasPermission('settings') ? 'Yes' : 'No'}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Conditional Content</h2>
        <div className="space-y-4">
          <PermissionChecker permission="students">
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <h3 className="font-medium text-blue-800">Student Management Section</h3>
              <p className="text-blue-700 mt-1">This content is only visible to users with 'students' permission.</p>
            </div>
          </PermissionChecker>
          
          <PermissionChecker permission="fees">
            <div className="bg-green-50 border border-green-200 rounded p-4">
              <h3 className="font-medium text-green-800">Fees Management Section</h3>
              <p className="text-green-700 mt-1">This content is only visible to users with 'fees' permission.</p>
            </div>
          </PermissionChecker>
          
          <PermissionChecker permission="expenses">
            <div className="bg-red-50 border border-red-200 rounded p-4">
              <h3 className="font-medium text-red-800">Expenses Management Section</h3>
              <p className="text-red-700 mt-1">This content is only visible to users with 'expenses' permission.</p>
            </div>
          </PermissionChecker>
          
          <PermissionChecker permission="settings">
            <div className="bg-purple-50 border border-purple-200 rounded p-4">
              <h3 className="font-medium text-purple-800">Settings Section</h3>
              <p className="text-purple-700 mt-1">This content is only visible to users with 'settings' permission.</p>
            </div>
          </PermissionChecker>
          
          <PermissionChecker permissions={['fees', 'expenses']} requireAll={false}>
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
              <h3 className="font-medium text-yellow-800">Financial Section</h3>
              <p className="text-yellow-700 mt-1">This content is visible to users with either 'fees' or 'expenses' permission.</p>
            </div>
          </PermissionChecker>
        </div>
      </div>
    </div>
  );
};

export default RBACTestPage;