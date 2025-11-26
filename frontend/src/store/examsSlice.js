import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { createAsyncThunkWithToast } from '../utils/asyncThunkUtils';
import { API_BASE_URL } from '../utils/apiConfig';

const initialState = {
  exams: [],
  loading: false,
  error: null,
};

// Async thunks for API calls
export const fetchExams = createAsyncThunkWithToast(
  'exams/fetchExams',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/exams`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch examinations: ${response.status} ${response.statusText} - ${errorText}`);
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch examinations');
    }
  },
  {
    errorMessage: 'Failed to load examinations',
    successMessage: null,
    delay: 0
  }
);

export const addExam = createAsyncThunkWithToast(
  'exams/addExam',
  async (examData, { rejectWithValue }) => {
    try {
      // Determine current academic year
      const currentYear = new Date().getFullYear();
      const nextYear = currentYear + 1;
      const academicYear = `${currentYear}-${nextYear}`;
      
      // Add academic year to exam data
      const examWithAcademicYear = {
        ...examData,
        academicYear
      };
      
      const response = await fetch(`${API_BASE_URL}/exams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(examWithAcademicYear),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add examination');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  {
    errorMessage: 'Failed to add examination',
    successMessage: 'Examination added successfully',
    delay: 500
  }
);

export const updateExam = createAsyncThunkWithToast(
  'exams/updateExam',
  async (examData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/exams/${examData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(examData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update examination');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  {
    errorMessage: 'Failed to update examination',
    successMessage: 'Examination updated successfully',
    delay: 500
  }
);

export const deleteExam = createAsyncThunkWithToast(
  'exams/deleteExam',
  async (examId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/exams/${examId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete examination');
      }
      
      return examId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  {
    errorMessage: 'Failed to delete examination',
    successMessage: 'Examination deleted successfully',
    delay: 500
  }
);

const examsSlice = createSlice({
  name: 'exams',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExams.fulfilled, (state, action) => {
        state.loading = false;
        state.exams = action.payload;
      })
      .addCase(fetchExams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message || 'Failed to load examinations';
      })
      .addCase(addExam.fulfilled, (state, action) => {
        state.exams.push(action.payload);
      })
      .addCase(updateExam.fulfilled, (state, action) => {
        const index = state.exams.findIndex(e => e.id === action.payload.id);
        if (index !== -1) {
          state.exams[index] = action.payload;
        }
      })
      .addCase(deleteExam.fulfilled, (state, action) => {
        state.exams = state.exams.filter(e => e.id !== action.payload);
      });
  },
});

export default examsSlice.reducer;