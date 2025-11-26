import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import FinancialReporting from './FinancialReporting';

// Create a mock store with initial state
const createMockStore = () => {
  return configureStore({
    reducer: {
      students: () => ({ students: [] }),
      subsidies: () => ({ subsidies: [] }),
      expenses: () => ({ expenses: [] }),
      staff: () => ({ staff: [] }),
      income: () => ({ 
        canteenIncome: [], 
        sponsorshipIncome: [] 
      }),
      users: () => ({ currentUser: null }),
      settings: () => ({ schoolInfo: { fundingType: 'traditional' } })
    }
  });
};

// Mock the useSchoolFunding hook
jest.mock('../hooks/useSchoolFunding', () => ({
  useSchoolFunding: () => ({
    isNGOSchool: false,
    isTraditionalSchool: true
  })
}));

describe('FinancialReporting', () => {
  test('renders financial reporting component with all required elements', () => {
    const store = createMockStore();
    
    render(
      <Provider store={store}>
        <FinancialReporting />
      </Provider>
    );
    
    // Check that the main title is rendered
    expect(screen.getByText('Financial Reporting')).toBeInTheDocument();
    
    // Check that report period selection is rendered
    expect(screen.getByText('Report Period')).toBeInTheDocument();
    
    // Check that income entry fields are visible using role-based queries
    expect(screen.getByRole('heading', { name: 'Canteen Income' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Sponsorship Income' })).toBeInTheDocument();
    
    // Check that the main cards are rendered
    expect(screen.getByRole('heading', { name: 'Total Income' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Total Expenses' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Net Balance' })).toBeInTheDocument();
    
    // Check that action buttons are rendered
    expect(screen.getByRole('button', { name: /Update Report/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Clear Filters/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Export CSV/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Print Report/i })).toBeInTheDocument();
  });
});