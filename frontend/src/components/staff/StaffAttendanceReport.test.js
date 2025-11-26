import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import StaffAttendanceReport from './StaffAttendanceReport';
import staffReducer from '../../store/staffSlice';

// Mock the react-router-dom hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Mock the staffAttendanceApi
jest.mock('../../utils/staffAttendanceApi', () => ({
  getStaffAttendanceByDateRange: jest.fn().mockResolvedValue([
    { date: '2025-10-01', status: 'present' },
    { date: '2025-10-02', status: 'absent' },
  ]),
}));

describe('StaffAttendanceReport', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        staff: staffReducer,
      },
      preloadedState: {
        staff: {
          staff: [
            {
              id: '1',
              firstName: 'Ahmed',
              lastName: 'Khan',
              department: 'Teaching',
              position: 'Math Teacher',
              attendance: [],
              salaryHistory: [],
            },
          ],
          loading: false,
          error: null,
        },
      },
    });
  });

  test('renders staff attendance report component', () => {
    render(
      <Provider store={store}>
        <StaffAttendanceReport />
      </Provider>
    );

    expect(screen.getByText('Staff Attendance Report')).toBeInTheDocument();
    expect(screen.getByText('Generate comprehensive attendance reports for staff members')).toBeInTheDocument();
  });

  test('displays report filters', () => {
    render(
      <Provider store={store}>
        <StaffAttendanceReport />
      </Provider>
    );

    expect(screen.getByText('Report Type')).toBeInTheDocument();
    expect(screen.getByText('Start Date')).toBeInTheDocument();
    expect(screen.getByText('End Date')).toBeInTheDocument();
    expect(screen.getByText('Department')).toBeInTheDocument();
    expect(screen.getByText('Staff Member')).toBeInTheDocument();
  });

  test('shows attendance summary in report', async () => {
    render(
      <Provider store={store}>
        <StaffAttendanceReport />
      </Provider>
    );

    // Select a staff member
    const staffDropdown = screen.getByText('Select Staff Member');
    fireEvent.click(staffDropdown);

    // Select the first staff member
    const staffOption = screen.getByText('Ahmed Khan');
    fireEvent.click(staffOption);

    // Click generate report
    const generateButton = screen.getByText('Generate Report');
    fireEvent.click(generateButton);

    // Wait for report to be generated
    await screen.findByText('Attendance Summary');

    expect(screen.getByText('Attendance Summary')).toBeInTheDocument();
    expect(screen.getByText('Present')).toBeInTheDocument();
    expect(screen.getByText('Absent')).toBeInTheDocument();
    expect(screen.getByText('Late')).toBeInTheDocument();
    expect(screen.getByText('Leave')).toBeInTheDocument();
  });
});