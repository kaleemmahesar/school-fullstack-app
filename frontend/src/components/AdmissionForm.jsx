import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { addStudent, updateStudent, deleteStudent } from '../store/studentsSlice';
import { fetchClasses } from '../store/classesSlice';
import { FaUserGraduate, FaIdCard, FaPhone, FaEnvelope, FaCalendar, FaSchool, FaMoneyBillWave, FaCamera, FaTrash, FaInfoCircle, FaHandHoldingUsd } from 'react-icons/fa';
import PrintableAdmissionForm from './PrintableAdmissionForm';
import ConfirmationDialog from './common/ConfirmationDialog';
import { useSchoolFunding } from '../hooks/useSchoolFunding';
import NGOFundingInfo from './common/NGOFundingInfo';
import { API_BASE_URL } from '../utils/apiConfig';

// Yup validation schema
const admissionFormValidationSchema = Yup.object().shape({
  firstName: Yup.string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),
  lastName: Yup.string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),
  email: Yup.string()
    .email('Invalid email format')
    .nullable()
    .transform((value) => value === '' ? undefined : value),
  phone: Yup.string()
    .matches(/^(\+92|0)?[0-9]{10,11}$/, 'Invalid Pakistani phone number format')
    .nullable()
    .transform((value) => value === '' ? undefined : value),
  parentContact: Yup.string()
    .matches(/^(\+92|0)?[0-9]{10,11}$/, 'Invalid Pakistani phone number format')
    .nullable()
    .transform((value) => value === '' ? undefined : value),
  dateOfBirth: Yup.date()
    .required('Date of birth is required')
    .max(new Date(), 'Date of birth cannot be in the future')
    .nullable()
    .typeError('Invalid date format')
    .transform((value) => value === '' ? undefined : value),
  admissionDate: Yup.date()
    .required('Admission date is required')
    .nullable()
    .typeError('Invalid date format')
    .transform((value) => value === '' ? undefined : value),
  class: Yup.string()
    .required('Class is required')
    .transform((value) => value === '' ? undefined : value),
  section: Yup.string()
    .required('Section is required')
    .transform((value) => value === '' ? undefined : value),
  monthlyFees: Yup.number()
    .nullable()
    .min(0, 'Monthly fees cannot be negative')
    .typeError('Monthly fees must be a number')
    .transform((value) => value === '' || value === null ? undefined : Number(value)),
  admissionFees: Yup.number()
    .nullable()
    .min(0, 'Admission fees cannot be negative')
    .typeError('Admission fees must be a number')
    .transform((value) => value === '' || value === null ? undefined : Number(value)),
  feesPaid: Yup.number()
    .nullable()
    .min(0, 'Fees paid cannot be negative')
    .typeError('Fees paid must be a number')
    .transform((value) => value === '' || value === null ? undefined : Number(value)),
  totalFees: Yup.number()
    .nullable()
    .min(0, 'Total fees cannot be negative')
    .typeError('Total fees must be a number')
    .transform((value) => value === '' || value === null ? undefined : Number(value)),
  religion: Yup.string()
    .required('Religion is required')
    .transform((value) => value === '' ? undefined : value),
  // Transfer student fields (conditional validation)
  dateOfLeaving: Yup.date()
    .nullable()
    .when('isTransferStudent', {
      is: true,
      then: (schema) => schema.required('Date of leaving is required for transfer students').typeError('Invalid date format')
    })
    .transform((value) => value === '' ? undefined : value),
  classInWhichLeft: Yup.string()
    .nullable()
    .when('isTransferStudent', {
      is: true,
      then: (schema) => schema.required('Class in which left is required for transfer students')
    })
    .transform((value) => value === '' ? undefined : value),
  reasonOfLeaving: Yup.string()
    .nullable()
    .when('isTransferStudent', {
      is: true,
      then: (schema) => schema.required('Reason of leaving is required for transfer students')
    })
    .transform((value) => value === '' ? undefined : value),
  isTransferStudent: Yup.boolean()
    .required()
});

