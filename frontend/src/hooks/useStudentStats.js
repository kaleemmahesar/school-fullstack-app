import { useMemo } from 'react';

/**
 * Custom hook for calculating memoized student statistics
 * @param {Array} students - Array of student objects
 * @returns {Object} Memoized student statistics
 */
export const useStudentStats = (students) => {
  return useMemo(() => {
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
  }, [students]);
};

export default useStudentStats;