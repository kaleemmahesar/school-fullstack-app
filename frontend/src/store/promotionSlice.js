import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { createAsyncThunkWithToast } from '../utils/asyncThunkUtils';
import { API_BASE_URL } from '../utils/apiConfig';

// Initial state
const initialState = {
  promotions: [],
  loading: false,
  error: null,
};

// Async thunk to fetch promotions from the server
export const fetchPromotions = createAsyncThunkWithToast(
  'promotions/fetchPromotions',
  async () => {
    const response = await fetch(`${API_BASE_URL}/promotions`);
    if (!response.ok) {
      throw new Error('Failed to fetch promotions');
    }
    return await response.json();
  },
  {
    delay: 500
  }
);

// Async thunk to promote students
export const promoteStudents = createAsyncThunkWithToast(
  'promotions/promoteStudents',
  async (promotionData) => {
    const newPromotion = {
      id: Date.now().toString(),
      ...promotionData,
      // Add timestamp for when promotion was processed
      promotionTimestamp: new Date().toISOString()
    };
    
    const response = await fetch(`${API_BASE_URL}/promotions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newPromotion),
    });
    
    if (!response.ok) {
      throw new Error('Failed to record promotion');
    }
    
    return await response.json();
  },
  {
    successMessage: 'Students promoted successfully',
    errorMessage: 'Failed to promote students',
    delay: 500
  }
);

const promotionSlice = createSlice({
  name: 'promotions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPromotions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPromotions.fulfilled, (state, action) => {
        state.loading = false;
        state.promotions = action.payload;
      })
      .addCase(fetchPromotions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(promoteStudents.fulfilled, (state, action) => {
        state.promotions.push(action.payload);
      });
  },
});

export default promotionSlice.reducer;