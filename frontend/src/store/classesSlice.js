import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { createAsyncThunkWithToast, createAddThunk, createUpdateThunk, createDeleteThunk } from '../utils/asyncThunkUtils';
import { API_BASE_URL } from '../utils/apiConfig';

const initialState = {
  classes: [],
  loading: false,
  error: null,
};

// Async thunks for API calls
export const fetchClasses = createAsyncThunkWithToast(
  'classes/fetchClasses',
  async () => {
    const response = await fetch(`${API_BASE_URL}/classes`);
    if (!response.ok) {
      throw new Error('Failed to fetch classes');
    }
    return await response.json();
  },
  {
    delay: 500
  }
);

export const addClass = createAddThunk(
  'classes/addClass',
  async (classData) => {
    // Prepare class data for API (with sections)
    const newClass = {
      id: Date.now().toString(),
      name: classData.name,
      monthlyFees: classData.monthlyFees || 0,
      admissionFees: classData.admissionFees || 0,
      sections: classData.sections || [] // Include sections in the request
    };
    
    const response = await fetch(`${API_BASE_URL}/classes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newClass),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add class');
    }
    
    return await response.json();
  },
  {
    successMessage: 'Class added successfully',
    errorMessage: 'Failed to add class',
    delay: 500
  }
);

export const updateClass = createUpdateThunk(
  'classes/updateClass',
  async (classData) => {
    // Prepare class data for API (with sections)
    const updatedClass = {
      id: classData.id,
      name: classData.name,
      monthlyFees: classData.monthlyFees || 0,
      admissionFees: classData.admissionFees || 0,
      sections: classData.sections || [] // Include sections in the request
    };
    
    const response = await fetch(`${API_BASE_URL}/classes/${classData.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedClass),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update class');
    }
    
    return await response.json();
  },
  {
    successMessage: 'Class updated successfully',
    errorMessage: 'Failed to update class',
    delay: 500
  }
);

export const deleteClass = createDeleteThunk(
  'classes/deleteClass',
  async (classId) => {
    const response = await fetch(`${API_BASE_URL}/classes/${classId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete class');
    }
    
    return classId;
  },
  {
    successMessage: 'Class deleted successfully',
    errorMessage: 'Failed to delete class',
    delay: 500
  }
);

// New thunk for updating class fees
export const updateClassFees = createAsyncThunkWithToast(
  'classes/updateClassFees',
  async ({ classId, monthlyFees }) => {
    return { classId, monthlyFees };
  },
  {
    successMessage: 'Class fees updated successfully',
    errorMessage: 'Failed to update class fees',
    delay: 500
  }
);

// New thunk for adding a section to a class
export const addSectionToClass = createAsyncThunkWithToast(
  'classes/addSectionToClass',
  async ({ classId, section }) => {
    const newSection = {
      id: Date.now().toString(),
      class_id: classId,
      name: section.name
    };
    
    const response = await fetch(`${API_BASE_URL}/sections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newSection),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add section to class');
    }
    
    // Fetch the updated class to get all sections
    const classResponse = await fetch(`${API_BASE_URL}/classes/${classId}`);
    if (!classResponse.ok) {
      throw new Error('Failed to fetch updated class');
    }
    
    return await classResponse.json();
  },
  {
    successMessage: 'Section added successfully',
    errorMessage: 'Failed to add section',
    delay: 500
  }
);

// New thunk for removing a section from a class
export const removeSectionFromClass = createAsyncThunkWithToast(
  'classes/removeSectionFromClass',
  async ({ classId, sectionId }) => {
    const response = await fetch(`${API_BASE_URL}/sections/${sectionId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to remove section from class');
    }
    
    // Fetch the updated class to get all sections
    const classResponse = await fetch(`${API_BASE_URL}/classes/${classId}`);
    if (!classResponse.ok) {
      throw new Error('Failed to fetch updated class');
    }
    
    return await classResponse.json();
  },
  {
    successMessage: 'Section removed successfully',
    errorMessage: 'Failed to remove section',
    delay: 500
  }
);

// New thunk for adding a subject to a class
export const addSubjectToClass = createAsyncThunkWithToast(
  'classes/addSubjectToClass',
  async ({ classId, subject }) => {
    const newSubject = {
      id: Date.now().toString(),
      class_id: classId,
      name: subject.name,
      code: subject.code || ''
    };
    
    const response = await fetch(`${API_BASE_URL}/subjects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newSubject),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add subject to class');
    }
    
    // Fetch the updated class to get all subjects
    const classResponse = await fetch(`${API_BASE_URL}/classes/${classId}`);
    if (!classResponse.ok) {
      throw new Error('Failed to fetch updated class');
    }
    
    return await classResponse.json();
  },
  {
    successMessage: 'Subject added successfully',
    errorMessage: 'Failed to add subject',
    delay: 500
  }
);

