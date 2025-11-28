import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { addStaffAttendanceRecord, getStaffAttendanceByDate } from '../utils/staffAttendanceApi';
import { API_BASE_URL } from '../utils/apiConfig';

const initialState = {
  staff: [],
  attendanceRecords: [], // Add attendance records to state
  loading: false,
  error: null,
};

// Async thunks
export const fetchStaff = createAsyncThunk('staff/fetchStaff', async () => {
  const response = await fetch(`${API_BASE_URL}/staff`);
  if (!response.ok) {
    throw new Error('Failed to fetch staff');
  }
  return await response.json();
});

// Fetch staff attendance by date - UPDATED TO USE REAL API
export const fetchStaffAttendanceByDate = createAsyncThunk('staff/fetchStaffAttendanceByDate', async (date) => {
  try {
    const response = await fetch(`${API_BASE_URL}staffAttendance&date=${date}`);
    if (!response.ok) {
      throw new Error('Failed to fetch staff attendance');
    }
    const records = await response.json();
    return records;
  } catch (error) {
    // Fallback to mock API if real API fails
    await new Promise(resolve => setTimeout(resolve, 500));
    const records = await getStaffAttendanceByDate(date);
    return records;
  }
});

export const addStaff = createAsyncThunk('staff/addStaff', async (newStaff) => {
  // Remove the ID from newStaff so the backend can generate it
  const { id, ...staffWithoutId } = newStaff;
  
  const response = await fetch(`${API_BASE_URL}/staff`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(staffWithoutId),
  });
  
  if (!response.ok) {
    throw new Error('Failed to add staff');
  }
  
  return await response.json();
});

export const updateStaff = createAsyncThunk('staff/updateStaff', async (updatedStaff) => {
  const response = await fetch(`${API_BASE_URL}/staff/${updatedStaff.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedStaff),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update staff');
  }
  
  return await response.json();
});

export const deleteStaff = createAsyncThunk('staff/deleteStaff', async (staffId) => {
  const response = await fetch(`${API_BASE_URL}/staff/${staffId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete staff');
  }
  
  return staffId;
});

export const addStaffAdvance = createAsyncThunk('staff/addStaffAdvance', async ({ staffId, advanceAmount, reason }) => {
  // First, fetch the current staff member data
  const staffResponse = await fetch(`${API_BASE_URL}/staff/${staffId}`);
  if (!staffResponse.ok) {
    throw new Error('Failed to fetch staff member');
  }
  const staffMember = await staffResponse.json();
  
  // Create advance record
  const newAdvance = {
    id: `advance-${staffId}-${Date.now()}`,
    month: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    baseSalary: 0,
    allowances: 0,
    deductions: parseFloat(advanceAmount),
    netSalary: -parseFloat(advanceAmount),
    status: 'advance',
    paymentDate: new Date().toISOString().split('T')[0],
    reason: reason || 'Advance taken',
    // Add timestamp for when advance was given
    paymentTimestamp: new Date().toISOString()
  };
  
  // Add advance to salary history
  const updatedStaff = {
    ...staffMember,
    salaryHistory: [...(staffMember.salaryHistory || []), newAdvance]
  };
  
  // Update the staff member with the new advance
  const response = await fetch(`${API_BASE_URL}/staff/${staffId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedStaff),
  });
  
  if (!response.ok) {
    throw new Error('Failed to add staff advance');
  }
  
  return await response.json();
});

export const payStaffSalary = createAsyncThunk('staff/payStaffSalary', async ({ staffId, month, paymentMethod }) => {
  // First, fetch the current staff member data
  const staffResponse = await fetch(`${API_BASE_URL}/staff/${staffId}`);
  if (!staffResponse.ok) {
    throw new Error('Failed to fetch staff member');
  }
  const staffMember = await staffResponse.json();
  
  // Check if salary record for this month already exists
  let salaryRecord = (staffMember.salaryHistory || []).find(record => 
    record.month === month && record.status !== 'advance');
  
  if (salaryRecord) {
    // Update existing record
    salaryRecord = {
      ...salaryRecord,
      status: 'paid',
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: paymentMethod,
      // Add timestamp for when salary was paid
      paymentTimestamp: new Date().toISOString()
    };
  } else {
    // Create new salary record
    const totalAllowances = (staffMember.allowances || []).reduce((sum, allowance) => sum + parseFloat(allowance.amount || 0), 0);
    const baseSalary = parseFloat(staffMember.salary || 0);
    const netSalary = baseSalary + totalAllowances;
    
    salaryRecord = {
      id: `sal-${staffId}-${Date.now()}`,
      month: month,
      baseSalary: baseSalary,
      allowances: totalAllowances,
      deductions: 0,
      netSalary: netSalary,
      status: 'paid',
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: paymentMethod,
      // Add timestamp for when salary was paid
      paymentTimestamp: new Date().toISOString()
    };
  }
  
  // Update the staff member with the salary payment
  const updatedSalaryHistory = [...(staffMember.salaryHistory || [])];
  
  if (salaryRecord.id) {
    // Find index of existing record or add new one
    const existingIndex = updatedSalaryHistory.findIndex(record => record.id === salaryRecord.id);
    if (existingIndex !== -1) {
      updatedSalaryHistory[existingIndex] = salaryRecord;
    } else {
      updatedSalaryHistory.push(salaryRecord);
    }
  } else {
    updatedSalaryHistory.push(salaryRecord);
  }
  
  const updatedStaff = {
    ...staffMember,
    salaryHistory: updatedSalaryHistory
  };
  
  // Update the staff member with the new salary payment
  const response = await fetch(`${API_BASE_URL}/staff/${staffId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedStaff),
  });
  
  if (!response.ok) {
    throw new Error('Failed to pay staff salary');
  }
  
  return await response.json();
});

