import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import StudentReportGenerator from './StudentReportGenerator';
import studentsReducer from '../../store/studentsSlice';
import classesReducer from '../../store/classesSlice';
import reportsReducer from '../../store/reportsSlice';

// Mock the react-router-dom hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

describe('StudentReportGenerator', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        students: studentsReducer,
        classes: classesReducer,
        reports: reportsReducer
      },
      preloadedState: {
        students: {
          students: [
            { 
              id: '1', 
              firstName: 'John', 
              lastName: 'Doe', 
              class: 'Class 10', 
              section: 'A',
              grNo: 'GR001',
              photo: '/src/assets/student-photos/student1.jpg',
              status: 'studying'
            }
          ],
          loading: false,
          error: null
        },
        classes: {
          classes: [
            { id: '1', name: 'Class 10' }
          ],
          loading: false,
          error: null
        },
        reports: {
          reports: [],
          currentReport: null,
          loading: false,
          error: null,
          filters: {
            studentId: '',
            class: '',
            startDate: '',
            endDate: '',
            reportType: 'monthly'
          }
        }
      }
    });
  });

  test('renders student report generator component', () => {
    render(
      <Provider store={store}>
        <StudentReportGenerator />
      </Provider>
    );

    expect(screen.getByText('Student Report Generator')).toBeInTheDocument();
    expect(screen.getByText('Generate comprehensive reports for students and parents')).toBeInTheDocument();
  });

  test('shows report type selection', () => {
    render(
      <Provider store={store}>
        <StudentReportGenerator />
      </Provider>
    );

    expect(screen.getByLabelText('Report Type')).toBeInTheDocument();
    expect(screen.getByText('Monthly')).toBeInTheDocument();
    expect(screen.getByText('Quarterly')).toBeInTheDocument();
    expect(screen.getByText('Yearly')).toBeInTheDocument();
  });

  test('shows date selection fields', () => {
    render(
      <Provider store={store}>
        <StudentReportGenerator />
      </Provider>
    );

    expect(screen.getByLabelText('Start Date')).toBeInTheDocument();
    expect(screen.getByLabelText('End Date')).toBeInTheDocument();
  });

  test('shows class and student selection', () => {
    render(
      <Provider store={store}>
        <StudentReportGenerator />
      </Provider>
    );

    expect(screen.getByLabelText('Class')).toBeInTheDocument();
    expect(screen.getByLabelText('Student')).toBeInTheDocument();
  });

  test('shows generate report button', () => {
    render(
      <Provider store={store}>
        <StudentReportGenerator />
      </Provider>
    );

    expect(screen.getByText('Generate Report')).toBeInTheDocument();
  });
});