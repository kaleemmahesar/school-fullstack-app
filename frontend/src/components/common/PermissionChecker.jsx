import React from 'react';
import { useSelector } from 'react-redux';
import { selectHasPermission } from '../../store/usersSlice';

const PermissionChecker = ({ 
  permission, 
  permissions, 
  requireAll = false, 
  children, 
  fallback = null,
  hide = false // If true, hide element completely instead of showing fallback
}) => {
  const currentUser = useSelector(state => state.users.currentUser);
  
  // If no user, show fallback or hide
  if (!currentUser) {
    return hide ? null : fallback;
  }
  
  let hasAccess = false;
  
  if (permission) {
    // Check single permission
    hasAccess = useSelector(state => selectHasPermission(state, permission));
  } else if (permissions && Array.isArray(permissions)) {
    // Check multiple permissions
    if (requireAll) {
      // User must have all permissions
      hasAccess = permissions.every(perm => useSelector(state => selectHasPermission(state, perm)));
    } else {
      // User must have at least one permission
      hasAccess = permissions.some(perm => useSelector(state => selectHasPermission(state, perm)));
    }
  } else {
    // No permission specified, show content
    hasAccess = true;
  }
  
  // If user has access, render children, otherwise show fallback or hide
  return hasAccess ? children : (hide ? null : fallback);
};

export default PermissionChecker;