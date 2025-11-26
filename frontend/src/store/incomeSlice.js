import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_BASE_URL } from '../utils/apiConfig';

// Async thunks for API calls
export const fetchIncome = createAsyncThunk(
  'income/fetchIncome',
  async () => {
    const response = await fetch(`${API_BASE_URL}/income`);
    if (!response.ok) {
      throw new Error('Failed to fetch income data');
    }
    return await response.json();
  }
);

// Async thunk to add canteen income with academic year
export const addCanteenIncome = createAsyncThunk(
  'income/addCanteenIncome',
  async (incomeData) => {
    // Add academic year based on current date
    const currentDate = new Date(incomeData.date || new Date());
    const currentYear = currentDate.getFullYear();
    const nextYear = currentYear + 1;
    const academicYear = `${currentYear}-${nextYear}`;
    
    const newItem = {
      ...incomeData,
      id: `c${Date.now()}`,
      academicYear // Add academic year field
    };
    
    // First, fetch current income data
    const fetchResponse = await fetch(`${API_BASE_URL}/income`);
    if (!fetchResponse.ok) {
      throw new Error('Failed to fetch income data');
    }
    
    const currentIncome = await fetchResponse.json();
    
    // Update canteen income array
    const updatedCanteenIncome = [...(currentIncome.canteenIncome || []), newItem];
    
    // Update income in database
    const updateResponse = await fetch(`${API_BASE_URL}/income`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...currentIncome,
        canteenIncome: updatedCanteenIncome
      }),
    });
    
    if (!updateResponse.ok) {
      throw new Error('Failed to add canteen income');
    }
    
    return newItem;
  }
);

// Async thunk to add sponsorship income with academic year
export const addSponsorshipIncome = createAsyncThunk(
  'income/addSponsorshipIncome',
  async (incomeData) => {
    // Add academic year based on current date
    const currentDate = new Date(incomeData.date || new Date());
    const currentYear = currentDate.getFullYear();
    const nextYear = currentYear + 1;
    const academicYear = `${currentYear}-${nextYear}`;
    
    const newItem = {
      ...incomeData,
      id: `s${Date.now()}`,
      academicYear // Add academic year field
    };
    
    // First, fetch current income data
    const fetchResponse = await fetch(`${API_BASE_URL}/income`);
    if (!fetchResponse.ok) {
      throw new Error('Failed to fetch income data');
    }
    
    const currentIncome = await fetchResponse.json();
    
    // Update sponsorship income array
    const updatedSponsorshipIncome = [...(currentIncome.sponsorshipIncome || []), newItem];
    
    // Update income in database
    const updateResponse = await fetch(`${API_BASE_URL}/income`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...currentIncome,
        sponsorshipIncome: updatedSponsorshipIncome
      }),
    });
    
    if (!updateResponse.ok) {
      throw new Error('Failed to add sponsorship income');
    }
    
    return newItem;
  }
);

// Async thunk to update canteen income
export const updateCanteenIncome = createAsyncThunk(
  'income/updateCanteenIncome',
  async (incomeData) => {
    // First, fetch current income data
    const fetchResponse = await fetch(`${API_BASE_URL}/income`);
    if (!fetchResponse.ok) {
      throw new Error('Failed to fetch income data');
    }
    
    const currentIncome = await fetchResponse.json();
    
    // Update canteen income array
    const updatedCanteenIncome = (currentIncome.canteenIncome || []).map(item => 
      item.id === incomeData.id ? incomeData : item
    );
    
    // Update income in database
    const updateResponse = await fetch(`${API_BASE_URL}/income`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...currentIncome,
        canteenIncome: updatedCanteenIncome
      }),
    });
    
    if (!updateResponse.ok) {
      throw new Error('Failed to update canteen income');
    }
    
    return incomeData;
  }
);

