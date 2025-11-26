import { createSelector } from '@reduxjs/toolkit';

// Basic selectors
const selectStudentsState = (state) => state.students;

export const selectAllStudents = createSelector(
  [selectStudentsState],
  (studentsState) => studentsState.students
);

export const selectStudentsLoading = createSelector(
  [selectStudentsState],
  (studentsState) => studentsState.loading
);

export const selectStudentsError = createSelector(
  [selectStudentsState],
  (studentsState) => studentsState.error
);

// Memoized student statistics selectors
export const selectStudentStats = createSelector(
  [selectAllStudents],
  (students) => {
    if (!students || !Array.isArray(students)) {
      return {
        totalStudents: 0,
        available: 0,
        unavailable: 0,
        left: 0,
        families: 0,
        feesCollected: 0,
        pendingFees: 0
      };
    }

    // Total students
    const totalStudents = students.length;

    // Available students (studying - all fees paid)
    const available = students.filter(student => {
      // Check if monthly challans have been generated
      const hasMonthlyChallans = student.feesHistory && student.feesHistory.some(challan => challan.type === 'monthly');
      const totalFees = parseFloat(student.totalFees) || 0;
      const feesPaid = parseFloat(student.feesPaid) || 0;
      
      // If no monthly challans have been generated, consider fees as paid
      if (!hasMonthlyChallans) {
        return true;
      }
      
      // If challans exist, check if all fees have been paid
      return feesPaid >= totalFees;
    });

    // Unavailable students (studying - pending fees)
    const unavailable = students.filter(student => {
      // Check if monthly challans have been generated
      const hasMonthlyChallans = student.feesHistory && student.feesHistory.some(challan => challan.type === 'monthly');
      const totalFees = parseFloat(student.totalFees) || 0;
      const feesPaid = parseFloat(student.feesPaid) || 0;
      
      // Students who are not left
      const isLeft = student.status === 'left' || student.status === 'passed_out' || 
                    (student.class && student.class.includes('Passed'));
      
      // If no monthly challans have been generated, don't mark as unavailable
      if (!hasMonthlyChallans) {
        return false;
      }
      
      // If challans exist, check if fees are pending
      return !isLeft && feesPaid < totalFees;
    });

    // Left students (passed out or left school)
    const left = students.filter(student => {
      const isLeft = student.status === 'left' || student.status === 'passed_out' || 
                    (student.class && student.class.includes('Passed')) || 
                    (student.graduationDate && new Date(student.graduationDate) < new Date());
      return isLeft;
    });

    // Family groups
    const familyGroups = {};
    students.forEach(student => {
      const familyId = student.familyId || `unknown-${student.id}`;
      if (!familyGroups[familyId]) {
        familyGroups[familyId] = [];
      }
      familyGroups[familyId].push(student);
    });
    const familyCount = Object.keys(familyGroups).length;

    // Fees statistics
    const feesCollected = students.reduce((sum, student) => sum + (parseFloat(student.feesPaid) || 0), 0);
    const pendingFees = students.reduce((sum, student) => {
      const totalFees = parseFloat(student.totalFees) || 0;
      const feesPaid = parseFloat(student.feesPaid) || 0;
      return sum + Math.max(0, totalFees - feesPaid);
    }, 0);

    return {
      totalStudents,
      available: available.length,
      unavailable: unavailable.length,
      left: left.length,
      families: familyCount,
      feesCollected,
      pendingFees
    };
  }
);

// Memoized student categorization selectors
export const selectCategorizedStudents = createSelector(
  [selectAllStudents],
  (students) => {
    if (!students || !Array.isArray(students)) {
      return {
        available: [],
        unavailable: [],
        left: [],
        byClass: {},
        byFamily: {}
      };
    }

    // Categorize students based on status only
    const categorized = students.reduce((acc, student) => {
      // Check if student is "left"
      const isLeft = student.status === 'left' || student.status === 'passed_out' || 
                    (student.class && student.class.includes('Passed')) || 
                    (student.graduationDate && new Date(student.graduationDate) < new Date());
      
      if (isLeft) {
        acc.left.push(student);
      } else {
        // All students who are not left/passed out are available
        acc.available.push(student);
      }
      
      return acc;
    }, { available: [], unavailable: [], left: [] });

    // Group by class
    const byClass = students.reduce((acc, student) => {
      if (!acc[student.class]) {
        acc[student.class] = [];
      }
      acc[student.class].push(student);
      return acc;
    }, {});

    // Group by family
    const byFamily = students.reduce((acc, student) => {
      const familyId = student.familyId || `unknown-${student.id}`;
      if (!acc[familyId]) {
        acc[familyId] = [];
      }
      acc[familyId].push(student);
      return acc;
    }, {});

    return {
      ...categorized,
      byClass,
      byFamily
    };
  }
);

// Select student by ID
export const selectStudentById = createSelector(
  [selectAllStudents, (state, studentId) => studentId],
  (students, studentId) => {
    if (!students || !Array.isArray(students) || !studentId) {
      return null;
    }
    return students.find(student => student.id === studentId) || null;
  }
);

// Select students by class
export const selectStudentsByClass = createSelector(
  [selectCategorizedStudents, (state, className) => className],
  (categorizedStudents, className) => {
    if (!className) {
      return [];
    }
    return categorizedStudents.byClass[className] || [];
  }
);

// Select students by family
export const selectStudentsByFamily = createSelector(
  [selectCategorizedStudents, (state, familyId) => familyId],
  (categorizedStudents, familyId) => {
    if (!familyId) {
      return [];
    }
    return categorizedStudents.byFamily[familyId] || [];
  }
);

// Select available students
export const selectAvailableStudents = createSelector(
  [selectCategorizedStudents],
  (categorizedStudents) => categorizedStudents.available
);

// Select unavailable students
export const selectUnavailableStudents = createSelector(
  [selectCategorizedStudents],
  (categorizedStudents) => categorizedStudents.unavailable
);

// Select left students
export const selectLeftStudents = createSelector(
  [selectCategorizedStudents],
  (categorizedStudents) => categorizedStudents.left
);