import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { createAsyncThunkWithToast } from '../utils/asyncThunkUtils';
import { API_BASE_URL } from '../utils/apiConfig';

// Initial state
const initialState = {
  events: [],
  loading: false,
  error: null,
};

// Async thunk to fetch events from the server
export const fetchEvents = createAsyncThunkWithToast(
  'events/fetchEvents',
  async () => {
    const response = await fetch(`${API_BASE_URL}/events`);
    if (!response.ok) {
      throw new Error('Failed to fetch events');
    }
    return await response.json();
  },
  {
    delay: 500
  }
);

// Async thunk to add a new event
export const addEvent = createAsyncThunkWithToast(
  'events/addEvent',
  async (eventData) => {
    const newEvent = {
      id: Date.now().toString(),
      ...eventData,
      // Add timestamp for when record was created
      addedTimestamp: new Date().toISOString()
    };
    
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newEvent),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add event');
    }
    
    return await response.json();
  },
  {
    successMessage: 'Event added successfully',
    errorMessage: 'Failed to add event',
    delay: 500
  }
);

// Async thunk to update an existing event
export const updateEvent = createAsyncThunkWithToast(
  'events/updateEvent',
  async (eventData) => {
    const response = await fetch(`${API_BASE_URL}/events/${eventData.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update event');
    }
    
    return await response.json();
  },
  {
    successMessage: 'Event updated successfully',
    errorMessage: 'Failed to update event',
    delay: 500
  }
);

// Async thunk to delete an event
export const deleteEvent = createAsyncThunkWithToast(
  'events/deleteEvent',
  async (eventId) => {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete event');
    }
    
    return eventId;
  },
  {
    successMessage: 'Event deleted successfully',
    errorMessage: 'Failed to delete event',
    delay: 500
  }
);

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addEvent.fulfilled, (state, action) => {
        state.events.push(action.payload);
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        const index = state.events.findIndex(event => event.id === action.payload.id);
        if (index !== -1) {
          state.events[index] = action.payload;
        }
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.events = state.events.filter(event => event.id !== action.payload);
      });
  },
});

export default eventsSlice.reducer;