// New thunk for removing a subject from a class
export const removeSubjectFromClass = createAsyncThunkWithToast(
  'classes/removeSubjectFromClass',
  async ({ classId, subjectId }) => {
    const response = await fetch(`${API_BASE_URL}/subjects/${subjectId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to remove subject from class');
    }
    
    // Fetch the updated class to get all subjects
    const classResponse = await fetch(`${API_BASE_URL}/classes/${classId}`);
    if (!classResponse.ok) {
      throw new Error('Failed to fetch updated class');
    }
    
    return await classResponse.json();
  },
  {
    successMessage: 'Subject removed successfully',
    errorMessage: 'Failed to remove subject',
    delay: 500
  }
);

// New thunk for updating a subject in a class
export const updateSubjectInClass = createAsyncThunkWithToast(
  'classes/updateSubjectInClass',
  async ({ classId, subjectId, updatedSubjectData }) => {
    const updatedSubject = {
      class_id: classId,
      name: updatedSubjectData.name,
      code: updatedSubjectData.code || ''
    };
    
    const response = await fetch(`${API_BASE_URL}/subjects/${subjectId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedSubject),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update subject in class');
    }
    
    // Fetch the updated class to get all subjects
    const classResponse = await fetch(`${API_BASE_URL}/classes/${classId}`);
    if (!classResponse.ok) {
      throw new Error('Failed to fetch updated class');
    }
    
    return await classResponse.json();
  },
  {
    successMessage: 'Subject updated successfully',
    errorMessage: 'Failed to update subject',
    delay: 500
  }
);

const classesSlice = createSlice({
  name: 'classes',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchClasses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClasses.fulfilled, (state, action) => {
        state.loading = false;
        state.classes = action.payload;
      })
      .addCase(fetchClasses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addClass.fulfilled, (state, action) => {
        state.classes.push(action.payload);
      })
      .addCase(updateClass.fulfilled, (state, action) => {
        const index = state.classes.findIndex(classItem => classItem.id === action.payload.id);
        if (index !== -1) {
          state.classes[index] = action.payload;
        }
      })
      .addCase(deleteClass.fulfilled, (state, action) => {
        state.classes = state.classes.filter(classItem => classItem.id !== action.payload);
      })
      .addCase(updateClassFees.fulfilled, (state, action) => {
        const { classId, monthlyFees } = action.payload;
        const classItem = state.classes.find(c => c.id === classId);
        if (classItem) {
          classItem.monthlyFees = monthlyFees;
        }
      })
      .addCase(addSubjectToClass.fulfilled, (state, action) => {
        // Replace the entire class with the updated one from the API
        const updatedClass = action.payload;
        const index = state.classes.findIndex(c => c.id === updatedClass.id);
        if (index !== -1) {
          state.classes[index] = updatedClass;
        }
      })
      .addCase(removeSubjectFromClass.fulfilled, (state, action) => {
        // Replace the entire class with the updated one from the API
        const updatedClass = action.payload;
        const index = state.classes.findIndex(c => c.id === updatedClass.id);
        if (index !== -1) {
          state.classes[index] = updatedClass;
        }
      })
      .addCase(updateSubjectInClass.fulfilled, (state, action) => {
        // Replace the entire class with the updated one from the API
        const updatedClass = action.payload;
        const index = state.classes.findIndex(c => c.id === updatedClass.id);
        if (index !== -1) {
          state.classes[index] = updatedClass;
        }
      });
  },
});

export default classesSlice.reducer;