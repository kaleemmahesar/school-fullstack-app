// Utility functions for alumni and batch management

import { API_BASE_URL } from './apiConfig';

/**
 * Create a new batch
 * @param {Object} batchData - Batch information
 * @returns {Promise<Object>} Created batch
 */
export const createBatch = async (batchData) => {
  try {
    const newBatch = {
      id: Date.now().toString(),
      ...batchData,
      // Add timestamp for when batch was created
      createdTimestamp: new Date().toISOString()
    };
    
    const response = await fetch(`${API_BASE_URL}/batches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newBatch),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create batch');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating batch:', error);
    throw error;
  }
};

/**
 * Get all batches
 * @returns {Promise<Array>} Array of batches
 */
export const getAllBatches = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/batches`);
    if (!response.ok) {
      throw new Error('Failed to fetch batches');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching batches:', error);
    throw error;
  }
};

/**
 * Get batch by ID
 * @param {string} batchId - Batch ID
 * @returns {Promise<Object>} Batch data
 */
export const getBatchById = async (batchId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/batches/${batchId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch batch');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching batch:', error);
    throw error;
  }
};

/**
 * Update batch
 * @param {Object} batchData - Updated batch data
 * @returns {Promise<Object>} Updated batch
 */
export const updateBatch = async (batchData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/batches/${batchData.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(batchData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update batch');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating batch:', error);
    throw error;
  }
};

/**
 * Delete batch
 * @param {string} batchId - Batch ID
 * @returns {Promise<void>}
 */
export const deleteBatch = async (batchId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/batches/${batchId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete batch');
    }
  } catch (error) {
    console.error('Error deleting batch:', error);
    throw error;
  }
};

/**
 * Add student to alumni
 * @param {Object} studentData - Student data to convert to alumni
 * @returns {Promise<Object>} Created alumni record
 */
export const addStudentToAlumni = async (studentData) => {
  try {
    // Create alumni record from student data
    const alumniData = {
      id: `alumni-${studentData.id}`,
      studentId: studentData.id,
      firstName: studentData.firstName,
      lastName: studentData.lastName,
      fatherName: studentData.fatherName,
      dateOfBirth: studentData.dateOfBirth,
      dateOfAdmission: studentData.dateOfAdmission,
      dateOfLeaving: studentData.dateOfLeaving || new Date().toISOString().split('T')[0],
      classAdmitted: studentData.class,
      classLeft: studentData.classInWhichLeft,
      reasonOfLeaving: studentData.reasonOfLeaving,
      remarks: studentData.remarks,
      academicYear: studentData.academicYear,
      grNo: studentData.grNo,
      photo: studentData.photo,
      // Add timestamp for when alumni record was created
      addedTimestamp: new Date().toISOString()
    };
    
    const response = await fetch(`${API_BASE_URL}/alumni`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(alumniData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add student to alumni');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error adding student to alumni:', error);
    throw error;
  }
};

/**
 * Get all alumni
 * @returns {Promise<Array>} Array of alumni
 */
export const getAllAlumni = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/alumni`);
    if (!response.ok) {
      throw new Error('Failed to fetch alumni');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching alumni:', error);
    throw error;
  }
};

/**
 * Get alumni by ID
 * @param {string} alumniId - Alumni ID
 * @returns {Promise<Object>} Alumni data
 */
export const getAlumniById = async (alumniId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/alumni/${alumniId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch alumni');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching alumni:', error);
    throw error;
  }
};

/**
 * Update alumni record
 * @param {Object} alumniData - Updated alumni data
 * @returns {Promise<Object>} Updated alumni record
 */
export const updateAlumni = async (alumniData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/alumni/${alumniData.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(alumniData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update alumni');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating alumni:', error);
    throw error;
  }
};

/**
 * Delete alumni record
 * @param {string} alumniId - Alumni ID
 * @returns {Promise<void>}
 */
export const deleteAlumni = async (alumniId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/alumni/${alumniId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete alumni');
    }
  } catch (error) {
    console.error('Error deleting alumni:', error);
    throw error;
  }
};

/**
 * Get alumni by batch
 * @param {string} batchId - Batch ID
 * @returns {Promise<Array>} Array of alumni in the batch
 */
export const getAlumniByBatch = async (batchId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/alumni?batchId=${batchId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch alumni by batch');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching alumni by batch:', error);
    throw error;
  }
};

/**
 * Get batch statistics
 * @param {string} batchId - Batch ID
 * @returns {Promise<Object>} Batch statistics
 */
export const getBatchStatistics = async (batchId) => {
  try {
    const alumni = await getAlumniByBatch(batchId);
    
    // Calculate statistics
    const totalAlumni = alumni.length;
    const employedAlumni = alumni.filter(a => a.currentStatus === 'employed').length;
    const higherEducationAlumni = alumni.filter(a => a.currentStatus === 'higher_education').length;
    const entrepreneurshipAlumni = alumni.filter(a => a.currentStatus === 'entrepreneurship').length;
    
    return {
      totalAlumni,
      employedAlumni,
      higherEducationAlumni,
      entrepreneurshipAlumni,
      employmentRate: totalAlumni > 0 ? Math.round((employedAlumni / totalAlumni) * 100) : 0
    };
  } catch (error) {
    console.error('Error calculating batch statistics:', error);
    throw error;
  }
};

export default {
  createBatch,
  getAllBatches,
  getBatchById,
  updateBatch,
  deleteBatch,
  addStudentToAlumni,
  getAllAlumni,
  getAlumniById,
  updateAlumni,
  deleteAlumni,
  getAlumniByBatch,
  getBatchStatistics
};