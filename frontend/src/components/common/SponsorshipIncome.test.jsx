import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SponsorshipIncome from './SponsorshipIncome';

describe('SponsorshipIncome', () => {
  test('renders sponsorship income amount correctly', () => {
    render(
      <SponsorshipIncome amount={25000} />
    );

    expect(screen.getByText('Rs 25,000')).toBeInTheDocument();
    expect(screen.getByText('Sponsorship Income')).toBeInTheDocument();
  });

  test('displays add button when onAddIncome prop is provided', () => {
    const mockAddIncome = jest.fn();
    
    render(
      <SponsorshipIncome amount={15000} onAddIncome={mockAddIncome} />
    );

    const addButton = screen.getByText('Add');
    expect(addButton).toBeInTheDocument();
    
    fireEvent.click(addButton);
    expect(mockAddIncome).toHaveBeenCalledTimes(1);
  });

  test('does not display add button when onAddIncome prop is not provided', () => {
    render(
      <SponsorshipIncome amount={15000} />
    );

    expect(screen.queryByText('Add')).not.toBeInTheDocument();
  });
});