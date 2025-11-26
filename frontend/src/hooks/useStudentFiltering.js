import { useMemo } from 'react';

/**
 * Custom hook for memoized student filtering and categorization
 * @param {Array} students - Array of student objects
 * @returns {Object} Memoized filtered and categorized students
 */
export const useStudentFiltering = (students) => {
  return useMemo(() => {
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
  }, [students]);
};

/**
 * Custom hook for filtering students based on search and filter criteria
 * @param {Array} students - Array of student objects
 * @param {string} searchTerm - Search term to filter by
 * @param {string} selectedClass - Selected class to filter by
 * @param {string} selectedSection - Selected section to filter by
 * @returns {Array} Filtered students
 */
export const useFilteredStudents = (students, searchTerm, selectedClass, selectedSection) => {
  return useMemo(() => {
    if (!students || !Array.isArray(students)) {
      return [];
    }

    return students.filter(student => {
      // Search term filter
      const matchesSearch = !searchTerm || 
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.class.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Class filter
      const matchesClass = !selectedClass || student.class === selectedClass;
      
      // Section filter
      const matchesSection = !selectedSection || student.section === selectedSection;
      
      return matchesSearch && matchesClass && matchesSection;
    });
  }, [students, searchTerm, selectedClass, selectedSection]);
};

export default { useStudentFiltering, useFilteredStudents };