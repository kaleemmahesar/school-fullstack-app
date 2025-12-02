import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { createAsyncThunkWithToast, createAddThunk, createUpdateThunk, createDeleteThunk } from '../utils/asyncThunkUtils';
import { API_BASE_URL, getApiUrl } from '../utils/apiConfig';
import { formatPakistaniPhoneNumber } from '../utils/phoneUtils';

/**
 * Initial state for the students slice
 */
const initialState = {
  students: [],
  loading: false,
  error: null,
};

/**
 * Async thunk to fetch students from the server
 * @returns {Promise<Array>} Promise that resolves to an array of students
 */
export const fetchStudents = createAsyncThunkWithToast(
  'students/fetchStudents',
  async () => {
    const response = await fetch(getApiUrl('students'));
    if (!response.ok) {
      throw new Error('Failed to fetch students');
    }
    return await response.json();
  },
  {
    delay: 500
  }
);

/**
 * Async thunk to add a new student
 * @param {Object} studentData - The student data to add
 * @returns {Promise<Object>} Promise that resolves to the new student object
 */
export const addStudent = createAddThunk(
  'students/addStudent',
  async (studentData) => {
    // Validate required fields
    if (!studentData.class) {
      throw new Error('Student must have a class assigned');
    }
    
    // Calculate totalFees if not provided
    let totalFees = parseFloat(studentData.totalFees) || 0;
    const monthlyFees = parseFloat(studentData.monthlyFees) || 0;
    const admissionFees = parseFloat(studentData.admissionFees) || 0;
    let feesPaid = parseFloat(studentData.feesPaid) || 0;
    
    // If totalFees is not provided or is 0, calculate it from monthly and admission fees
    if (totalFees <= 0) {
      totalFees = monthlyFees + admissionFees;
    }
    
    // Add admission fees to feesPaid since they are paid at admission
    feesPaid += admissionFees;
    
    // Create fees history with admission fees
    const feesHistory = [];
    
    // Determine academic year based on the currently active batch, not admission date
    // First, fetch batches to find the active one
    const batchesResponse = await fetch(getApiUrl('batches'));
    if (!batchesResponse.ok) {
      throw new Error('Failed to fetch batches for student creation');
    }
    
    const batches = await batchesResponse.json();
    const activeBatch = batches.find(batch => batch.status === 'active');
    
    // If there's an active batch, use its name as the academic year
    // Otherwise, fall back to the admission date calculation
    let academicYear;
    if (activeBatch) {
      academicYear = activeBatch.name;
    } else {
      // Fallback to admission date calculation if no active batch
      const admissionDate = new Date(studentData.dateOfAdmission || new Date());
      const admissionYear = admissionDate.getFullYear();
      const nextYear = admissionYear + 1;
      academicYear = `${admissionYear}-${nextYear}`;
    }
    
    // Validate roll number uniqueness within class and academic year
    const studentsResponse = await fetch(getApiUrl('students'));
    if (!studentsResponse.ok) {
      throw new Error('Failed to fetch students for roll number validation');
    }
    
    const existingStudents = await studentsResponse.json();
    const isRollNumberTaken = existingStudents.some(student => 
      student.class === studentData.class && 
      student.academicYear === academicYear && 
      student.grNo === studentData.grNo
    );
    
    if (isRollNumberTaken) {
      throw new Error(`Roll number ${studentData.grNo} is already taken in ${studentData.class} for academic year ${academicYear}`);
    }
    
    // Format parent contact number
    const parentContact = formatPakistaniPhoneNumber(studentData.parentContact);
    
    // Add admission fees record if admission fees are specified
    if (admissionFees > 0) {
      feesHistory.push({
        id: `challan-${Date.now()}-01`,
        month: 'Admission Fees',
        amount: admissionFees,
        paid: true,
        date: studentData.dateOfAdmission || new Date().toISOString(),
        dueDate: studentData.dateOfAdmission || new Date().toISOString().split('T')[0],
        status: 'paid',
        type: 'admission',
        academicYear, // Add academic year to challan
        // Add timestamp for when admission fee was processed
        paymentTimestamp: new Date().toISOString()
      });
    }
    
    // Generate a family ID if not provided (for new families)
    const familyId = studentData.familyId || `family-${Date.now()}`;
    
    const newStudent = {
      // For new students, let backend generate the ID
      // Don't include an ID here so backend will generate one
      ...studentData,
      // Use the photo URL from the uploaded photo, or generate a placeholder if none provided
      photo: studentData.photo || `https://api.dicebear.com/7.x/initials/svg?seed=${studentData.firstName} ${studentData.lastName}`,
      parentContact, // Format parent contact number
      monthlyFees,
      admissionFees,
      feesPaid,
      totalFees,
      familyId,
      feesHistory,
      status: 'studying',
      academicYear, // Add academic year field
      // Add timestamp for when student was added
      admissionTimestamp: new Date().toISOString()
    };
    
    // Send the new student to the API
    const response = await fetch(getApiUrl('students'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newStudent),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add student');
    }
    
    return await response.json();
  },
  {
    successMessage: 'Student added successfully',
    errorMessage: 'Failed to add student',
    delay: 500
  }
);

