import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { selectHasPermission } from '../../store/usersSlice';

const ProtectedRoute = ({ children, permission, redirectTo = '/unauthorized' }) => {
  const currentUser = useSelector(state => state.users?.currentUser);
  const hasPermission = useSelector(state => selectHasPermission(state, permission));

  // If not authenticated, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If user doesn't have required permission, redirect to unauthorized page
  if (permission && !hasPermission) {
    return <Navigate to={redirectTo} replace />;
  }

  // If user is authenticated and has permission (or no permission required), render children
  return children;
};

export default ProtectedRoute;