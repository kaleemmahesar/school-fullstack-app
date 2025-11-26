// Utility functions for student promotion logic

import { API_BASE_URL } from './apiConfig';

/**
 * Promote students to the next class
 * @param {Array} studentIds - Array of student IDs to promote
 * @param {string} currentClass - Current class of students
 * @param {string} academicYear - Academic year of promotion
 * @returns {Promise<Array>} Updated students
 */
export const promoteStudentsToNextClass = async (studentIds, currentClass, academicYear) => {
  try {
    const updatedStudents = [];
    
    // Get next class based on current class
    const nextClass = getNextClass(currentClass);
    
    if (!nextClass) {
      throw new Error(`Cannot determine next class for ${currentClass}`);
    }
    
    // Update each student
    for (const studentId of studentIds) {
      // Get current student data
      const studentResponse = await fetch(`${API_BASE_URL}/students/${studentId}`);
      if (!studentResponse.ok) {
        throw new Error(`Failed to fetch student ${studentId}`);
      }
      
      const student = await studentResponse.json();
      
      // Update student class and academic year
      const updatedStudent = {
        ...student,
        class: nextClass,
        academicYear: academicYear
      };
      
      // Update student in database
      const updateResponse = await fetch(`${API_BASE_URL}/students/${studentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedStudent),
      });
      
      if (!updateResponse.ok) {
        throw new Error(`Failed to update student ${studentId}`);
      }
      
      updatedStudents.push(await updateResponse.json());
    }
    
    return updatedStudents;
  } catch (error) {
    console.error('Error promoting students:', error);
    throw error;
  }
};

/**
 * Graduate students (mark as left)
 * @param {Array} studentIds - Array of student IDs to graduate
 * @param {string} currentClass - Current class of students
 * @param {string} academicYear - Academic year of graduation
 * @returns {Promise<Array>} Updated students
 */
export const graduateStudents = async (studentIds, currentClass, academicYear) => {
  try {
    const updatedStudents = [];
    
    // Update each student
    for (const studentId of studentIds) {
      // Get current student data
      const studentResponse = await fetch(`${API_BASE_URL}/students/${studentId}`);
      if (!studentResponse.ok) {
        throw new Error(`Failed to fetch student ${studentId}`);
      }
      
      const student = await studentResponse.json();
      
      // Mark student as left
      const updatedStudent = {
        ...student,
        status: 'left',
        dateOfLeaving: new Date().toISOString().split('T')[0],
        classInWhichLeft: currentClass,
        reasonOfLeaving: 'Graduated',
        academicYear: academicYear
      };
      
      // Update student in database
      const updateResponse = await fetch(`${API_BASE_URL}/students/${studentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedStudent),
      });
      
      if (!updateResponse.ok) {
        throw new Error(`Failed to update student ${studentId}`);
      }
      
      updatedStudents.push(await updateResponse.json());
    }
    
    return updatedStudents;
  } catch (error) {
    console.error('Error graduating students:', error);
    throw error;
  }
};

/**
 * Get next class based on current class
 * @param {string} currentClass - Current class name
 * @returns {string|null} Next class name or null if cannot determine
 */
const getNextClass = (currentClass) => {
  // Extract class number from class name (e.g., "Class 10" -> 10)
  const classNumberMatch = currentClass.match(/Class\s+(\d+)/i);
  
  if (!classNumberMatch) {
    return null;
  }
  
  const currentNumber = parseInt(classNumberMatch[1]);
  
  // Handle special cases
  if (currentNumber >= 12) {
    // Classes above 12 don't have a next class
    return null;
  }
  
  // Return next class
  return `Class ${currentNumber + 1}`;
};

/**
 * Get promotion details for a class
 * @param {string} className - Class name
 * @returns {Object} Promotion details
 */
export const getPromotionDetails = (className) => {
  const nextClass = getNextClass(className);
  
  return {
    currentClass: className,
    nextClass: nextClass,
    canGraduate: !nextClass, // If there's no next class, student can graduate
    promotionType: nextClass ? 'promotion' : 'graduation'
  };
};

export default {
  promoteStudentsToNextClass,
  graduateStudents,
  getPromotionDetails
};