/**
 * Async thunk to update an existing student
 * @param {Object} studentData - The updated student data
 * @returns {Promise<Object>} Promise that resolves to the updated student object
 */
export const updateStudent = createUpdateThunk(
  'students/updateStudent',
  async (studentData) => {
    // Validate required fields
    if (!studentData.class) {
      throw new Error('Student must have a class assigned');
    }
    
    // Format parent contact number
    const parentContact = formatPakistaniPhoneNumber(studentData.parentContact);
    
    const updatedStudentData = {
      ...studentData,
      parentContact, // Format parent contact number
      // If photo is a data URL, clear it to prevent saving base64 data
      photo: (studentData.photo && studentData.photo.startsWith('data:')) ? '' : studentData.photo
    };
    
    const response = await fetch(getApiUrl(`students/${studentData.id}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedStudentData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update student');
    }
    
    return await response.json();
  },
  {
    successMessage: 'Student updated successfully',
    errorMessage: 'Failed to update student',
    delay: 500
  }
);

/**
 * Async thunk to delete a student
 * @param {string} studentId - The ID of the student to delete
 * @returns {Promise<string>} Promise that resolves to the deleted student ID
 */
export const deleteStudent = createDeleteThunk(
  'students/deleteStudent',
  async (studentId) => {
    const response = await fetch(getApiUrl(`students/${studentId}`), {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete student');
    }
    
    return studentId;
  },
  {
    successMessage: 'Student deleted successfully',
    errorMessage: 'Failed to delete student',
    delay: 500
  }
);

/**
 * Async thunk to pay student fees
 * @param {Object} paymentData - The payment data
 * @param {string} paymentData.challanId - The challan ID
 * @param {string} paymentData.paymentMethod - The payment method
 * @param {string} paymentData.paymentDate - The payment date
 * @returns {Promise<Object>} Promise that resolves to the payment data
 */
export const payFees = createAsyncThunkWithToast(
  'students/payFees',
  async ({ challanId, paymentMethod, paymentDate, discountAmount, discountReason, actualAmountPaid }) => {
    // Find the student who has this challan
    // First, we need to get all students to find the one with this challan
    const studentsResponse = await fetch(getApiUrl('students'));
    if (!studentsResponse.ok) {
      throw new Error('Failed to fetch students');
    }
    
    const students = await studentsResponse.json();
    let targetStudent = null;
    let targetChallan = null;
    
    // Find the student and challan
    for (const student of students) {
      if (student.feesHistory) {
        const challan = student.feesHistory.find(f => f.id === challanId);
        if (challan) {
          targetStudent = student;
          targetChallan = challan;
          break;
        }
      }
    }
    
    if (!targetStudent || !targetChallan) {
      throw new Error('Challan not found');
    }
    
    // Calculate fine amount based on due date
    const calculateFineAmount = (dueDate) => {
      if (!dueDate) return 0;
      const today = new Date(paymentDate || new Date());
      const due = new Date(dueDate);
      // Reset time part for accurate date comparison
      today.setHours(0, 0, 0, 0);
      due.setHours(0, 0, 0, 0);
      
      // If payment date is after due date, apply fine
      if (today > due) {
        return 500; // Fixed late fee
      }
      return 0;
    };
    
    // Calculate the fine amount
    const fineAmount = calculateFineAmount(targetChallan.dueDate);
    
    // Update the challan status
    targetChallan.paid = true;
    targetChallan.status = 'paid';
    targetChallan.date = paymentDate || new Date().toISOString();
    targetChallan.paymentMethod = paymentMethod || 'cash';
    // Add timestamp for when payment was made
    targetChallan.paymentTimestamp = new Date().toISOString();
    // Store the calculated fine amount
    targetChallan.fineAmount = fineAmount;
    // Store discount information
    targetChallan.discountAmount = discountAmount || 0;
    targetChallan.discountReason = discountReason || '';
    // Calculate the discounted amount (original amount - discount)
    targetChallan.discountedAmount = (parseFloat(targetChallan.amount) || 0) - (discountAmount || 0);
    
    // Update total fees paid (including fine but minus discount)
    const calculatedAmount = (parseFloat(targetChallan.amount) || 0) - (discountAmount || 0) + fineAmount;
    const finalAmountPaid = actualAmountPaid !== undefined ? actualAmountPaid : calculatedAmount;
    targetStudent.feesPaid = (parseFloat(targetStudent.feesPaid) || 0) + finalAmountPaid;
    
    // Update student in database
    const response = await fetch(getApiUrl(`students/${targetStudent.id}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(targetStudent),
    });

    if (!response.ok) {
      throw new Error('Failed to update student fees');
    }

    return await response.json();
  },
  {
    successMessage: 'Fees paid successfully',
    errorMessage: 'Failed to pay fees',
    delay: 500
  }
);

