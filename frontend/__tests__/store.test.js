import { store } from '../src/store';
import { fetchStudents } from '../src/store/studentsSlice';
import { fetchExpenses } from '../src/store/expensesSlice';
import { fetchStaff } from '../src/store/staffSlice';
import { fetchClasses } from '../src/store/classesSlice';

describe('Redux Store', () => {
  test('should create store with initial state', () => {
    const state = store.getState();
    expect(state).toHaveProperty('students');
    expect(state).toHaveProperty('expenses');
    expect(state).toHaveProperty('staff');
    expect(state).toHaveProperty('classes');
  });

  test('should fetch students', async () => {
    await store.dispatch(fetchStudents());
    const state = store.getState();
    expect(state.students.students).toHaveLength(2);
  });

  test('should fetch expenses', async () => {
    await store.dispatch(fetchExpenses());
    const state = store.getState();
    expect(state.expenses.expenses).toHaveLength(3);
  });

  test('should fetch staff', async () => {
    await store.dispatch(fetchStaff());
    const state = store.getState();
    expect(state.staff.staff).toHaveLength(2);
  });

  test('should fetch classes', async () => {
    await store.dispatch(fetchClasses());
    const state = store.getState();
    expect(state.classes.classes).toHaveLength(2);
  });
});