import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk to fetch notifications
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async () => {
    const response = await fetch(`${API_BASE_URL}/notifications`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }
    return response.json();
  }
);

// Async thunk to add a notification
export const addNotification = createAsyncThunk(
  'notifications/addNotification',
  async (notificationData) => {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notificationData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add notification');
    }
    
    return response.json();
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: [],
    loading: false,
    error: null,
  },
  reducers: {
    markAsRead: (state, action) => {
      const notificationId = action.payload;
      const notification = state.notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true;
      });
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Add notification
      .addCase(addNotification.fulfilled, (state, action) => {
        state.notifications.push(action.payload);
      });
  },
});

export const { markAsRead, markAllAsRead } = notificationsSlice.actions;
export default notificationsSlice.reducer;