/**
 * Async thunk to generate a challan for a student
 * @param {Object} challanData - The challan data
 * @returns {Promise<Object>} Promise that resolves to the challan data
 */
export const generateChallan = createAsyncThunkWithToast(
  'students/generateChallan',
  async (challanData) => {
    // First, get the current student data
    const studentResponse = await fetch(getApiUrl(`students/${challanData.studentId}`));
    if (!studentResponse.ok) {
      throw new Error('Failed to fetch student');
    }
    
    const student = await studentResponse.json();
    
    // Convert month format from YYYY-MM to Month YYYY
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    const [year, monthIndex] = (challanData.month || '2025-01').split('-');
    const monthName = monthNames[parseInt(monthIndex) - 1] || 'Unknown';
    const formattedMonth = `${monthName} ${year}`;
    
    // Determine academic year based on challan month
    const challanYear = year;
    const nextYear = parseInt(challanYear) + 1;
    const academicYear = `${challanYear}-${nextYear}`;
    
    // Check if a challan already exists for this student and month
    if (student.feesHistory) {
      const existingChallan = student.feesHistory.find(
        challan => challan.month === formattedMonth && challan.type === 'monthly' && challan.academicYear === academicYear
      );
      
      if (existingChallan) {
        throw new Error(`A challan for ${formattedMonth} already exists for this student in academic year ${academicYear}`);
      }
      
      // Count existing monthly challans for this academic year
      const monthlyChallansCount = student.feesHistory.filter(
        challan => challan.type === 'monthly' && challan.academicYear === academicYear
      ).length;
      
      // Limit to 12 challans per academic year
      if (monthlyChallansCount >= 12) {
        throw new Error(`Maximum 12 challans allowed per academic year. Student already has 12 challans for ${academicYear}`);
      }
    }
    
    // Create new challan
    const newChallan = {
      month: formattedMonth,
      amount: parseFloat(challanData.amount) || 0,
      dueDate: challanData.dueDate || new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: challanData.description || '',
      paid: false,
      date: null,
      status: 'pending',
      type: 'monthly',
      academicYear, // Add academic year to challan
      // Add timestamp for when challan was generated
      generationTimestamp: new Date().toISOString()
    };
    
    // Update student's feesHistory
    const updatedStudent = {
      ...student,
      feesHistory: [...(student.feesHistory || []), newChallan]
    };
    
    // Update student in database
    const response = await fetch(getApiUrl(`students/${challanData.studentId}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedStudent),
    });

    if (!response.ok) {
      throw new Error('Failed to generate challan');
    }

    return await response.json();
  },
  {
    successMessage: 'Challan generated successfully',
    errorMessage: 'Failed to generate challan',
    delay: 500
  }
);

/**
 * Async thunk to bulk generate challans for multiple students
 * @param {Object} bulkData - The bulk challan data
 * @param {Array<string>} bulkData.studentIds - Array of student IDs
 * @param {Object} bulkData.challanTemplate - The challan template
 * @returns {Promise<Object>} Promise that resolves to the bulk challan data
 */
export const bulkGenerateChallans = createAsyncThunkWithToast(
  'students/bulkGenerateChallans',
  async ({ studentIds, challanTemplate }) => {
    // For each student, make an API call to update their feesHistory
    const updatedStudents = [];
          
    // Convert month format from YYYY-MM to Month YYYY for comparison
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    const monthToUse = challanTemplate.month || new Date().toISOString().slice(0, 7);
    const [year, monthIndex] = monthToUse.split('-');
    const monthName = monthNames[parseInt(monthIndex) - 1] || 'Unknown';
    const formattedMonth = `${monthName} ${year}`;
          
    for (const studentId of studentIds) {
      // Get the current student data
      const studentResponse = await fetch(getApiUrl(`students/${studentId}`));
      if (!studentResponse.ok) {
        throw new Error(`Failed to fetch student ${studentId}`);
      }
      
      const student = await studentResponse.json();
      
      // Determine academic year based on challan month
      const challanYear = year;
      const nextYear = parseInt(challanYear) + 1;
      const academicYear = `${challanYear}-${nextYear}`;
      
      // Check if a challan already exists for this student and month
      if (student.feesHistory) {
        const existingChallan = student.feesHistory.find(
          challan => challan.month === formattedMonth && challan.type === 'monthly' && challan.academicYear === academicYear
        );
        
        if (existingChallan) {
          throw new Error(`A challan for ${formattedMonth} already exists for student ${student.firstName} ${student.lastName} in academic year ${academicYear}`);
        }
        
        // Count existing monthly challans for this academic year
        const monthlyChallansCount = student.feesHistory.filter(
          challan => challan.type === 'monthly' && challan.academicYear === academicYear
        ).length;
        
        // Limit to 12 challans per academic year
        if (monthlyChallansCount >= 12) {
          throw new Error(`Maximum 12 challans allowed per academic year. Student ${student.firstName} ${student.lastName} already has 12 challans for ${academicYear}`);
        }
      }
      
      // Get class-based fees instead of using student.monthlyFees
      let classBasedFees = 0;
      if (student.class) {
        // Fetch class data to get the monthly fees
        try {
          // Construct the URL properly for query parameters
          const classUrl = `${API_BASE_URL}classes&name=${encodeURIComponent(student.class)}`;
          const classResponse = await fetch(classUrl);
          if (classResponse.ok) {
            const classData = await classResponse.json();
            if (classData && classData.monthlyFees) {
              classBasedFees = parseFloat(classData.monthlyFees) || 0;
            }
          }
        } catch (error) {
          console.warn(`Failed to fetch class data for ${student.class}:`, error);
        }
      }
      
      // Create new challan
      const newChallan = {
        month: formattedMonth,
        amount: classBasedFees,
        dueDate: challanTemplate.dueDate || new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: challanTemplate.description || '',
        paid: false,
        date: null,
        status: 'pending',
        type: 'monthly',
        academicYear, // Add academic year to challan
        // Add timestamp for when challan was generated
        generationTimestamp: new Date().toISOString()
      };
      
      // Update student's feesHistory
      const updatedStudent = {
        ...student,
        feesHistory: [...(student.feesHistory || []), newChallan]
      };
      
      // Update student in database
      const updateResponse = await fetch(getApiUrl(`students/${studentId}`), {
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
    
    return { studentIds, challanTemplate, updatedStudents };
  },
  {
    successMessage: 'Challans generated successfully',
    errorMessage: 'Failed to generate challans',
    delay: 1000
  }
);

/**
 * Async thunk to bulk update challan statuses
 * @param {Object} updateData - The update data
 * @param {Array<Object>} updateData.challanUpdates - Array of challan updates
 * @returns {Promise<Object>} Promise that resolves to the update data
 */
export const bulkUpdateChallanStatuses = createAsyncThunkWithToast(
  'students/bulkUpdateChallanStatuses',
  async ({ challanUpdates }) => {
    // Group updates by studentId for efficient processing
    const updatesByStudent = {};
    
    challanUpdates.forEach(update => {
      const { studentId, challanId, paymentMethod, paymentDate } = update || {};
      if (!studentId || !challanId) return;
      
      if (!updatesByStudent[studentId]) {
        updatesByStudent[studentId] = [];
      }
      
      updatesByStudent[studentId].push({
        challanId,
        paymentMethod: paymentMethod || 'cash',
        paymentDate: paymentDate || new Date().toISOString().split('T')[0]
      });
    });
    
    // Process updates for each student
    const updatedStudents = [];
    
    for (const [studentId, updates] of Object.entries(updatesByStudent)) {
      // Get the current student data
      const studentResponse = await fetch(getApiUrl(`students/${studentId}`));
      if (!studentResponse.ok) {
        throw new Error(`Failed to fetch student ${studentId}`);
      }
      
      const student = await studentResponse.json();
      
      // Apply all updates to this student's feesHistory
      let studentUpdated = false;
      let totalAdditionalPaid = 0;
      
      updates.forEach(update => {
        const { challanId, paymentMethod, paymentDate } = update;
        
        if (student.feesHistory) {
          const feeRecord = student.feesHistory.find(f => f.id === challanId);
          if (feeRecord && !feeRecord.paid) {
            // Update the challan status
            feeRecord.paid = true;
            feeRecord.status = 'paid';
            feeRecord.date = paymentDate;
            feeRecord.paymentMethod = paymentMethod;
            
            // Add to total additional paid amount
            totalAdditionalPaid += parseFloat(feeRecord.amount || 0);
            studentUpdated = true;
          }
        }
      });
      
      // Update total fees paid if any challans were updated
      if (studentUpdated) {
        student.feesPaid = (parseFloat(student.feesPaid) || 0) + totalAdditionalPaid;
        
        // Update student in database
        const updateResponse = await fetch(getApiUrl(`students/${studentId}`), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(student),
        });
        
        if (!updateResponse.ok) {
          throw new Error(`Failed to update student ${studentId}`);
        }
        
        updatedStudents.push(await updateResponse.json());
      }
    }
    
    return { challanUpdates, updatedStudents };
  },
  {
    successMessage: 'Challan statuses updated successfully',
    errorMessage: 'Failed to update challan statuses',
    delay: 1000
  }
);

/**
 * Async thunk to mark a student as left
 * @param {Object} studentData - The student data with leaving information
 * @returns {Promise<Object>} Promise that resolves to the updated student object
 */
export const markStudentAsLeft = createAsyncThunkWithToast(
  'students/markStudentAsLeft',
  async (studentData) => {
    // Update the student status to 'left' and add leaving information
    const updatedStudent = {
      ...studentData,
      status: 'left',
      dateOfLeaving: studentData.leavingDate || new Date().toISOString().split('T')[0],
      reasonOfLeaving: studentData.leavingReason || 'Left school',
      classInWhichLeft: studentData.class || '',
      // Preserve any existing data
      ...(studentData.dateOfLeaving && { dateOfLeaving: studentData.dateOfLeaving }),
      ...(studentData.reasonOfLeaving && { reasonOfLeaving: studentData.reasonOfLeaving }),
      ...(studentData.classInWhichLeft && { classInWhichLeft: studentData.classInWhichLeft })
    };
    
    // Update student in database
    const response = await fetch(getApiUrl(`students/${studentData.id}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedStudent),
    });
    
    if (!response.ok) {
      throw new Error('Failed to mark student as left');
    }
    
    return await response.json();
  },
  {
    successMessage: 'Student marked as left successfully',
    errorMessage: 'Failed to mark student as left',
    delay: 500
  }
);

