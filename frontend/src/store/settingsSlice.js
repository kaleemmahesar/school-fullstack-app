import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createAsyncThunkWithToast } from '../utils/asyncThunkUtils';
import { SCHOOL_CONFIG } from '../config/schoolConfig';
import { API_BASE_URL } from '../utils/apiConfig';


// Async thunk for fetching school settings from the API
export const fetchSchoolInfo = createAsyncThunk(
  'settings/fetchSchoolInfo',
  async (_, { rejectWithValue }) => {
    try {
      // const response = await fetch('http://localhost:3001/settings');
      const response = await fetch(`${API_BASE_URL}/settings`);
      if (!response.ok) {
        throw new Error('Failed to fetch school settings');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch school information');
    }
  }
);

// Async thunk for updating school settings via the API
export const updateSchoolInfo = createAsyncThunk(
  'settings/updateSchoolInfo',
  async (settingsData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settingsData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update school settings');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update school information');
    }
  }
);

// Initial state
const initialState = {
  schoolInfo: null,
  loading: false,
  error: null,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetSettings: () => initialState,
    // Add a reducer to update holidays
    setHolidays: (state, action) => {
      if (state.schoolInfo) {
        state.schoolInfo.holidays = action.payload;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch school info
      .addCase(fetchSchoolInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSchoolInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.schoolInfo = action.payload;
      })
      .addCase(fetchSchoolInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update school info
      .addCase(updateSchoolInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSchoolInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.schoolInfo = action.payload;
      })
      .addCase(updateSchoolInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, resetSettings, setHolidays } = settingsSlice.actions;
export default settingsSlice.reducer;