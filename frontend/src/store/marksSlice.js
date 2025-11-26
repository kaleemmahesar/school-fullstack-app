import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { createAsyncThunkWithToast } from '../utils/asyncThunkUtils';
import { API_BASE_URL } from '../utils/apiConfig';

// Initial state with empty marks array
const initialState = {
  marks: [],
  loading: false,
  error: null,
};

// Async thunk to fetch marks from the server
export const fetchMarks = createAsyncThunkWithToast(
  'marks/fetchMarks',
  async () => {
    const response = await fetch(`${API_BASE_URL}/marks`);
    if (!response.ok) {
      throw new Error('Failed to fetch marks');
    }
    return await response.json();
  },
  {
    delay: 500
  }
);

// Async thunk to add new marks
export const addMarks = createAsyncThunkWithToast(
  'marks/addMarks',
  async (marksData) => {
    const newMarks = {
      id: marksData.id || Date.now().toString(),
      ...marksData
    };
    
    const response = await fetch(`${API_BASE_URL}/marks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newMarks),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add marks');
    }
    
    return await response.json();
  },
  {
    successMessage: 'Marks added successfully',
    errorMessage: 'Failed to add marks',
    delay: 500
  }
);

// Async thunk to update existing marks
export const updateMarks = createAsyncThunkWithToast(
  'marks/updateMarks',
  async (marksData) => {
    const response = await fetch(`${API_BASE_URL}/marks/${marksData.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(marksData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update marks');
    }
    
    return await response.json();
  },
  {
    successMessage: 'Marks updated successfully',
    errorMessage: 'Failed to update marks',
    delay: 500
  }
);

// Async thunk to delete marks
export const deleteMarks = createAsyncThunkWithToast(
  'marks/deleteMarks',
  async (marksId) => {
    const response = await fetch(`${API_BASE_URL}/marks/${marksId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete marks');
    }
    
    return marksId;
  },
  {
    successMessage: 'Marks deleted successfully',
    errorMessage: 'Failed to delete marks',
    delay: 500
  }
);

const marksSlice = createSlice({
  name: 'marks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMarks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMarks.fulfilled, (state, action) => {
        state.loading = false;
        state.marks = action.payload;
      })
      .addCase(fetchMarks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addMarks.fulfilled, (state, action) => {
        state.marks.push(action.payload);
      })
      .addCase(updateMarks.fulfilled, (state, action) => {
        const index = state.marks.findIndex(m => m.id === action.payload.id);
        if (index !== -1) {
          state.marks[index] = action.payload;
        }
      })
      .addCase(deleteMarks.fulfilled, (state, action) => {
        state.marks = state.marks.filter(m => m.id !== action.payload);
      });
  },
});

export default marksSlice.reducer;