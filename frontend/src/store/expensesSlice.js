import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { createAsyncThunkWithToast, createAddThunk, createUpdateThunk, createDeleteThunk } from '../utils/asyncThunkUtils';
import { API_BASE_URL } from '../utils/apiConfig';

const initialState = {
  expenses: [],
  categories: ['Stationary', 'Utilities', 'Salary', 'Maintenance'],
  loading: false,
  error: null,
};

// Async thunks for API calls
export const fetchExpenses = createAsyncThunkWithToast(
  'expenses/fetchExpenses',
  async () => {
    const response = await fetch(`${API_BASE_URL}/expenses`);
    if (!response.ok) {
      throw new Error('Failed to fetch expenses');
    }
    return await response.json();
  },
  {
    delay: 500
  }
);

export const addExpense = createAddThunk(
  'expenses/addExpense',
  async (expenseData) => {
    // Add academic year based on expense date
    const expenseDate = new Date(expenseData.date || new Date());
    const expenseYear = expenseDate.getFullYear();
    const nextYear = expenseYear + 1;
    const academicYear = `${expenseYear}-${nextYear}`;
    
    const newExpense = {
      id: Date.now().toString(),
      ...expenseData,
      academicYear, // Add academic year field
      // Add timestamp for when expense was added
      addedTimestamp: new Date().toISOString()
    };
    
    const response = await fetch(`${API_BASE_URL}/expenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newExpense),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add expense');
    }
    
    return await response.json();
  },
  {
    successMessage: 'Expense added successfully',
    errorMessage: 'Failed to add expense',
    delay: 500
  }
);

export const updateExpense = createUpdateThunk(
  'expenses/updateExpense',
  async (expenseData) => {
    const response = await fetch(`${API_BASE_URL}/expenses/${expenseData.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(expenseData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update expense');
    }
    
    return await response.json();
  },
  {
    successMessage: 'Expense updated successfully',
    errorMessage: 'Failed to update expense',
    delay: 500
  }
);

export const deleteExpense = createDeleteThunk(
  'expenses/deleteExpense',
  async (expenseId) => {
    const response = await fetch(`${API_BASE_URL}/expenses/${expenseId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete expense');
    }
    
    return expenseId;
  },
  {
    successMessage: 'Expense deleted successfully',
    errorMessage: 'Failed to delete expense',
    delay: 500
  }
);

// Add category thunk
export const addCategory = createAsyncThunkWithToast(
  'expenses/addCategory',
  async (categoryName) => {
    return categoryName;
  },
  {
    successMessage: 'Category added successfully',
    errorMessage: 'Failed to add category',
    delay: 500
  }
);

const expensesSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = action.payload;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addExpense.fulfilled, (state, action) => {
        state.expenses.push(action.payload);
      })
      .addCase(updateExpense.fulfilled, (state, action) => {
        const index = state.expenses.findIndex(expense => expense.id === action.payload.id);
        if (index !== -1) {
          state.expenses[index] = action.payload;
        }
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.expenses = state.expenses.filter(expense => expense.id !== action.payload);
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        const categoryName = action.payload;
        // Only add category if it doesn't already exist
        if (!state.categories.includes(categoryName)) {
          state.categories.push(categoryName);
        }
      });
  },
});

export default expensesSlice.reducer;