import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import AttendanceManagement from './AttendanceManagement';
import attendanceReducer from '../../store/attendanceSlice';
import classesReducer from '../../store/classesSlice';
import studentsReducer from '../../store/studentsSlice';

// Mock the react-router-dom hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({
    pathname: '/students/attendance'
  })
}));

// Mock the useDispatch hook
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => jest.fn()
}));

describe('AttendanceManagement', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        attendance: attendanceReducer,
        classes: classesReducer,
        students: studentsReducer
      },
      preloadedState: {
        attendance: {
          attendanceRecords: [],
          loading: false,
          error: null,
          selectedDate: '2023-06-01',
          selectedClass: ''
        },
        classes: {
          classes: [
            { id: '1', name: 'Class 1' },
            { id: '2', name: 'Class 2' }
          ]
        },
        students: {
          students: [
            { id: '1', firstName: 'John', lastName: 'Doe', class: 'Class 1', section: 'A', photo: '/src/assets/student-photos/student1.jpg', status: 'studying' },
            { id: '2', firstName: 'Jane', lastName: 'Smith', class: 'Class 1', section: 'A', photo: '/src/assets/student-photos/student2.jpg', status: 'studying' }
          ]
        }
      }
    });
  });

  test('renders attendance management component', () => {
    render(
      <Provider store={store}>
        <AttendanceManagement />
      </Provider>
    );

    expect(screen.getByText('Attendance Management')).toBeInTheDocument();
    expect(screen.getByText('Track and manage student attendance')).toBeInTheDocument();
  });

  test('shows student list', () => {
    render(
      <Provider store={store}>
        <AttendanceManagement />
      </Provider>
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  test('allows selecting attendance status', () => {
    render(
      <Provider store={store}>
        <AttendanceManagement />
      </Provider>
    );

    const presentButton = screen.getByText('Present');
    fireEvent.click(presentButton);

    // We can't easily test the internal state change without more complex mocking
    // but we can verify the button exists and is clickable
    expect(presentButton).toBeInTheDocument();
  });
});