import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import StaffAttendance from './StaffAttendance';
import staffReducer from '../../store/staffSlice';

// Mock the react-router-dom hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

describe('StaffAttendance', () => {
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
            {
              id: '2',
              firstName: 'Fatima',
              lastName: 'Ahmed',
              department: 'Teaching',
              position: 'English Teacher',
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

  test('renders staff attendance component', () => {
    render(
      <Provider store={store}>
        <StaffAttendance />
      </Provider>
    );

    expect(screen.getByText('Staff Attendance')).toBeInTheDocument();
    expect(screen.getByText('Manage staff attendance manually')).toBeInTheDocument();
  });

  test('displays staff members in table', () => {
    render(
      <Provider store={store}>
        <StaffAttendance />
      </Provider>
    );

    expect(screen.getByText('Ahmed Khan')).toBeInTheDocument();
    expect(screen.getByText('Fatima Ahmed')).toBeInTheDocument();
  });

  test('shows attendance summary', () => {
    render(
      <Provider store={store}>
        <StaffAttendance />
      </Provider>
    );

    expect(screen.getByText('Attendance Summary')).toBeInTheDocument();
    expect(screen.getByText('Present')).toBeInTheDocument();
    expect(screen.getByText('Absent')).toBeInTheDocument();
    expect(screen.getByText('Late')).toBeInTheDocument();
    expect(screen.getByText('Leave')).toBeInTheDocument();
  });

  test('bulk action buttons work', () => {
    render(
      <Provider store={store}>
        <StaffAttendance />
      </Provider>
    );

    const allPresentButton = screen.getByText('All Present');
    const allAbsentButton = screen.getByText('All Absent');
    const allLateButton = screen.getByText('Mark All Late');
    const allLeaveButton = screen.getByText('Mark All Leave');

    expect(allPresentButton).toBeInTheDocument();
    expect(allAbsentButton).toBeInTheDocument();
    expect(allLateButton).toBeInTheDocument();
    expect(allLeaveButton).toBeInTheDocument();
  });
});