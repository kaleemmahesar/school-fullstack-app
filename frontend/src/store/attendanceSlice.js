import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  fetchAttendanceRecords, 
  addAttendanceRecord, 
  updateAttendanceRecord,
  getAttendanceByDateAndClass,
  getAttendanceByStudent,
  generateAttendanceReport
} from '../utils/attendanceApi';

// Initial state
const initialState = {
  attendanceRecords: [],
  loading: false,
  error: null,
  selectedDate: new Date().toISOString().split('T')[0],
  selectedClass: '',
};

// Async thunks for API calls
export const fetchAllAttendanceRecords = createAsyncThunk(
  'attendance/fetchAllAttendanceRecords',
  async (_, { rejectWithValue }) => {
    try {
      const records = await fetchAttendanceRecords();
      return records;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch attendance records');
    }
  }
);

export const addNewAttendanceRecord = createAsyncThunk(
  'attendance/addNewAttendanceRecord',
  async (attendanceData, { rejectWithValue }) => {
    try {
      const record = await addAttendanceRecord(attendanceData);
      return record;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to add attendance record');
    }
  }
);

export const updateExistingAttendanceRecord = createAsyncThunk(
  'attendance/updateExistingAttendanceRecord',
  async (attendanceData, { rejectWithValue }) => {
    try {
      const record = await updateAttendanceRecord(attendanceData);
      return record;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update attendance record');
    }
  }
);

export const fetchAttendanceByDateAndClass = createAsyncThunk(
  'attendance/fetchAttendanceByDateAndClass',
  async ({ date, classId }, { rejectWithValue }) => {
    try {
      console.log(`API Call: Fetching attendance for date=${date}, classId=${classId}`);
      const records = await getAttendanceByDateAndClass(date, classId);
      console.log('API Response:', records);
      return records;
    } catch (error) {
      console.error('API Error:', error);
      return rejectWithValue(error.message || 'Failed to fetch attendance records');
    }
  }
);

export const fetchAttendanceByStudent = createAsyncThunk(
  'attendance/fetchAttendanceByStudent',
  async (studentId, { rejectWithValue }) => {
    try {
      const records = await getAttendanceByStudent(studentId);
      return records;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch attendance records');
    }
  }
);

export const generateReport = createAsyncThunk(
  'attendance/generateReport',
  async ({ startDate, endDate, classId }, { rejectWithValue }) => {
    try {
      const report = await generateAttendanceReport(startDate, endDate, classId);
      return report;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to generate attendance report');
    }
  }
);

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetAttendance: () => initialState,
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
    },
    setSelectedClass: (state, action) => {
      state.selectedClass = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all attendance records
      .addCase(fetchAllAttendanceRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllAttendanceRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.attendanceRecords = action.payload;
      })
      .addCase(fetchAllAttendanceRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add new attendance record
      .addCase(addNewAttendanceRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addNewAttendanceRecord.fulfilled, (state, action) => {
        state.loading = false;
        // Check if we already have a record for this date and class
        const existingIndex = state.attendanceRecords.findIndex(
          record => record.date === action.payload.date && record.classId === action.payload.classId
        );
        
        if (existingIndex !== -1) {
          // Update existing record
          state.attendanceRecords[existingIndex] = action.payload;
        } else {
          // Add new record
          state.attendanceRecords.push(action.payload);
        }
      })
      .addCase(addNewAttendanceRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update existing attendance record
      .addCase(updateExistingAttendanceRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExistingAttendanceRecord.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.attendanceRecords.findIndex(record => record.id === action.payload.id);
        if (index !== -1) {
          state.attendanceRecords[index] = action.payload;
        }
      })
      .addCase(updateExistingAttendanceRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch attendance by date and class
      .addCase(fetchAttendanceByDateAndClass.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendanceByDateAndClass.fulfilled, (state, action) => {
        state.loading = false;
        console.log('API Response in Slice:', action.payload);
        state.attendanceRecords = action.payload;
      })
      .addCase(fetchAttendanceByDateAndClass.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch attendance by student
      .addCase(fetchAttendanceByStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendanceByStudent.fulfilled, (state, action) => {
        state.loading = false;
        state.attendanceRecords = action.payload;
      })
      .addCase(fetchAttendanceByStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Generate report
      .addCase(generateReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateReport.fulfilled, (state, action) => {
        state.loading = false;
        // Handle report data as needed
      })
      .addCase(generateReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, resetAttendance, setSelectedDate, setSelectedClass } = attendanceSlice.actions;
export default attendanceSlice.reducer;