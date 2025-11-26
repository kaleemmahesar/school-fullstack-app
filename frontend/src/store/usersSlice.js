import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createAsyncThunkWithToast } from '../utils/asyncThunkUtils';
import { API_BASE_URL } from '../utils/apiConfig';

// Role permissions configuration
const rolesConfig = {
  Owner: {
    permissions: [
      'all',
      'students',
      'classes',
      'staff',
      'fees',
      'expenses',
      'subsidies',
      'reports', // General reports permission (for backward compatibility)
      'financial-reports', // Specific financial reports permission
      'student-reports', // Specific student reports permission
      'settings',
      'attendance',
      'staff-attendance', // Staff attendance permission
      'marksheets',
      'certificates',
      'examinations'
    ]
  },
  Admin: {
    permissions: [
      'students',
      'classes',
      'staff',
      
      'attendance',
      'staff-attendance', // Staff attendance permission
      'marksheets',
      'certificates',
      'examinations',
      'student-reports', // Allow access to student reports
      'reports' // Keep general reports permission for backward compatibility
      // Excludes financial permissions (fees, expenses, subsidies), settings, and financial reports
    ]
  },
  Teacher: {
    permissions: [
      'marksheets',
      'student-reports', // Allow access to student reports only
      'reports' // Keep general reports permission for backward compatibility
      // Excludes financial reports and settings
    ]
  },
  Staff: {
    permissions: [
      'students',
      'attendance',
      'staff-attendance', // Staff attendance permission
      'marksheets',
      'certificates',
      'fees',
      'examinations',
      'student-reports', // Allow access to student reports
      'reports' // Keep general reports permission for backward compatibility
      // Can generate challans, marksheets, certificates, attendance, add new students
      // Excludes financial overview, settings, and financial reports
    ]
  }
};

// Mock data for users
const mockUsers = [
  {
    id: '1',
    username: 'owner',
    email: 'owner@school.com',
    role: 'Owner',
    permissions: rolesConfig.Owner.permissions,
    lastLogin: '2023-10-05T14:30:00Z',
    loginHistory: [
      { id: 'login-1', timestamp: '2023-10-05T14:30:00Z', status: 'success', ip: '192.168.1.100' },
      { id: 'login-2', timestamp: '2023-10-04T09:15:00Z', status: 'success', ip: '192.168.1.100' },
      { id: 'login-3', timestamp: '2023-10-03T16:45:00Z', status: 'failed', ip: '192.168.1.101' }
    ]
  },
  {
    id: '2',
    username: 'admin',
    email: 'admin@school.com',
    role: 'Admin',
    permissions: rolesConfig.Admin.permissions,
    lastLogin: '2023-10-05T14:30:00Z',
    loginHistory: [
      { id: 'login-1', timestamp: '2023-10-05T14:30:00Z', status: 'success', ip: '192.168.1.100' },
      { id: 'login-2', timestamp: '2023-10-04T09:15:00Z', status: 'success', ip: '192.168.1.100' },
      { id: 'login-3', timestamp: '2023-10-03T16:45:00Z', status: 'failed', ip: '192.168.1.101' }
    ]
  },
  {
    id: '3',
    username: 'teacher',
    email: 'teacher@school.com',
    role: 'Teacher',
    permissions: rolesConfig.Teacher.permissions,
    lastLogin: '2023-10-05T08:45:00Z',
    loginHistory: [
      { id: 'login-6', timestamp: '2023-10-05T08:45:00Z', status: 'success', ip: '192.168.1.103' },
      { id: 'login-7', timestamp: '2023-10-04T07:50:00Z', status: 'success', ip: '192.168.1.103' }
    ]
  },
  {
    id: '4',
    username: 'staff',
    email: 'staff@school.com',
    role: 'Staff',
    permissions: rolesConfig.Staff.permissions,
    lastLogin: '2023-10-05T10:20:00Z',
    loginHistory: [
      { id: 'login-4', timestamp: '2023-10-05T10:20:00Z', status: 'success', ip: '192.168.1.102' },
      { id: 'login-5', timestamp: '2023-10-04T11:30:00Z', status: 'success', ip: '192.168.1.102' }
    ]
  }
];

