import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import AttendanceManagement from './AttendanceManagement';
import StudentReportGenerator from './StudentReportGenerator';
import attendanceReducer from '../../store/attendanceSlice';
import studentsReducer from '../../store/studentsSlice';
import classesReducer from '../../store/classesSlice';
import marksReducer from '../../store/marksSlice';
import reportsReducer from '../../store/reportsSlice';

// Mock the react-router-dom hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({
    pathname: '/students/attendance'
  })
}));

describe('Attendance and Report Synchronization', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        attendance: attendanceReducer,
        students: studentsReducer,
        classes: classesReducer,
        marks: marksReducer,
        reports: reportsReducer
      },
      preloadedState: {
        attendance: {
          attendanceRecords: [
            {
              id: '1',
              date: '2023-06-01',
              classId: 'Class 10',
              records: [
                { studentId: '1', status: 'present' },
                { studentId: '2', status: 'absent' },
                { studentId: '3', status: 'late' },
              ]
            },
            {
              id: '2',
              date: '2023-06-02',
              classId: 'Class 10',
              records: [
                { studentId: '1', status: 'present' },
                { studentId: '2', status: 'present' },
                { studentId: '3', status: 'present' },
              ]
            }
          ],
          loading: false,
          error: null,
          selectedDate: '2023-06-01',
          selectedClass: 'Class 10',
        },
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
            },
            { 
              id: '2', 
              firstName: 'Jane', 
              lastName: 'Smith', 
              class: 'Class 10', 
              section: 'A',
              grNo: 'GR002',
              photo: '/src/assets/student-photos/student2.jpg',
              status: 'passed_out'
            },
            { 
              id: '3', 
              firstName: 'Bob', 
              lastName: 'Johnson', 
              class: 'Class 10', 
              section: 'A',
              grNo: 'GR003',
              photo: '/src/assets/student-photos/student3.jpg',
              status: 'left'
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
        marks: {
          marks: [
            {
              id: '1',
              studentId: '1',
              studentName: 'John Doe',
              class: 'Class 10',
              section: 'A',
              examType: 'Midterm',
              year: '2023',
              marks: [
                { subjectId: '10math', subjectName: 'Mathematics', marksObtained: 85, totalMarks: 100, grade: 'A' },
                { subjectId: '10eng', subjectName: 'English', marksObtained: 78, totalMarks: 100, grade: 'B+' }
              ],
              totalObtained: 163,
              totalMarks: 200,
              percentage: 81.5,
              overallGrade: 'B+'
            }
          ],
          loading: false,
          error: null,
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

  test('attendance data is available in store', () => {
    const state = store.getState();
    expect(state.attendance.attendanceRecords).toHaveLength(2);
    expect(state.attendance.attendanceRecords[0].records).toHaveLength(3);
  });

  test('student data is available in store', () => {
    const state = store.getState();
    expect(state.students.students).toHaveLength(3);
  });

  test('marks data is available in store', () => {
    const state = store.getState();
    expect(state.marks.marks).toHaveLength(1);
  });

  test('reports slice is initialized correctly', () => {
    const state = store.getState();
    expect(state.reports.reports).toHaveLength(0);
    expect(state.reports.currentReport).toBeNull();
  });

  test('attendance management component renders correctly', () => {
    render(
      <Provider store={store}>
        <AttendanceManagement />
      </Provider>
    );

    expect(screen.getByText('Attendance Management')).toBeInTheDocument();
    expect(screen.getByText('Track and manage student attendance')).toBeInTheDocument();
  });

  test('student report generator component renders correctly', () => {
    render(
      <Provider store={store}>
        <StudentReportGenerator />
      </Provider>
    );

    expect(screen.getByText('Student Report Generator')).toBeInTheDocument();
    expect(screen.getByText('Generate comprehensive reports for students and parents')).toBeInTheDocument();
  });
});