// Async thunk to update sponsorship income
export const updateSponsorshipIncome = createAsyncThunk(
  'income/updateSponsorshipIncome',
  async (incomeData) => {
    // First, fetch current income data
    const fetchResponse = await fetch(`${API_BASE_URL}/income`);
    if (!fetchResponse.ok) {
      throw new Error('Failed to fetch income data');
    }
    
    const currentIncome = await fetchResponse.json();
    
    // Update sponsorship income array
    const updatedSponsorshipIncome = (currentIncome.sponsorshipIncome || []).map(item => 
      item.id === incomeData.id ? incomeData : item
    );
    
    // Update income in database
    const updateResponse = await fetch(`${API_BASE_URL}/income`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...currentIncome,
        sponsorshipIncome: updatedSponsorshipIncome
      }),
    });
    
    if (!updateResponse.ok) {
      throw new Error('Failed to update sponsorship income');
    }
    
    return incomeData;
  }
);

// Async thunk to delete canteen income
export const deleteCanteenIncome = createAsyncThunk(
  'income/deleteCanteenIncome',
  async (incomeId) => {
    // First, fetch current income data
    const fetchResponse = await fetch(`${API_BASE_URL}/income`);
    if (!fetchResponse.ok) {
      throw new Error('Failed to fetch income data');
    }
    
    const currentIncome = await fetchResponse.json();
    
    // Filter out the deleted item
    const updatedCanteenIncome = (currentIncome.canteenIncome || []).filter(item => 
      item.id !== incomeId
    );
    
    // Update income in database
    const updateResponse = await fetch(`${API_BASE_URL}/income`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...currentIncome,
        canteenIncome: updatedCanteenIncome
      }),
    });
    
    if (!updateResponse.ok) {
      throw new Error('Failed to delete canteen income');
    }
    
    return incomeId;
  }
);

// Async thunk to delete sponsorship income
export const deleteSponsorshipIncome = createAsyncThunk(
  'income/deleteSponsorshipIncome',
  async (incomeId) => {
    // First, fetch current income data
    const fetchResponse = await fetch(`${API_BASE_URL}/income`);
    if (!fetchResponse.ok) {
      throw new Error('Failed to fetch income data');
    }
    
    const currentIncome = await fetchResponse.json();
    
    // Filter out the deleted item
    const updatedSponsorshipIncome = (currentIncome.sponsorshipIncome || []).filter(item => 
      item.id !== incomeId
    );
    
    // Update income in database
    const updateResponse = await fetch(`${API_BASE_URL}/income`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...currentIncome,
        sponsorshipIncome: updatedSponsorshipIncome
      }),
    });
    
    if (!updateResponse.ok) {
      throw new Error('Failed to delete sponsorship income');
    }
    
    return incomeId;
  }
);

const initialState = {
  canteenIncome: [],
  sponsorshipIncome: [],
  loading: false,
  error: null,
};

const incomeSlice = createSlice({
  name: 'income',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchIncome.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIncome.fulfilled, (state, action) => {
        state.loading = false;
        state.canteenIncome = action.payload.canteenIncome || [];
        state.sponsorshipIncome = action.payload.sponsorshipIncome || [];
      })
      .addCase(fetchIncome.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addCanteenIncome.fulfilled, (state, action) => {
        state.canteenIncome.push(action.payload);
      })
      .addCase(addSponsorshipIncome.fulfilled, (state, action) => {
        state.sponsorshipIncome.push(action.payload);
      })
      .addCase(updateCanteenIncome.fulfilled, (state, action) => {
        const index = state.canteenIncome.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.canteenIncome[index] = action.payload;
        }
      })
      .addCase(updateSponsorshipIncome.fulfilled, (state, action) => {
        const index = state.sponsorshipIncome.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.sponsorshipIncome[index] = action.payload;
        }
      })
      .addCase(deleteCanteenIncome.fulfilled, (state, action) => {
        state.canteenIncome = state.canteenIncome.filter(item => item.id !== action.payload);
      })
      .addCase(deleteSponsorshipIncome.fulfilled, (state, action) => {
        state.sponsorshipIncome = state.sponsorshipIncome.filter(item => item.id !== action.payload);
      });
  }
});

export default incomeSlice.reducer;