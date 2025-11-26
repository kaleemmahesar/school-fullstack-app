import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import CanteenIncome from './CanteenIncome';
import incomeReducer from '../../store/incomeSlice';

// Create a test store
const createTestStore = (preloadedState) => {
  return configureStore({
    reducer: {
      income: incomeReducer,
    },
    preloadedState,
  });
};

describe('CanteenIncome', () => {
  test('renders canteen income amount correctly', () => {
    const store = createTestStore({
      income: {
        canteenIncome: [
          { id: '1', date: '2023-01-01', amount: 10000, description: 'Test income' }
        ],
        sponsorshipIncome: []
      }
    });

    render(
      <Provider store={store}>
        <CanteenIncome amount={10000} />
      </Provider>
    );

    expect(screen.getByText('Rs 10,000')).toBeInTheDocument();
    expect(screen.getByText('Canteen Income')).toBeInTheDocument();
  });

  test('displays add button when onAddIncome prop is provided', () => {
    const mockAddIncome = jest.fn();
    
    render(
      <CanteenIncome amount={5000} onAddIncome={mockAddIncome} />
    );

    const addButton = screen.getByText('Add');
    expect(addButton).toBeInTheDocument();
    
    fireEvent.click(addButton);
    expect(mockAddIncome).toHaveBeenCalledTimes(1);
  });

  test('does not display add button when onAddIncome prop is not provided', () => {
    render(
      <CanteenIncome amount={5000} />
    );

    expect(screen.queryByText('Add')).not.toBeInTheDocument();
  });
});