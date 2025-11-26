import { createSlice } from '@reduxjs/toolkit';

/**
 * Mock data for parents
 */
const mockParents = [
  {
    id: 'parent-1',
    firstName: 'Muhammad',
    lastName: 'Khan',
    email: 'muhammad.khan@email.com',
    phone: '+923001234567',
    address: '123 Main Street, Karachi, Sindh',
    relationship: 'father',
    studentIds: ['1', '2'] // Links to students in the family
  },
  {
    id: 'parent-2',
    firstName: 'Usman',
    lastName: 'Malik',
    email: 'usman.malik@email.com',
    phone: '+923002345678',
    address: '789 Pine Road, Islamabad, Capital',
    relationship: 'father',
    studentIds: ['3'] // Links to students in the family
  },
  {
    id: 'parent-3',
    firstName: 'Tariq',
    lastName: 'Javed',
    email: 'tariq.javed@email.com',
    phone: '+923003456789',
    address: '321 Elm Street, Lahore, Punjab',
    relationship: 'father',
    studentIds: ['4'] // Links to students in the family
  },
  {
    id: 'parent-4',
    firstName: 'Hamid',
    lastName: 'Raza',
    email: 'hamid.raza@email.com',
    phone: '+923004567890',
    address: '654 Maple Avenue, Karachi, Sindh',
    relationship: 'father',
    studentIds: ['5'] // Links to students in the family
  },
  {
    id: 'parent-5',
    firstName: 'Asif',
    lastName: 'Hussain',
    email: 'asif.hussain@email.com',
    phone: '+923005678901',
    address: '987 Oak Road, Islamabad, Capital',
    relationship: 'father',
    studentIds: ['6'] // Links to students in the family
  },
  {
    id: 'parent-6',
    firstName: 'Irfan',
    lastName: 'Qureshi',
    email: 'irfan.qureshi@email.com',
    phone: '+923006789012',
    address: '147 Pine Street, Lahore, Punjab',
    relationship: 'father',
    studentIds: ['7'] // Links to students in the family
  },
  {
    id: 'parent-7',
    firstName: 'Farooq',
    lastName: 'Sheikh',
    email: 'farooq.sheikh@email.com',
    phone: '+923007890123',
    address: '258 Cedar Road, Karachi, Sindh',
    relationship: 'father',
    studentIds: ['8'] // Links to students in the family
  }
];

/**
 * Initial state for the parents slice
 */
const initialState = {
  parents: mockParents,
  loading: false,
  error: null,
};

/**
 * Redux slice for managing parents state
 */
const parentsSlice = createSlice({
  name: 'parents',
  initialState,
  reducers: {
    addParent: (state, action) => {
      state.parents.push(action.payload);
    },
    updateParent: (state, action) => {
      const index = state.parents.findIndex(parent => parent.id === action.payload.id);
      if (index !== -1) {
        state.parents[index] = action.payload;
      }
    },
    deleteParent: (state, action) => {
      state.parents = state.parents.filter(parent => parent.id !== action.payload);
    }
  },
});

export const { addParent, updateParent, deleteParent } = parentsSlice.actions;
export default parentsSlice.reducer;