const initialState = {
  users: JSON.parse(JSON.stringify(mockUsers)),
  currentUser: JSON.parse(localStorage.getItem('currentUser')) || null,
  loading: false,
  error: null,
};

// Utility functions for permission checking
export const selectHasPermission = (state, permission) => {
  const user = state.users.currentUser;
  if (!user) return false;
  
  // Owners have all permissions
  if (user.role === 'Owner') return true;
  
  // Check if user has specific permission
  return user.permissions?.includes(permission) || user.permissions?.includes('all') || false;
};

export const selectHasAnyPermission = (state, permissions) => {
  if (!state.users.currentUser) return false;
  return permissions.some(permission => selectHasPermission(state, permission));
};

export const selectHasAllPermissions = (state, permissions) => {
  if (!state.users.currentUser) return false;
  return permissions.every(permission => selectHasPermission(state, permission));
};

export const selectIsOwner = (state) => {
  return state.users.currentUser?.role === 'Owner' || false;
};

export const selectIsAdmin = (state) => {
  return state.users.currentUser?.role === 'Admin' || false;
};

export const selectIsTeacher = (state) => {
  return state.users.currentUser?.role === 'Teacher' || false;
};

export const selectIsStaff = (state) => {
  return state.users.currentUser?.role === 'Staff' || false;
};

// Async thunks for mock API calls
export const fetchUsers = createAsyncThunk('users/fetchUsers', async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  // Return a deep copy to avoid read-only issues
  return JSON.parse(JSON.stringify(mockUsers));
});

export const addUser = createAsyncThunk('users/addUser', async (userData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Ensure permissions are set based on role
  let permissions = [];
  if (rolesConfig[userData.role]) {
    permissions = rolesConfig[userData.role].permissions;
  }
  
  const newUser = {
    id: Date.now().toString(),
    ...userData,
    permissions,
    loginHistory: []
  };
  return newUser;
});

export const updateUser = createAsyncThunk('users/updateUser', async (userData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return userData;
});

export const deleteUser = createAsyncThunk('users/deleteUser', async (userId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return userId;
});

export const loginUser = createAsyncThunk('users/loginUser', async ({ username, password }, { rejectWithValue }) => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In a real implementation, this would validate credentials against a backend
    // For demo purposes, we'll validate against mock users
    let user = null;
    
    // Check for demo credentials
    if ((username === 'owner' && password === 'owner123') || 
        (username === 'admin' && password === 'admin123') ||
        (username === 'teacher' && password === 'teacher123') ||
        (username === 'staff' && password === 'staff123')) {
      const userIndex = mockUsers.findIndex(u => u.username === username);
      if (userIndex !== -1) {
        // Create a deep copy of the user object to avoid modifying the original
        user = JSON.parse(JSON.stringify(mockUsers[userIndex]));
      }
    }
    
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    // Update last login timestamp on the copied user object
    user.lastLogin = new Date().toISOString();
    
    // Add login attempt to history
    const loginAttempt = {
      id: `login-${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: 'success',
      ip: '192.168.1.100' // Mock IP
    };
    
    // In a real app, we'd update the user's login history
    // For demo, we'll just return the user object
    return user;
  } catch (error) {
    return rejectWithValue(error.message || 'Login failed');
  }
});

// Create the users slice
const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    logout: (state) => {
      state.currentUser = null;
      localStorage.removeItem('currentUser');
    },
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
      localStorage.setItem('currentUser', JSON.stringify(action.payload));
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addUser.fulfilled, (state, action) => {
        // Create a deep copy to ensure we're not modifying any references
        state.users.push(JSON.parse(JSON.stringify(action.payload)));
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          // Create a deep copy to ensure we're not modifying any references
          state.users[index] = JSON.parse(JSON.stringify(action.payload));
        }
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(user => user.id !== action.payload);
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        localStorage.setItem('currentUser', JSON.stringify(action.payload));
        // Also update the user in the users array to reflect the latest login
        const userIndex = state.users.findIndex(u => u.id === action.payload.id);
        if (userIndex !== -1) {
          // Create a deep copy to ensure we're not modifying any references
          state.users[userIndex] = JSON.parse(JSON.stringify(action.payload));
        }
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export the actions
export const { logout, setCurrentUser } = usersSlice.actions;

// Export the reducer as default
export default usersSlice.reducer;