# Role-Based Access Control (RBAC) Implementation

This document describes the role-based access control system implemented in the School Management System.

## User Roles and Permissions

### 1. Owner
**Description**: Full access to all system features including financial information
**Permissions**:
- All system features
- Financial management (fees, expenses, subsidies)
- Settings configuration
- User management
- Reports and analytics

### 2. Admin
**Description**: Access to all features except financial information
**Permissions**:
- Student management
- Class management
- Staff management
- Attendance tracking
- Marksheets and certificates
- Reports (non-financial)
- Settings configuration

### 3. Teacher
**Description**: Limited access to student-related work
**Permissions**:
- View-only access to marksheets
- View-only access to reports
- Access to examination data

### 4. Staff
**Description**: Access to operational features
**Permissions**:
- Student management
- Attendance tracking
- Fees management
- Marksheets and certificates
- Reports
- Examinations

## Implementation Details

### Route Protection
Routes are protected using the `ProtectedRoute` component which checks user permissions before allowing access.

### Navigation Filtering
The main navigation automatically filters menu items based on the user's role and permissions.

### Component-Level Access Control
The `PermissionChecker` component is used for conditional rendering within components based on user permissions.

### Permission Checking Hooks
The `usePermissions` hook provides functions for checking user permissions in components:
- `hasPermission(permission)`: Check if user has a specific permission
- `hasAnyPermission(permissions)`: Check if user has any of the specified permissions
- `hasAllPermissions(permissions)`: Check if user has all of the specified permissions
- `isOwner()`: Check if user is an Owner
- `isAdmin()`: Check if user is an Admin
- `isTeacher()`: Check if user is a Teacher
- `isStaff()`: Check if user is Staff

## Demo Credentials

- **Owner**: username `owner`, password `owner123`
- **Admin**: username `admin`, password `admin123`
- **Teacher**: username `teacher`, password `teacher123`
- **Staff**: username `staff`, password `staff123`

## Files Modified/Added

### Modified Files:
- `src/store/usersSlice.js` - Added role configuration and permission selectors
- `src/components/LoginPage.jsx` - Updated demo credentials and descriptions
- `src/components/Layout.jsx` - Implemented navigation filtering
- `src/App.jsx` - Added protected routes and unauthorized page

### New Files:
- `src/hooks/usePermissions.js` - Custom hook for permission checking
- `src/components/common/ProtectedRoute.jsx` - Component for protecting routes
- `src/components/common/PermissionChecker.jsx` - Component for conditional rendering
- `src/components/UnauthorizedPage.jsx` - Page for unauthorized access attempts
- `src/components/teachers/TeacherDashboard.jsx` - Example teacher dashboard
- `docs/role-based-access-control.md` - This documentation file
