import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import studentsReducer from '../store/studentsSlice';
import classesReducer from '../store/classesSlice';
import marksReducer from '../store/marksSlice';
import attendanceReducer from '../store/attendanceSlice';
import reportsReducer from '../store/reportsSlice';

describe('Data Synchronization', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        students: studentsReducer,
        classes: classesReducer,
        marks: marksReducer,
        attendance: attendanceReducer,
        reports: reportsReducer
      }
    });
  });

  test('all slices are properly initialized', () => {
    const state = store.getState();
    
    // Check students slice
    expect(state.students).toBeDefined();
    expect(Array.isArray(state.students.students)).toBe(true);
    expect(state.students.students.length).toBeGreaterThan(0);
    
    // Check classes slice
    expect(state.classes).toBeDefined();
    expect(Array.isArray(state.classes.classes)).toBe(true);
    expect(state.classes.classes.length).toBeGreaterThan(0);
    
    // Check marks slice
    expect(state.marks).toBeDefined();
    expect(Array.isArray(state.marks.marks)).toBe(true);
    expect(state.marks.marks.length).toBeGreaterThan(0);
    
    // Check attendance slice
    expect(state.attendance).toBeDefined();
    expect(Array.isArray(state.attendance.attendanceRecords)).toBe(true);
    
    // Check reports slice
    expect(state.reports).toBeDefined();
    expect(Array.isArray(state.reports.reports)).toBe(true);
  });

  test('student data is consistent', () => {
    const state = store.getState();
    const students = state.students.students;
    
    // Check that all students have required fields
    students.forEach(student => {
      expect(student.id).toBeDefined();
      expect(student.firstName).toBeDefined();
      expect(student.lastName).toBeDefined();
      expect(student.class).toBeDefined();
      expect(student.section).toBeDefined();
      expect(student.grNo).toBeDefined();
    });
  });

  test('attendance data references valid students', () => {
    const state = store.getState();
    const attendanceRecords = state.attendance.attendanceRecords;
    const students = state.students.students;
    
    // Create a set of valid student IDs for quick lookup
    const studentIds = new Set(students.map(student => student.id));
    
    // Check that all attendance records reference valid students
    attendanceRecords.forEach(record => {
      record.records.forEach(attendance => {
        expect(studentIds.has(attendance.studentId)).toBe(true);
      });
    });
  });

  test('marks data references valid students', () => {
    const state = store.getState();
    const marks = state.marks.marks;
    const students = state.students.students;
    
    // Create a set of valid student IDs for quick lookup
    const studentIds = new Set(students.map(student => student.id));
    
    // Check that all marks reference valid students
    marks.forEach(mark => {
      expect(studentIds.has(mark.studentId)).toBe(true);
    });
  });

  test('class data is consistent', () => {
    const state = store.getState();
    const classes = state.classes.classes;
    
    // Check that all classes have required fields
    classes.forEach(cls => {
      expect(cls.id).toBeDefined();
      expect(cls.name).toBeDefined();
      expect(cls.monthlyFees).toBeDefined();
      expect(Array.isArray(cls.subjects)).toBe(true);
      expect(Array.isArray(cls.sections)).toBe(true);
    });
  });

  test('student-class relationship is consistent', () => {
    const state = store.getState();
    const students = state.students.students;
    const classes = state.classes.classes;
    
    // Create a set of valid class names for quick lookup
    const classNames = new Set(classes.map(cls => cls.name));
    
    // Check that all students belong to valid classes
    students.forEach(student => {
      expect(classNames.has(student.class)).toBe(true);
    });
  });
});