const AdmissionForm = ({ onClose, studentData }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { classes } = useSelector(state => state.classes);
  const { isNGOSchool } = useSchoolFunding();
  const fileInputRef = useRef(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [showPrintView, setShowPrintView] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isEditMode = !!studentData;

  // Initial form values
  const initialValues = {
    firstName: studentData?.firstName || '',
    lastName: studentData?.lastName || '',
    email: studentData?.email || '',
    phone: studentData?.phone || '',
    dateOfBirth: studentData?.dateOfBirth ? new Date(studentData.dateOfBirth).toISOString().split('T')[0] : '',
    admissionDate: studentData?.admissionDate ? new Date(studentData.admissionDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    class: studentData?.class || '',
    section: studentData?.section || '',
    monthlyFees: studentData?.monthlyFees ? Number(studentData.monthlyFees) : undefined,
    admissionFees: studentData?.admissionFees ? Number(studentData.admissionFees) : undefined,
    feesPaid: studentData?.feesPaid ? Number(studentData.feesPaid) : undefined,
    totalFees: studentData?.totalFees ? Number(studentData.totalFees) : undefined,
    familyId: studentData?.familyId || '',
    relationship: studentData?.relationship || '',
    parentId: studentData?.parentId || '',
    parentContact: studentData?.parentContact || '',
    // Fix: Make isTransferStudent unchecked by default for both new admissions and editing
    // Only check it if we're editing and there are actual transfer values
    isTransferStudent: studentData?.dateOfLeaving || studentData?.classInWhichLeft || studentData?.reasonOfLeaving ? true : false,
    dateOfLeaving: studentData?.dateOfLeaving ? new Date(studentData.dateOfLeaving).toISOString().split('T')[0] : '',
    classInWhichLeft: studentData?.classInWhichLeft || '',
    reasonOfLeaving: studentData?.reasonOfLeaving || '',
    religion: studentData?.religion || 'Islam'
  };

  useEffect(() => {
    dispatch(fetchClasses());
  }, [dispatch]);

  const handlePhotoChange = (e, setFieldValue) => {
    const file = e.target.files[0];
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPEG, PNG, etc.)');
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit');
        return;
      }

      setPhotoFile(file);
      setFieldValue('photoFile', file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setFieldValue('photoPreview', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = (setFieldValue) => {
    setPhotoPreview(null);
    setPhotoFile(null);
    setFieldValue('photoPreview', null);
    setFieldValue('photoFile', null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      console.log('Form values:', values);
      
      // Handle photo upload logic
      let photoUrl = values.photoPreview || '';
      
      // If there's a photo file, upload it to the server
      if (photoFile) {
        const formDataObj = new FormData();
        formDataObj.append('photo', photoFile);
        
        try {
          const response = await fetch(`${API_BASE_URL}/photos`, {
            method: 'POST',
            body: formDataObj
          });
          
          // Check if response is OK
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const result = await response.json();
          
          if (result.success) {
            // Store the URL of the uploaded photo
            photoUrl = result.url;
            console.log('Photo uploaded successfully:', result.url);
          } else {
            console.error('Photo upload failed:', result.error);
            setFieldError('photo', 'Failed to upload photo: ' + result.error);
            setSubmitting(false);
            return;
          }
        } catch (error) {
          console.error('Photo upload error:', error);
          setFieldError('photo', 'Failed to upload photo. Please try again. Error: ' + error.message);
          setSubmitting(false);
          return;
        }
      } else if (photoPreview) {
        // If photoPreview exists, check if it's a URL or data URL
        if (photoPreview.startsWith('http')) {
          // If photoPreview is already a URL (from existing student data), keep it
          photoUrl = photoPreview;
          console.log('Using existing photo URL:', photoPreview);
        } else if (photoPreview.startsWith('data:')) {
          // If photoPreview is a data URL, we should not save it as-is
          // Instead, we should either upload the file or clear the photo
          // For now, we'll clear it to avoid storing base64 data
          photoUrl = '';
          console.log('Clearing data URL photo');
        }
      } else {
        // If no photo, clear the photo field
        photoUrl = '';
        console.log('No photo provided, clearing photo field');
      }

      // Create submission data
      const submissionData = {
        ...values,
        photo: photoUrl
      };

      // If not a transfer student, clear transfer fields
      if (!values.isTransferStudent) {
        submissionData.dateOfLeaving = '';
        submissionData.classInWhichLeft = '';
        submissionData.reasonOfLeaving = '';
      }

      // For NGO schools, clear fee fields
      if (isNGOSchool) {
        submissionData.monthlyFees = '';
        submissionData.admissionFees = '';
        submissionData.feesPaid = '';
        submissionData.totalFees = '';
      }

      if (isEditMode) {
        // For editing, we need to preserve the original ID and other important fields
        console.log('Updating existing student:', { 
          id: studentData.id,  // Preserve the original ID
          ...studentData,      // Include all original data
          ...submissionData    // Override with updated data
        });
        dispatch(updateStudent({ 
          id: studentData.id,  // Preserve the original ID
          ...studentData,      // Include all original data
          ...submissionData    // Override with updated data
        }));
      } else {
        // For new students, DO NOT include the ID so backend can generate it
        // Remove the ID field completely
        const { id, ...newStudentData } = submissionData;
        console.log('Adding new student (without ID):', newStudentData);
        dispatch(addStudent(newStudentData));
      }
      
      // Close the form
      if (onClose) onClose();
    } catch (error) {
      console.error('Form submission error:', error);
      setFieldError('submit', 'Failed to submit form. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (isEditMode && studentData) {
      dispatch(deleteStudent(studentData.id));
      if (onClose) onClose();
    }
  };

  const handlePrint = () => {
    setShowPrintView(true);
  };

  const closePrintView = () => {
    setShowPrintView(false);
  };

  const handlePrintAction = () => {
    window.print();
  };

  // Get unique classes for dropdown
  const uniqueClasses = [...new Set(classes.map(cls => cls.name))];
  
  // Get sections for selected class
  const classSections = initialValues.class 
    ? classes.find(cls => cls.name === initialValues.class)?.sections || []
    : [];

  if (showPrintView) {
    return (
      <div className="fixed inset-0 bg-white z-50 p-0 m-0 overflow-hidden">
        {/* Print Header - Hidden during actual printing */}
        <div className="print-header sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center no-print">
        </div>
        
        {/* Print Content - This is what will actually be printed */}
        <div className="py-6 px-6">
          <PrintableAdmissionForm formData={initialValues} photoPreview={photoPreview} />
        </div>
        
        {/* Print-specific styles */}
        <style>{`
          @media print {
            @page {
              margin: 0.5in;
              size: A4;
            }
            body {
              margin: 0;
              padding: 0;
              font-size: 12pt;
              font-family: Arial, Helvetica, sans-serif;
            }
            .no-print {
              display: none !important;
            }
            /* Hide all non-essential elements when printing */
            .print-header, .print-button, .print-actions {
              display: none !important;
            }
            /* Ensure clean print view */
            .form-container {
              box-shadow: none !important;
              margin: 0 !important;
              padding: 0 !important;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={admissionFormValidationSchema}
      onSubmit={handleSubmit}
      enableReinitialize={true}
      validateOnBlur={true}
      validateOnChange={true}
      validateOnMount={false}
    >
      {({ isSubmitting, setFieldValue, values, errors, touched }) => (
        <Form>
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  {isEditMode ? 'Edit Student' : 'Student Admission Form'}
                </h3>
                <button 
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700"
                  type="button"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="py-4 px-6">
                <div id="admission-form" className="bg-white">
                  {/* Student Information Section */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h2 className="text-md font-medium text-gray-900 mb-3">Student Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Photo Upload Section */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Student Photo</label>
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            {photoPreview ? (
                              <img 
                                src={photoPreview} 
                                alt="Student Preview" 
                                className="h-24 w-24 rounded-lg object-cover border border-gray-300"
                              />
                            ) : (
                              <div className="bg-gray-200 border border-dashed border-gray-300 rounded-lg w-24 h-24 flex items-center justify-center">
                                <FaCamera className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col space-y-2">
                            <div className="flex flex-col">
                              <input
                                type="file"
                                ref={fileInputRef}
                                onChange={(e) => handlePhotoChange(e, setFieldValue)}
                                accept="image/*"
                                className="hidden"
                                id="photo-upload"
                              />
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                aria-describedby="photo-upload-help"
                              >
                                <FaCamera className="mr-1.5 h-4 w-4" />
                                {photoPreview ? 'Change Photo' : 'Upload Photo'}
                              </button>
                              <p id="photo-upload-help" className="text-xs text-gray-500 mt-1">JPEG, PNG up to 5MB</p>
                            </div>
                            {photoPreview && (
                              <button
                                type="button"
                                onClick={() => handleRemovePhoto(setFieldValue)}
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              >
                                Remove Photo
                              </button>
                            )}
                          </div>
                        </div>
                        <ErrorMessage name="photo" component="div" className="text-red-500 text-sm mt-1" />
                      </div>
                      
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <Field
                          type="text"
                          id="firstName"
                          name="firstName"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter first name"
                        />
                        <ErrorMessage name="firstName" component="div" className="text-red-500 text-sm mt-1" />
                      </div>
                      
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <Field
                          type="text"
                          id="lastName"
                          name="lastName"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter last name"
                        />
                        <ErrorMessage name="lastName" component="div" className="text-red-500 text-sm mt-1" />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaEnvelope className="h-5 w-5 text-gray-400" />
                          </div>
                          <Field
                            type="email"
                            id="email"
                            name="email"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="student@example.com"
                          />
                        </div>
                        <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                      </div>
                      
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaPhone className="h-5 w-5 text-gray-400" />
                          </div>
                          <Field
                            type="tel"
                            id="phone"
                            name="phone"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="+92 300 1234567"
                          />
                        </div>
                        <ErrorMessage name="phone" component="div" className="text-red-500 text-sm mt-1" />
                      </div>
                      
                      <div>
                        <label htmlFor="parentContact" className="block text-sm font-medium text-gray-700 mb-1">
                          Parent Contact Number
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaPhone className="h-5 w-5 text-gray-400" />
                          </div>
                          <Field
                            type="tel"
                            id="parentContact"
                            name="parentContact"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="+92 300 1234567"
                          />
                        </div>
                        <ErrorMessage name="parentContact" component="div" className="text-red-500 text-sm mt-1" />
                      </div>
                      
                      <div>
                        <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                          Date of Birth <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaCalendar className="h-5 w-5 text-gray-400" />
                          </div>
                          <Field
                            type="date"
                            id="dateOfBirth"
                            name="dateOfBirth"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <ErrorMessage name="dateOfBirth" component="div" className="text-red-500 text-sm mt-1" />
                      </div>
                      
                      <div>
                        <label htmlFor="admissionDate" className="block text-sm font-medium text-gray-700 mb-1">
                          Admission Date <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaCalendar className="h-5 w-5 text-gray-400" />
                          </div>
                          <Field
                            type="date"
                            id="admissionDate"
                            name="admissionDate"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <ErrorMessage name="admissionDate" component="div" className="text-red-500 text-sm mt-1" />
                      </div>
                      
                      <div>
                        <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-1">
                          Class <span className="text-red-500">*</span>
                        </label>
                        <Field
                          as="select"
                          id="class"
                          name="class"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          onChange={(e) => {
                            setFieldValue('class', e.target.value);
                            setFieldValue('section', ''); // Reset section when class changes
                          }}
                        >
                          <option value="">Select Class</option>
                          {uniqueClasses.map((cls) => (
                            <option key={cls} value={cls}>{cls}</option>
                          ))}
                        </Field>
                        <ErrorMessage name="class" component="div" className="text-red-500 text-sm mt-1" />
                      </div>
                      
                      <div>
                        <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-1">
                          Section <span className="text-red-500">*</span>
                        </label>
                        <Field
                          as="select"
                          id="section"
                          name="section"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          disabled={!values.class}
                        >
                          <option value="">Select Section</option>
                          {classSections.map((section) => (
                            <option key={section.name} value={section.name}>{section.name}</option>
                          ))}
                        </Field>
                        <ErrorMessage name="section" component="div" className="text-red-500 text-sm mt-1" />
                      </div>
                      
                      {/* Religion Field */}
                      <div>
                        <label htmlFor="religion" className="block text-sm font-medium text-gray-700 mb-1">
                          Religion <span className="text-red-500">*</span>
                        </label>
                        <Field
                          as="select"
                          id="religion"
                          name="religion"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="Islam">Islam</option>
                          <option value="Christianity">Christianity</option>
                          <option value="Hinduism">Hinduism</option>
                          <option value="Sikhism">Sikhism</option>
                          <option value="Buddhism">Buddhism</option>
                          <option value="Judaism">Judaism</option>
                          <option value="Other">Other</option>
                        </Field>
                        <ErrorMessage name="religion" component="div" className="text-red-500 text-sm mt-1" />
                      </div>
                    </div>
                  </div>
                  
                  {/* NGO Funding Information Section (Only for NGO schools) */}
                  {isNGOSchool && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                      <NGOFundingInfo />
                    </div>
                  )}
                  
                  {/* Fee Details Section (Only for traditional schools) */}
                  {!isNGOSchool && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h2 className="text-md font-medium text-gray-900 mb-3">Fee Details</h2>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div>
                          <label htmlFor="admissionFees" className="block text-sm font-medium text-gray-700 mb-1">
                            Admission Fees <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 text-sm">Rs</span>
                            </div>
                            <Field
                              type="number"
                              id="admissionFees"
                              name="admissionFees"
                              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              placeholder="5000"
                            />
                          </div>
                          <ErrorMessage name="admissionFees" component="div" className="text-red-500 text-sm mt-1" />
                        </div>
                        
                        <div>
                          <label htmlFor="monthlyFees" className="block text-sm font-medium text-gray-700 mb-1">
                            Monthly Fees <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 text-sm">Rs</span>
                            </div>
                            <Field
                              type="number"
                              id="monthlyFees"
                              name="monthlyFees"
                              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              placeholder="4000"
                            />
                          </div>
                          <ErrorMessage name="monthlyFees" component="div" className="text-red-500 text-sm mt-1" />
                        </div>
                        
                        <div>
                          <label htmlFor="totalFees" className="block text-sm font-medium text-gray-700 mb-1">
                            Total Fees <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 text-sm">Rs</span>
                            </div>
                            <Field
                              type="number"
                              id="totalFees"
                              name="totalFees"
                              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                              placeholder="9000"
                              readOnly
                            />
                          </div>
                          <ErrorMessage name="totalFees" component="div" className="text-red-500 text-sm mt-1" />
                        </div>
                        
                        <div>
                          <label htmlFor="feesPaid" className="block text-sm font-medium text-gray-700 mb-1">Fees Paid</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 text-sm">Rs</span>
                            </div>
                            <Field
                              type="number"
                              id="feesPaid"
                              name="feesPaid"
                              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              placeholder="0"
                            />
                          </div>
                          <ErrorMessage name="feesPaid" component="div" className="text-red-500 text-sm mt-1" />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Transfer Student Information Toggle */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <Field
                        type="checkbox"
                        id="isTransferStudent"
                        name="isTransferStudent"
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="isTransferStudent" className="ml-2 block text-sm font-medium text-gray-700">
                        Student is transferring from another school
                      </label>
                      <FaInfoCircle className="ml-2 h-4 w-4 text-blue-500" title="Check this box if the student is coming from another school" />
                    </div>
                  </div>

                  {/* Transfer Student Information (Only shown when isTransferStudent is true) */}
                  {values.isTransferStudent && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                      <h2 className="text-md font-medium text-blue-900 mb-3">Transfer Student Information</h2>
                      <p className="text-sm text-blue-700 mb-3">These fields are required for students transferring from another school</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label htmlFor="dateOfLeaving" className="block text-sm font-medium text-gray-700 mb-1">
                            Date of Removal <span className="text-red-500">*</span>
                          </label>
                          <Field
                            type="date"
                            id="dateOfLeaving"
                            name="dateOfLeaving"
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          />
                          <ErrorMessage name="dateOfLeaving" component="div" className="text-red-500 text-sm mt-1" />
                        </div>
                        
                        <div>
                          <label htmlFor="classInWhichLeft" className="block text-sm font-medium text-gray-700 mb-1">
                            Class at the time of removal <span className="text-red-500">*</span>
                          </label>
                          <Field
                            type="text"
                            id="classInWhichLeft"
                            name="classInWhichLeft"
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., Class 9"
                          />
                          <ErrorMessage name="classInWhichLeft" component="div" className="text-red-500 text-sm mt-1" />
                        </div>
                        
                        <div>
                          <label htmlFor="reasonOfLeaving" className="block text-sm font-medium text-gray-700 mb-1">
                            Reason for leaving <span className="text-red-500">*</span>
                          </label>
                          <Field
                            type="text"
                            id="reasonOfLeaving"
                            name="reasonOfLeaving"
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., Relocation, School closure"
                          />
                          <ErrorMessage name="reasonOfLeaving" component="div" className="text-red-500 text-sm mt-1" />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Form Actions */}
                  <div className="flex justify-end space-x-3 pt-4">
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <FaTrash className="mr-2 -ml-1 h-4 w-4" />
                        Delete Student
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Submitting...' : (isEditMode ? 'Update Student' : 'Add Student')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Delete Confirmation Dialog */}
            <ConfirmationDialog
              isOpen={showDeleteConfirm}
              onClose={() => setShowDeleteConfirm(false)}
              onConfirm={handleDelete}
              title="Delete Student"
              message="Are you sure you want to delete this student? This action cannot be undone."
              confirmText="Delete"
              cancelText="Cancel"
              confirmButtonClass="bg-red-600 hover:bg-red-700"
            />
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default AdmissionForm;