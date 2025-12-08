import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { createAsyncThunkWithToast } from '../utils/asyncThunkUtils';
import { API_BASE_URL } from '../utils/apiConfig';

// Initial state with empty marks array
const initialState = {
  marks: [],
  loading: false,
  error: null,
};

// Async thunk to fetch marks from the server
export const fetchMarks = createAsyncThunkWithToast(
  'marks/fetchMarks',
  async () => {
    const response = await fetch(`${API_BASE_URL}/marks`);
    if (!response.ok) {
      throw new Error('Failed to fetch marks');
    }
    return await response.json();
  },
  {
    delay: 500
  }
);

// Async thunk to add new marks
export const addMarks = createAsyncThunkWithToast(
  'marks/addMarks',
  async (marksData) => {
    // If marksData is an array (multiple subjects), send each subject separately
    if (Array.isArray(marksData)) {
      const results = [];
      for (const mark of marksData) {
        const response = await fetch(`${API_BASE_URL}/marks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mark),
        });
        
        if (!response.ok) {
          throw new Error('Failed to add marks');
        }
        
        results.push(await response.json());
      }
      return results;
    }
    
    // If it's a marksheet object with multiple subjects, send each subject separately
    if (marksData.marks && Array.isArray(marksData.marks)) {
      const results = [];
      
      // Send individual mark records for each subject
      for (const subjectMark of marksData.marks) {
        const individualMark = {
          // Use existing subject mark ID if available, otherwise generate new one
          id: subjectMark.id || `${marksData.studentId}_${marksData.examType}_${subjectMark.subjectId || subjectMark.subjectName}`,
          studentId: marksData.studentId,
          studentName: marksData.studentName,
          class: marksData.class,
          section: marksData.section || '',
          examType: marksData.examType,
          examName: marksData.examType,
          subject: subjectMark.subjectName,
          subjectId: subjectMark.subjectId,
          marksObtained: subjectMark.marksObtained,
          totalMarks: subjectMark.totalMarks,
          grade: subjectMark.grade,
          academicYear: marksData.academicYear || new Date().getFullYear().toString(),
          year: marksData.year || new Date().getFullYear().toString()
          // Removed summary data as it will be calculated in transform function
        };
        
        const response = await fetch(`${API_BASE_URL}/marks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(individualMark),
        });
        
        if (!response.ok) {
          throw new Error('Failed to add marks');
        }
        
        results.push(await response.json());
      }
      
      return results;
    }
    
    // If it's already a single subject mark, send as is
    const newMarks = {
      id: marksData.id || Date.now().toString(),
      ...marksData
    };
    
    const response = await fetch(`${API_BASE_URL}/marks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newMarks),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add marks');
    }
    
    return await response.json();
  },
  {
    successMessage: 'Marks added successfully',
    errorMessage: 'Failed to add marks',
    delay: 500
  }
);

// Async thunk to update existing marks
export const updateMarks = createAsyncThunkWithToast(
  'marks/updateMarks',
  async (marksData) => {
    // Handle array of marks (multiple subjects)
    if (Array.isArray(marksData)) {
      const results = [];
      for (const mark of marksData) {
        const response = await fetch(`${API_BASE_URL}/marks/${mark.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mark),
        });
        
        if (!response.ok) {
          throw new Error('Failed to update marks');
        }
        
        results.push(await response.json());
      }
      return results;
    }
    
    // Handle single marksheet with multiple subjects
    if (marksData.marks && Array.isArray(marksData.marks)) {
      const results = [];
      
      // Update individual mark records for each subject
      for (const subjectMark of marksData.marks) {
        // Try to update existing record or create new one
        const individualMark = {
          // Use existing subject mark ID if available, otherwise generate new one
          id: subjectMark.id || `${marksData.studentId}_${marksData.examType}_${subjectMark.subjectId || subjectMark.subjectName}`,
          studentId: marksData.studentId,
          studentName: marksData.studentName,
          class: marksData.class,
          section: marksData.section || '',
          examType: marksData.examType,
          examName: marksData.examType,
          subject: subjectMark.subjectName,
          subjectId: subjectMark.subjectId,
          marksObtained: subjectMark.marksObtained,
          totalMarks: subjectMark.totalMarks,
          grade: subjectMark.grade,
          academicYear: marksData.academicYear || new Date().getFullYear().toString(),
          year: marksData.year || new Date().getFullYear().toString()
          // Removed summary data as it will be calculated in transform function
        };
        
        const response = await fetch(`${API_BASE_URL}/marks/${individualMark.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(individualMark),
        });
        
        if (!response.ok) {
          throw new Error('Failed to update marks');
        }
        
        results.push(await response.json());
      }
      
      return results;
    }
    
    // Handle single subject mark
    const response = await fetch(`${API_BASE_URL}/marks/${marksData.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(marksData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update marks');
    }
    
    return await response.json();
  },
  {
    successMessage: 'Marks updated successfully',
    errorMessage: 'Failed to update marks',
    delay: 500
  }
);

// Async thunk to delete marks
export const deleteMarks = createAsyncThunkWithToast(
  'marks/deleteMarks',
  async (marksId) => {
    // If marksId is an array, delete all
    if (Array.isArray(marksId)) {
      const results = [];
      for (const id of marksId) {
        const response = await fetch(`${API_BASE_URL}/marks/${id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete marks');
        }
        
        results.push(id);
      }
      return results;
    }
    
    const response = await fetch(`${API_BASE_URL}/marks/${marksId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete marks');
    }
    
    return marksId;
  },
  {
    successMessage: 'Marks deleted successfully',
    errorMessage: 'Failed to delete marks',
    delay: 500
  }
);

const marksSlice = createSlice({
  name: 'marks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMarks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMarks.fulfilled, (state, action) => {
        state.loading = false;
        // Transform the flat list of subject marks into marksheet objects
        state.marks = transformMarksData(action.payload);
      })
      .addCase(fetchMarks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addMarks.fulfilled, (state, action) => {
        // Handle array results
        if (Array.isArray(action.payload)) {
          const newMarks = transformMarksData(action.payload);
          // Merge with existing marks
          newMarks.forEach(newMark => {
            const existingIndex = state.marks.findIndex(m => m.studentId === newMark.studentId && m.examType === newMark.examType);
            if (existingIndex !== -1) {
              state.marks[existingIndex] = newMark;
            } else {
              state.marks.push(newMark);
            }
          });
        } else {
          // Handle single result
          const transformed = transformMarksData([action.payload]);
          if (transformed.length > 0) {
            const newMark = transformed[0];
            const existingIndex = state.marks.findIndex(m => m.studentId === newMark.studentId && m.examType === newMark.examType);
            if (existingIndex !== -1) {
              state.marks[existingIndex] = newMark;
            } else {
              state.marks.push(newMark);
            }
          }
        }
      })
      .addCase(updateMarks.fulfilled, (state, action) => {
        // Handle array results
        if (Array.isArray(action.payload)) {
          const updatedMarks = transformMarksData(action.payload);
          updatedMarks.forEach(updatedMark => {
            const existingIndex = state.marks.findIndex(m => m.studentId === updatedMark.studentId && m.examType === updatedMark.examType);
            if (existingIndex !== -1) {
              state.marks[existingIndex] = updatedMark;
            } else {
              state.marks.push(updatedMark);
            }
          });
        } else {
          // Handle single result
          const transformed = transformMarksData([action.payload]);
          if (transformed.length > 0) {
            const updatedMark = transformed[0];
            const existingIndex = state.marks.findIndex(m => m.studentId === updatedMark.studentId && m.examType === updatedMark.examType);
            if (existingIndex !== -1) {
              state.marks[existingIndex] = updatedMark;
            } else {
              state.marks.push(updatedMark);
            }
          }
        }
      })
      .addCase(deleteMarks.fulfilled, (state, action) => {
        // Handle array results
        if (Array.isArray(action.payload)) {
          action.payload.forEach(id => {
            state.marks = state.marks.filter(m => m.id !== id);
          });
        } else {
          // Handle single result
          state.marks = state.marks.filter(m => m.id !== action.payload);
        }
      });
  },
});

// Helper function to transform flat subject marks into marksheet objects
function transformMarksData(rawMarks) {
  if (!Array.isArray(rawMarks) || rawMarks.length === 0) {
    return [];
  }
  
  // Group marks by studentId and examType
  const grouped = {};
  
  rawMarks.forEach(mark => {
    // Skip invalid marks
    if (!mark.studentId || !mark.examType) {
      return;
    }
    
    const key = `${mark.studentId}_${mark.examType}`;
    
    if (!grouped[key]) {
      grouped[key] = {
        id: mark.id?.split('_')[0] || `${mark.studentId}_${mark.examType}`,
        studentId: mark.studentId,
        studentName: mark.studentName,
        class: mark.class,
        section: mark.section || '',
        examType: mark.examType,
        year: mark.year || new Date().getFullYear().toString(),
        marks: [],
        // Initialize summary fields to 0, will be calculated from subject marks
        totalObtained: 0,
        totalMarks: 0,
        percentage: 0,
        overallGrade: ''
      };
    }
    
    // Add subject mark to the marks array
    grouped[key].marks.push({
      id: mark.id,
      subjectId: mark.subjectId,
      subjectName: mark.subject,
      marksObtained: mark.marksObtained || 0,
      totalMarks: mark.totalMarks || 0,
      grade: mark.grade || ''
    });
  });
  
  // Calculate totals, percentage, and grade for each grouped marksheet
  Object.values(grouped).forEach(marksheet => {
    // Calculate totals from subject marks
    let totalObtained = 0;
    let totalMarks = 0;
    
    marksheet.marks.forEach(subjectMark => {
      totalObtained += parseFloat(subjectMark.marksObtained) || 0;
      totalMarks += parseFloat(subjectMark.totalMarks) || 0;
    });
    
    marksheet.totalObtained = totalObtained;
    marksheet.totalMarks = totalMarks;
    
    // Calculate percentage
    marksheet.percentage = totalMarks > 0 ? ((totalObtained / totalMarks) * 100).toFixed(2) : 0;
    
    // Calculate overall grade based on percentage
    const percentage = parseFloat(marksheet.percentage);
    if (percentage >= 90) marksheet.overallGrade = 'A+';
    else if (percentage >= 80) marksheet.overallGrade = 'A';
    else if (percentage >= 70) marksheet.overallGrade = 'B+';
    else if (percentage >= 60) marksheet.overallGrade = 'B';
    else if (percentage >= 50) marksheet.overallGrade = 'C';
    else if (percentage >= 40) marksheet.overallGrade = 'D';
    else marksheet.overallGrade = 'F';
  });
  
  return Object.values(grouped);
}

export default marksSlice.reducer;