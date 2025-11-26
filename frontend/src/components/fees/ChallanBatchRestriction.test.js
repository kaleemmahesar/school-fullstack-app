import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import FeesSection from './FeesSection';
import studentsReducer from '../../store/studentsSlice';
import alumniReducer from '../../store/alumniSlice';
import classesReducer from '../../store/classesSlice';
import parentsReducer from '../../store/parentsSlice';

// Mock data for testing
const mockStudents = [
  {
    id: '1',
    firstName: 'Ahmed',
    lastName: 'Khan',
    class: 'Class 5',
    section: 'A',
    academicYear: '2024-2025',
    status: 'studying',
    monthlyFees: 3000,
    feesHistory: []
  }
];

const mockBatches = [
  {
    id: 'batch-2024-2025',
    name: '2024-2025',
    startDate: '2024-02-01',
    endDate: '2025-04-30',
    status: 'active'
  }
];

const mockClasses = [
  {
    id: 'class-5',
    name: 'Class 5',
    monthlyFees: 3000
  }
];

const mockParents = [];

// Create a mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      students: studentsReducer,
      alumni: alumniReducer,
      classes: classesReducer,
      parents: parentsReducer
    },
    preloadedState: {
      students: {
        students: mockStudents,
        loading: false,
        error: null
      },
      alumni: {
        batches: mockBatches,
        loading: false,
        error: null
      },
      classes: {
        classes: mockClasses,
        loading: false,
        error: null
      },
      parents: {
        parents: mockParents,
        loading: false,
        error: null
      }
    }
  });
};

describe('Challan Batch Restriction', () => {
  test('allows generating challan for month within batch period', async () => {
    const store = createMockStore();
    
    render(
      <Provider store={store}>
        <FeesSection />
      </Provider>
    );
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Fees Management')).toBeInTheDocument();
    });
    
    // Click generate challan button
    const generateButton = screen.getByText('Generate Challan');
    fireEvent.click(generateButton);
    
    // Wait for modal to appear
    await waitFor(() => {
      expect(screen.getByText('Generate New Challan')).toBeInTheDocument();
    });
    
    // Select student
    const studentSelect = screen.getByRole('combobox');
    fireEvent.change(studentSelect, { target: { value: '1' } });
    
    // Select a month within the batch period (March 2024)
    const monthInput = screen.getByLabelText('Month');
    fireEvent.change(monthInput, { target: { value: '2024-03' } });
    
    // Check that the submit button is enabled
    const submitButton = screen.getByText('Generate Challan');
    expect(submitButton).not.toBeDisabled();
  });

  test('shows warning for month outside batch period', async () => {
    const store = createMockStore();
    
    render(
      <Provider store={store}>
        <FeesSection />
      </Provider>
    );
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Fees Management')).toBeInTheDocument();
    });
    
    // Click generate challan button
    const generateButton = screen.getByText('Generate Challan');
    fireEvent.click(generateButton);
    
    // Wait for modal to appear
    await waitFor(() => {
      expect(screen.getByText('Generate New Challan')).toBeInTheDocument();
    });
    
    // Select student
    const studentSelect = screen.getByRole('combobox');
    fireEvent.change(studentSelect, { target: { value: '1' } });
    
    // Select a month outside the batch period (January 2024)
    const monthInput = screen.getByLabelText('Month');
    fireEvent.change(monthInput, { target: { value: '2024-01' } });
    
    // Check that warning message is displayed
    await waitFor(() => {
      expect(screen.getByText(/Warning: Selected month is outside the student's batch period/)).toBeInTheDocument();
    });
  });
});