import { createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { API_BASE_URL } from './apiConfig';

/**
 * Create an async thunk with consistent error handling and toast notifications
 * @param {string} typePrefix - The type prefix for the thunk
 * @param {Function} payloadCreator - The payload creator function
 * @param {Object} options - Options for the thunk
 * @param {string} options.successMessage - Message to show on success
 * @param {string} options.errorMessage - Message to show on error
 * @param {number} options.delay - Delay in ms before resolving (for simulation)
 * @returns {Function} The created async thunk
 */
export const createAsyncThunkWithToast = (
  typePrefix, 
  payloadCreator, 
  { successMessage, errorMessage, delay = 500 } = {}
) => {
  return createAsyncThunk(typePrefix, async (arg, thunkAPI) => {
    try {
      // Simulate API delay if specified
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      // Execute the payload creator with both arg and thunkAPI
      const result = await payloadCreator(arg, thunkAPI);
      
      // Show success message if provided
      if (successMessage) {
        toast.success(successMessage);
      }
      
      return result;
    } catch (error) {
      // Show error message if provided
      if (errorMessage) {
        toast.error(errorMessage);
      }
      
      // Return the error for rejection
      return thunkAPI.rejectWithValue(error.message || error);
    }
  });
};

/**
 * Create a standard CRUD thunk for adding an item
 * @param {string} typePrefix - The type prefix for the thunk
 * @param {Function} createFunction - Function to create the item
 * @param {Object} options - Options for the thunk
 * @returns {Function} The created async thunk
 */
export const createAddThunk = (typePrefix, createFunction, options = {}) => {
  const defaultOptions = {
    successMessage: 'Item added successfully',
    errorMessage: 'Failed to add item',
    delay: 500
  };
  
  const finalOptions = { ...defaultOptions, ...options };
  
  return createAsyncThunkWithToast(
    typePrefix,
    async (itemData) => {
      const newItem = {
        id: Date.now().toString(),
        ...itemData,
      };
      return await createFunction(newItem);
    },
    finalOptions
  );
};

/**
 * Create a standard CRUD thunk for updating an item
 * @param {string} typePrefix - The type prefix for the thunk
 * @param {Function} updateFunction - Function to update the item
 * @param {Object} options - Options for the thunk
 * @returns {Function} The created async thunk
 */
export const createUpdateThunk = (typePrefix, updateFunction, options = {}) => {
  const defaultOptions = {
    successMessage: 'Item updated successfully',
    errorMessage: 'Failed to update item',
    delay: 500
  };
  
  const finalOptions = { ...defaultOptions, ...options };
  
  return createAsyncThunkWithToast(
    typePrefix,
    async (itemData) => {
      return await updateFunction(itemData);
    },
    finalOptions
  );
};

/**
 * Create a standard CRUD thunk for deleting an item
 * @param {string} typePrefix - The type prefix for the thunk
 * @param {Function} deleteFunction - Function to delete the item
 * @param {Object} options - Options for the thunk
 * @returns {Function} The created async thunk
 */
export const createDeleteThunk = (typePrefix, deleteFunction, options = {}) => {
  const defaultOptions = {
    successMessage: 'Item deleted successfully',
    errorMessage: 'Failed to delete item',
    delay: 500
  };
  
  const finalOptions = { ...defaultOptions, ...options };
  
  return createAsyncThunkWithToast(
    typePrefix,
    async (itemId) => {
      return await deleteFunction(itemId);
    },
    finalOptions
  );
};

export default {
  createAsyncThunkWithToast,
  createAddThunk,
  createUpdateThunk,
  createDeleteThunk,
  API_BASE_URL
};