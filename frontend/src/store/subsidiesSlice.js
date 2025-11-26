import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_BASE_URL } from '../utils/apiConfig';

// Async thunks for API calls
export const fetchSubsidies = createAsyncThunk(
  'subsidies/fetchSubsidies',
  async () => {
    const response = await fetch(`${API_BASE_URL}/subsidies`);
    if (!response.ok) {
      throw new Error('Failed to fetch subsidies');
    }
    return await response.json();
  }
);

// Async thunk to add a new subsidy
export const addSubsidy = createAsyncThunk(
  'subsidies/addSubsidy',
  async (subsidyData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/subsidies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subsidyData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add subsidy');
      }
      
      const newSubsidy = await response.json();
      return newSubsidy;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to add subsidy');
    }
  }
);

// Async thunk to update an existing subsidy
export const updateSubsidy = createAsyncThunk(
  'subsidies/updateSubsidy',
  async (subsidyData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/subsidies/${subsidyData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subsidyData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update subsidy');
      }
      
      const updatedSubsidy = await response.json();
      return updatedSubsidy;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update subsidy');
    }
  }
);

const initialState = {
  subsidies: [],
  loading: false,
  error: null,
};

const subsidiesSlice = createSlice({
  name: 'subsidies',
  initialState,
  reducers: {
    // Remove the old addSubsidy reducer since we're using async thunk now
    // Remove the old updateSubsidy reducer since we're using async thunk now
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubsidies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubsidies.fulfilled, (state, action) => {
        state.loading = false;
        state.subsidies = action.payload;
      })
      .addCase(fetchSubsidies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Handle addSubsidy async thunk
      .addCase(addSubsidy.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addSubsidy.fulfilled, (state, action) => {
        state.loading = false;
        state.subsidies.push(action.payload); // Add the new subsidy to the array
      })
      .addCase(addSubsidy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handle updateSubsidy async thunk
      .addCase(updateSubsidy.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSubsidy.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.subsidies.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.subsidies[index] = action.payload; // Update the existing subsidy
        }
      })
      .addCase(updateSubsidy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default subsidiesSlice.reducer;