import { configureStore } from '@reduxjs/toolkit';
import studentsReducer from './studentsSlice';
import alumniReducer from './alumniSlice';
import eventsReducer from './eventsSlice';
import notificationsReducer from './notificationsSlice';
import usersReducer from './usersSlice';
import expensesReducer from './expensesSlice';
import staffReducer from './staffSlice';
import classesReducer from './classesSlice';
import marksReducer from './marksSlice';
import settingsReducer from './settingsSlice';
import examsReducer from './examsSlice';
import subsidiesReducer from './subsidiesSlice';
import reportsReducer from './reportsSlice';
import attendanceReducer from './attendanceSlice';
import parentsReducer from './parentsSlice';

export const store = configureStore({
  reducer: {
    students: studentsReducer,
    alumni: alumniReducer,
    events: eventsReducer,
    notifications: notificationsReducer,
    users: usersReducer,
    expenses: expensesReducer,
    staff: staffReducer,
    classes: classesReducer,
    marks: marksReducer,
    settings: settingsReducer,
    exams: examsReducer,
    subsidies: subsidiesReducer,
    reports: reportsReducer,
    attendance: attendanceReducer,
    parents: parentsReducer,
  },
});

export default store;