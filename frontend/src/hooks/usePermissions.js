import { useSelector } from 'react-redux';
import { 
  selectHasPermission, 
  selectHasAnyPermission, 
  selectHasAllPermissions,
  selectIsOwner,
  selectIsAdmin,
  selectIsTeacher,
  selectIsStaff
} from '../store/usersSlice';

export const usePermissions = () => {
  const hasPermission = (permission) => useSelector(state => selectHasPermission(state, permission));
  const hasAnyPermission = (permissions) => useSelector(state => selectHasAnyPermission(state, permissions));
  const hasAllPermissions = (permissions) => useSelector(state => selectHasAllPermissions(state, permissions));
  const isOwner = () => useSelector(selectIsOwner);
  const isAdmin = () => useSelector(selectIsAdmin);
  const isTeacher = () => useSelector(selectIsTeacher);
  const isStaff = () => useSelector(selectIsStaff);

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isOwner,
    isAdmin,
    isTeacher,
    isStaff
  };
};

export default usePermissions;