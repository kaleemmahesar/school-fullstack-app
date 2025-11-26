import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { createAsyncThunkWithToast } from '../utils/asyncThunkUtils';
import { API_BASE_URL } from '../utils/apiConfig';

// Initial state
const initialState = {
  alumni: [],
  batches: [],
  loading: false,
  error: null,
};

// Async thunk to fetch alumni from the server
export const fetchAlumni = createAsyncThunkWithToast(
  'alumni/fetchAlumni',
  async () => {
    const response = await fetch(`${API_BASE_URL}/alumni`);
    if (!response.ok) {
      throw new Error('Failed to fetch alumni');
    }
    return await response.json();
  },
  {
    delay: 500
  }
);

// Async thunk to fetch batches from the server
export const fetchBatches = createAsyncThunkWithToast(
  'alumni/fetchBatches',
  async () => {
    const response = await fetch(`${API_BASE_URL}/batches`);
    if (!response.ok) {
      throw new Error('Failed to fetch batches');
    }
    return await response.json();
  },
  {
    delay: 500
  }
);

// Async thunk to add a new alumnus
export const addAlumnus = createAsyncThunkWithToast(
  'alumni/addAlumnus',
  async (alumniData) => {
    const newAlumnus = {
      id: Date.now().toString(),
      ...alumniData,
      // Add timestamp for when record was created
      addedTimestamp: new Date().toISOString()
    };
    
    const response = await fetch(`${API_BASE_URL}/alumni`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newAlumnus),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add alumnus');
    }
    
    return await response.json();
  },
  {
    successMessage: 'Alumnus added successfully',
    errorMessage: 'Failed to add alumnus',
    delay: 500
  }
);

// Async thunk to update an existing alumnus
export const updateAlumnus = createAsyncThunkWithToast(
  'alumni/updateAlumnus',
  async (alumniData) => {
    const response = await fetch(`${API_BASE_URL}/alumni/${alumniData.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(alumniData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update alumnus');
    }
    
    return await response.json();
  },
  {
    successMessage: 'Alumnus updated successfully',
    errorMessage: 'Failed to update alumnus',
    delay: 500
  }
);

// Async thunk to delete an alumnus
export const deleteAlumnus = createAsyncThunkWithToast(
  'alumni/deleteAlumnus',
  async (alumniId) => {
    const response = await fetch(`${API_BASE_URL}/alumni/${alumniId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete alumnus');
    }
    
    return alumniId;
  },
  {
    successMessage: 'Alumnus deleted successfully',
    errorMessage: 'Failed to delete alumnus',
    delay: 500
  }
);

// Async thunk to add a new batch
export const addBatch = createAsyncThunkWithToast(
  'alumni/addBatch',
  async (batchData) => {
    const newBatch = {
      id: Date.now().toString(),
      ...batchData,
      // Add timestamp for when batch was created
      addedTimestamp: new Date().toISOString()
    };
    
    const response = await fetch(`${API_BASE_URL}/batches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newBatch),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add batch');
    }
    
    return await response.json();
  },
  {
    successMessage: 'Batch added successfully',
    errorMessage: 'Failed to add batch',
    delay: 500
  }
);

// Async thunk to update an existing batch
export const updateBatch = createAsyncThunkWithToast(
  'alumni/updateBatch',
  async (batchData) => {
    const response = await fetch(`${API_BASE_URL}/batches/${batchData.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(batchData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update batch');
    }
    
    return await response.json();
  },
  {
    successMessage: 'Batch updated successfully',
    errorMessage: 'Failed to update batch',
    delay: 500
  }
);

// Async thunk to delete a batch
export const deleteBatch = createAsyncThunkWithToast(
  'alumni/deleteBatch',
  async (batchId) => {
    const response = await fetch(`${API_BASE_URL}/batches/${batchId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete batch');
    }
    
    return batchId;
  },
  {
    successMessage: 'Batch deleted successfully',
    errorMessage: 'Failed to delete batch',
    delay: 500
  }
);

const alumniSlice = createSlice({
  name: 'alumni',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAlumni.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAlumni.fulfilled, (state, action) => {
        state.loading = false;
        state.alumni = action.payload;
      })
      .addCase(fetchAlumni.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchBatches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBatches.fulfilled, (state, action) => {
        state.loading = false;
        state.batches = action.payload;
      })
      .addCase(fetchBatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addAlumnus.fulfilled, (state, action) => {
        state.alumni.push(action.payload);
      })
      .addCase(updateAlumnus.fulfilled, (state, action) => {
        const index = state.alumni.findIndex(alumnus => alumnus.id === action.payload.id);
        if (index !== -1) {
          state.alumni[index] = action.payload;
        }
      })
      .addCase(deleteAlumnus.fulfilled, (state, action) => {
        state.alumni = state.alumni.filter(alumnus => alumnus.id !== action.payload);
      })
      .addCase(addBatch.fulfilled, (state, action) => {
        state.batches.push(action.payload);
      })
      .addCase(updateBatch.fulfilled, (state, action) => {
        const index = state.batches.findIndex(batch => batch.id === action.payload.id);
        if (index !== -1) {
          state.batches[index] = action.payload;
        }
      })
      .addCase(deleteBatch.fulfilled, (state, action) => {
        state.batches = state.batches.filter(batch => batch.id !== action.payload);
      });
  },
});

export default alumniSlice.reducer;