/**
 * Redux slice for managing students state
 */
const studentsSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.students = action.payload;
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addStudent.fulfilled, (state, action) => {
        console.log('Adding student to state:', action.payload);
        state.students.push(action.payload);
        console.log('Students array after adding:', state.students);
      })
      .addCase(updateStudent.fulfilled, (state, action) => {
        const index = state.students.findIndex(student => student.id === action.payload.id);
        if (index !== -1) {
          state.students[index] = action.payload;
        }
      })
      .addCase(deleteStudent.fulfilled, (state, action) => {
        state.students = state.students.filter(student => student.id !== action.payload);
      })
      .addCase(payFees.fulfilled, (state, action) => {
        // Update the student in the state with the returned data from the API
        const index = state.students.findIndex(student => student.id === action.payload.id);
        if (index !== -1) {
          state.students[index] = action.payload;
        }
      })
      .addCase(generateChallan.fulfilled, (state, action) => {
        // Update the student in the state with the returned data from the API
        const index = state.students.findIndex(student => student.id === action.payload.id);
        if (index !== -1) {
          state.students[index] = action.payload;
        }
      })
      .addCase(bulkGenerateChallans.fulfilled, (state, action) => {
        // Update all students in the state with the returned data from the API
        const { updatedStudents } = action.payload;
        updatedStudents.forEach(updatedStudent => {
          const index = state.students.findIndex(student => student.id === updatedStudent.id);
          if (index !== -1) {
            state.students[index] = updatedStudent;
          }
        });
      })
      .addCase(bulkUpdateChallanStatuses.fulfilled, (state, action) => {
        const { challanUpdates, updatedStudents } = action.payload;
        
        // Update each student in the state with the returned data from the API
        updatedStudents.forEach(updatedStudent => {
          const index = state.students.findIndex(student => student.id === updatedStudent.id);
          if (index !== -1) {
            state.students[index] = updatedStudent;
          }
        });
      })
      .addCase(markStudentAsLeft.fulfilled, (state, action) => {
        const index = state.students.findIndex(student => student.id === action.payload.id);
        if (index !== -1) {
          state.students[index] = action.payload;
        }
      });
  },
});

export default studentsSlice.reducer;