// Add staff attendance - UPDATED TO USE REAL API
export const addStaffAttendance = createAsyncThunk('staff/addStaffAttendance', async ({ date, records }) => {
  try {
    // First, check if attendance record for this date already exists
    const existingResponse = await fetch(`${API_BASE_URL}staffAttendance&date=${date}`);
    let existingRecords = [];
    if (existingResponse.ok) {
      const responseData = await existingResponse.json();
      // Ensure responseData is an array and each record has a records property that is an array
      if (Array.isArray(responseData)) {
        existingRecords = responseData.map(record => ({
          ...record,
          records: Array.isArray(record.records) ? record.records : []
        }));
      }
    }
    
    const attendanceData = { date, records };
    
    if (existingRecords && existingRecords.length > 0) {
      // Update existing record
      const existingRecord = existingRecords[0];
      const response = await fetch(`${API_BASE_URL}/staffAttendance/${existingRecord.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attendanceData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update staff attendance');
      }
      
      const result = await response.json();
      // Ensure the returned records is an array
      return {
        ...result,
        records: Array.isArray(result.records) ? result.records : []
      };
    } else {
      // Create new record
      const response = await fetch(`${API_BASE_URL}/staffAttendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attendanceData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add staff attendance');
      }
      
      const result = await response.json();
      // Ensure the returned records is an array
      return {
        ...result,
        records: Array.isArray(result.records) ? result.records : []
      };
    }
  } catch (error) {
    // Fallback to mock API if real API fails
    await new Promise(resolve => setTimeout(resolve, 500));
    await addStaffAttendanceRecord({ date, records });
    return { date, records };
  }
});

const staffSlice = createSlice({
  name: 'staff',
  initialState,
  reducers: {
    // Add any synchronous reducers here if needed
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStaff.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStaff.fulfilled, (state, action) => {
        state.loading = false;
        // Initialize attendance array for each staff member if it doesn't exist
        state.staff = action.payload.map(staff => ({
          ...staff,
          attendance: Array.isArray(staff.attendance) ? staff.attendance : []
        }));
      })
      .addCase(fetchStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchStaffAttendanceByDate.fulfilled, (state, action) => {
        state.attendanceRecords = action.payload;
      })
      .addCase(addStaff.fulfilled, (state, action) => {
        // Add new staff at the beginning of the array so they appear first
        // Initialize attendance array for the new staff member
        state.staff.unshift({
          ...action.payload,
          attendance: []
        });
      })
      .addCase(updateStaff.fulfilled, (state, action) => {
        const index = state.staff.findIndex(staff => staff.id === action.payload.id);
        if (index !== -1) {
          // Initialize attendance array if it doesn't exist
          state.staff[index] = {
            ...action.payload,
            attendance: Array.isArray(action.payload.attendance) ? action.payload.attendance : []
          };
        }
      })
      .addCase(deleteStaff.fulfilled, (state, action) => {
        state.staff = state.staff.filter(staff => staff.id !== action.payload);
      })
      .addCase(addStaffAdvance.fulfilled, (state, action) => {
        // Replace the entire staff member with the updated one from the API
        const updatedStaff = action.payload;
        const index = state.staff.findIndex(staff => staff.id === updatedStaff.id);
        if (index !== -1) {
          // Initialize attendance array if it doesn't exist
          state.staff[index] = {
            ...updatedStaff,
            attendance: Array.isArray(updatedStaff.attendance) ? updatedStaff.attendance : []
          };
        }
      })
      .addCase(payStaffSalary.fulfilled, (state, action) => {
        // Replace the entire staff member with the updated one from the API
        const updatedStaff = action.payload;
        const index = state.staff.findIndex(staff => staff.id === updatedStaff.id);
        if (index !== -1) {
          // Initialize attendance array if it doesn't exist
          state.staff[index] = {
            ...updatedStaff,
            attendance: Array.isArray(updatedStaff.attendance) ? updatedStaff.attendance : []
          };
        }
      })
      .addCase(addStaffAttendance.fulfilled, (state, action) => {
        const { date, records } = action.payload;
        
        // Ensure records is an array before trying to iterate
        if (Array.isArray(records)) {
          // Update attendance for each staff member
          records.forEach(record => {
            const staffMember = state.staff.find(staff => staff.id === record.staffId);
            if (staffMember) {
              // Initialize attendance array if it doesn't exist
              if (!Array.isArray(staffMember.attendance)) {
                staffMember.attendance = [];
              }
              
              // Check if attendance record for this date already exists
              const existingIndex = staffMember.attendance.findIndex(att => att.date === date);
              
              if (existingIndex !== -1) {
                // Update existing attendance record
                staffMember.attendance[existingIndex] = {
                  ...staffMember.attendance[existingIndex],
                  status: record.status
                };
              } else {
                // Add new attendance record
                staffMember.attendance.push({
                  date,
                  status: record.status
                });
              }
            }
          });
        }
        
        // Also update the attendanceRecords in state
        const existingRecordIndex = state.attendanceRecords.findIndex(record => record.date === date);
        if (existingRecordIndex !== -1) {
          state.attendanceRecords[existingRecordIndex] = { date, records: Array.isArray(records) ? records : [] };
        } else {
          state.attendanceRecords.push({ date, records: Array.isArray(records) ? records : [] });
        }
      });
  },
});

export default staffSlice.reducer;