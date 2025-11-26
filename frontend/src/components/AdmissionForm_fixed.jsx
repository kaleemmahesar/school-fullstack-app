import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addStudent, updateStudent, deleteStudent } from '../store/studentsSlice';
import { fetchClasses } from '../store/classesSlice';
import { FaUserGraduate, FaIdCard, FaPhone, FaEnvelope, FaCalendar, FaSchool, FaMoneyBillWave, FaCamera, FaTrash, FaInfoCircle, FaHandHoldingUsd } from 'react-icons/fa';
import PrintableAdmissionForm from './PrintableAdmissionForm';
import ConfirmationDialog from './common/ConfirmationDialog';
import { useSchoolFunding } from '../hooks/useSchoolFunding';
import NGOFundingInfo from './common/NGOFundingInfo';
import { API_BASE_URL } from '../utils/apiConfig';

const AdmissionForm = ({ onClose, studentData }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { classes } = useSelector(state => state.classes);
  const { isNGOSchool } = useSchoolFunding();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    admissionDate: new Date().toISOString().split('T')[0], // Default to today
    class: '',
    section: '',
    monthlyFees: '',
    admissionFees: '',
    feesPaid: '',
    totalFees: '',
    familyId: '',
    relationship: '',
    parentId: '',
    // Fields for students coming from another school
    isTransferStudent: false, // New field to track if student is a transfer
    dateOfLeaving: '',
    classInWhichLeft: '',
    reasonOfLeaving: '',
    // Religion field
    religion: 'Islam' // Default to Islam as requested
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [showPrintView, setShowPrintView] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isEditMode = !!studentData;

  useEffect(() => {
    dispatch(fetchClasses());
  }, [dispatch]);

  useEffect(() => {
    if (studentData) {
      // Determine if this is a transfer student based on whether transfer fields have values
      const isTransferStudent = !!(studentData.dateOfLeaving || studentData.classInWhichLeft || studentData.reasonOfLeaving);
      
      setFormData({
        ...studentData,
        isTransferStudent,
        // Set default religion if not present in studentData
        religion: studentData.religion || 'Islam'
      });
      // If student has a photo, set the preview
      if (studentData.photo) {
        setPhotoPreview(studentData.photo);
      }
    }
  }, [studentData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for the isTransferStudent field
    if (name === 'isTransferStudent') {
      setFormData({
        ...formData,
        [name]: value
      });
      return;
    }
    
    setFormData({
      ...formData,
      [name]: value,
    });

    // Auto-populate monthly fees when class is selected (only for traditional schools)
    if (name === 'class' && !isNGOSchool) {
      const selectedClass = classes.find(cls => cls.name === value);
      if (selectedClass) {
        setFormData(prev => ({
          ...prev,
          class: value,
          monthlyFees: selectedClass.monthlyFees || '',
          section: '', // Reset section when class changes
        }));
      }
    }

    // Auto-calculate total fees when admission fees or monthly fees change (only for traditional schools)
    if ((name === 'admissionFees' || name === 'monthlyFees') && !isNGOSchool) {
      const admissionFees = name === 'admissionFees' ? value : formData.admissionFees;
      const monthlyFees = name === 'monthlyFees' ? value : formData.monthlyFees;
      const total = (parseFloat(admissionFees) || 0) + (parseFloat(monthlyFees) || 0);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        totalFees: total.toString(),
      }));
    }
  };

  const handlePhotoChange = (e) => {
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
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setPhotoFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // If this is a transfer student, validate the transfer fields
    if (formData.isTransferStudent) {
      if (!formData.dateOfLeaving || !formData.classInWhichLeft || !formData.reasonOfLeaving) {
        alert('Please fill all transfer student information fields');
        return;
      }
    }
    
    // Create form data to send to the backend
    const submissionData = { ...formData };
    
    // Handle photo upload logic
    let photoUploadError = false;
    
    // If there's a photo file, upload it to the server
    if (photoFile) {
      const formDataObj = new FormData();
      formDataObj.append('photo', photoFile);
      
      try {
        const response = await fetch(`${API_BASE_URL}/photos`, {
          method: 'POST',
          body: formDataObj
        });
        
        const result = await response.json();
        
        if (result.success) {
          // Store the URL of the uploaded photo
          submissionData.photo = result.url;
        } else {
          console.error('Photo upload failed:', result.error);
          alert('Failed to upload photo: ' + result.error);
          photoUploadError = true;
        }
      } catch (error) {
        console.error('Photo upload error:', error);
        alert('Failed to upload photo. Please try again.');
        photoUploadError = true;
      }
    } else if (photoPreview) {
      // If photoPreview exists, check if it's a URL or data URL
      if (photoPreview.startsWith('http')) {
        // If photoPreview is already a URL (from existing student data), keep it
        submissionData.photo = photoPreview;
      } else if (photoPreview.startsWith('data:')) {
        // If photoPreview is a data URL, we should not save it as-is
        // Instead, we should either upload the file or clear the photo
        // For now, we'll clear it to avoid storing base64 data
        submissionData.photo = '';
      }
    } else {
      // If no photo, clear the photo field
      submissionData.photo = '';
    }
    
    // If there was a photo upload error, don't proceed with form submission
    if (photoUploadError) {
      return;
    }
    
    // If not a transfer student, clear transfer fields
    if (!formData.isTransferStudent) {
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
      dispatch(updateStudent({ 
        id: studentData.id,  // Preserve the original ID
        ...studentData,      // Include all original data
        ...submissionData    // Override with updated data
      }));
    } else {
      // For new students, DO NOT include the ID so backend can generate it
      // Remove the ID field completely
      const { id, ...newStudentData } = submissionData;
      dispatch(addStudent(newStudentData));
    }
    // Close the form
    if (onClose) onClose();
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
  const classSections = formData.class 
    ? classes.find(cls => cls.name === formData.class)?.sections || []
    : [];

  if (showPrintView) {
    return (
      <div className="fixed inset-0 bg-white z-50 p-0 m-0 overflow-hidden">
        {/* Print Header - Hidden during actual printing */}
        <div className="print-header sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center no-print">
          <h3 className="text-xl font-semibold text-gray-900">Print Admission Form</h3>
          <div className="print-actions flex space-x-2 no-print">
            <button
              onClick={handlePrintAction}
              className="print-button inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 no-print"
            >
              Print
            </button>
            <button 
              onClick={closePrintView}
              className="print-button text-gray-500 hover:text-gray-700 no-print"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Print Content - This is what will actually be printed */}
        <div className="py-6 px-6">
          <PrintableAdmissionForm formData={formData} photoPreview={photoPreview} />
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">
            {isEditMode ? 'Edit Student' : 'Student Admission Form'}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="py-4 px-6">
          <div id="admission-form" className="bg-white">
            <form onSubmit={handleSubmit} className="space-y-6">
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
                            onChange={handlePhotoChange}
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
                            onClick={handleRemovePhoto}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <FaTrash className="mr-1.5 h-4 w-4" />
                            Remove Photo
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* First Name */}
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaUserGraduate className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md py-2"
                        placeholder="First Name"
                      />
                    </div>
                  </div>
                  
                  {/* Last Name */}
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaUserGraduate className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md py-2"
                        placeholder="Last Name"
                      />
                    </div>
                  </div>
                  
                  {/* GR Number */}
                  <div>
                    <label htmlFor="grNo" className="block text-sm font-medium text-gray-700">
                      GR Number <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaIdCard className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="grNo"
                        name="grNo"
                        value={formData.grNo || ''}
                        onChange={handleInputChange}
                        required
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md py-2"
                        placeholder="GR Number"
                      />
                    </div>
                  </div>
                  
                  {/* Religion */}
                  <div>
                    <label htmlFor="religion" className="block text-sm font-medium text-gray-700">
                      Religion <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaInfoCircle className="h-4 w-4 text-gray-400" />
                      </div>
                      <select
                        id="religion"
                        name="religion"
                        value={formData.religion}
                        onChange={handleInputChange}
                        required
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md py-2"
                      >
                        <option value="Islam">Islam</option>
                        <option value="Christianity">Christianity</option>
                        <option value="Hinduism">Hinduism</option>
                        <option value="Sikhism">Sikhism</option>
                        <option value="Buddhism">Buddhism</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Date of Birth */}
                  <div>
                    <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaCalendar className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        id="dateOfBirth"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        required
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md py-2"
                      />
                    </div>
                  </div>
                  
                  {/* Birth Place */}
                  <div>
                    <label htmlFor="birthPlace" className="block text-sm font-medium text-gray-700">
                      Birth Place
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaInfoCircle className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="birthPlace"
                        name="birthPlace"
                        value={formData.birthPlace || ''}
                        onChange={handleInputChange}
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md py-2"
                        placeholder="Birth Place"
                      />
                    </div>
                  </div>
                  
                  {/* Father's Name */}
                  <div>
                    <label htmlFor="fatherName" className="block text-sm font-medium text-gray-700">
                      Father's Name <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaUserGraduate className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="fatherName"
                        name="fatherName"
                        value={formData.fatherName}
                        onChange={handleInputChange}
                        required
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md py-2"
                        placeholder="Father's Name"
                      />
                    </div>
                  </div>
                  
                  {/* Parent Contact */}
                  <div>
                    <label htmlFor="parentContact" className="block text-sm font-medium text-gray-700">
                      Parent Contact <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaPhone className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        id="parentContact"
                        name="parentContact"
                        value={formData.parentContact}
                        onChange={handleInputChange}
                        required
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md py-2"
                        placeholder="Parent Contact"
                      />
                    </div>
                  </div>
                  
                  {/* Address */}
                  <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                      Address
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaInfoCircle className="h-4 w-4 text-gray-400" />
                      </div>
                      <textarea
                        id="address"
                        name="address"
                        rows={2}
                        value={formData.address || ''}
                        onChange={handleInputChange}
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md py-2"
                        placeholder="Address"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* School Information Section */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h2 className="text-md font-medium text-gray-900 mb-3">School Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Date of Admission */}
                  <div>
                    <label htmlFor="dateOfAdmission" className="block text-sm font-medium text-gray-700">
                      Date of Admission <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaCalendar className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        id="dateOfAdmission"
                        name="dateOfAdmission"
                        value={formData.dateOfAdmission}
                        onChange={handleInputChange}
                        required
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md py-2"
                      />
                    </div>
                  </div>
                  
                  {/* Class */}
                  <div>
                    <label htmlFor="class" className="block text-sm font-medium text-gray-700">
                      Class <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSchool className="h-4 w-4 text-gray-400" />
                      </div>
                      <select
                        id="class"
                        name="class"
                        value={formData.class}
                        onChange={handleInputChange}
                        required
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md py-2"
                      >
                        <option value="">Select Class</option>
                        {uniqueClasses.map(cls => (
                          <option key={cls} value={cls}>{cls}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {/* Section */}
                  <div>
                    <label htmlFor="section" className="block text-sm font-medium text-gray-700">
                      Section
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSchool className="h-4 w-4 text-gray-400" />
                      </div>
                      <select
                        id="section"
                        name="section"
                        value={formData.section}
                        onChange={handleInputChange}
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md py-2"
                      >
                        <option value="">Select Section</option>
                        {classSections.map(sec => (
                          <option key={sec.id} value={sec.name}>{sec.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {/* Last School Attended */}
                  <div>
                    <label htmlFor="lastSchoolAttended" className="block text-sm font-medium text-gray-700">
                      Last School Attended
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSchool className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="lastSchoolAttended"
                        name="lastSchoolAttended"
                        value={formData.lastSchoolAttended || ''}
                        onChange={handleInputChange}
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md py-2"
                        placeholder="Last School Attended"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Fees Information Section */}
              {!isNGOSchool && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h2 className="text-md font-medium text-gray-900 mb-3">Fees Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Monthly Fees */}
                    <div>
                      <label htmlFor="monthlyFees" className="block text-sm font-medium text-gray-700">
                        Monthly Fees (Rs)
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaMoneyBillWave className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          id="monthlyFees"
                          name="monthlyFees"
                          value={formData.monthlyFees}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md py-2"
                          placeholder="Monthly Fees"
                        />
                      </div>
                    </div>
                    
                    {/* Admission Fees */}
                    <div>
                      <label htmlFor="admissionFees" className="block text-sm font-medium text-gray-700">
                        Admission Fees (Rs)
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaMoneyBillWave className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          id="admissionFees"
                          name="admissionFees"
                          value={formData.admissionFees}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md py-2"
                          placeholder="Admission Fees"
                        />
                      </div>
                    </div>
                    
                    {/* Total Fees */}
                    <div>
                      <label htmlFor="totalFees" className="block text-sm font-medium text-gray-700">
                        Total Fees (Rs)
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaMoneyBillWave className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          id="totalFees"
                          name="totalFees"
                          value={formData.totalFees}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md py-2"
                          placeholder="Total Fees"
                        />
                      </div>
                    </div>
                    
                    {/* Fees Paid */}
                    <div>
                      <label htmlFor="feesPaid" className="block text-sm font-medium text-gray-700">
                        Fees Paid (Rs)
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaMoneyBillWave className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          id="feesPaid"
                          name="feesPaid"
                          value={formData.feesPaid}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md py-2"
                          placeholder="Fees Paid"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* NGO Funding Information */}
              {isNGOSchool && (
                <NGOFundingInfo />
              )}
              
              {/* Transfer Student Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <input
                    id="isTransferStudent"
                    name="isTransferStudent"
                    type="checkbox"
                    checked={formData.isTransferStudent}
                    onChange={(e) => handleInputChange({ target: { name: 'isTransferStudent', value: e.target.checked } })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isTransferStudent" className="ml-2 block text-sm font-medium text-gray-700">
                    Student coming from another school
                  </label>
                </div>
                
                {formData.isTransferStudent && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    {/* Date of Leaving Previous School */}
                    <div>
                      <label htmlFor="dateOfLeaving" className="block text-sm font-medium text-gray-700">
                        Date of Leaving Previous School
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaCalendar className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="date"
                          id="dateOfLeaving"
                          name="dateOfLeaving"
                          value={formData.dateOfLeaving || ''}
                          onChange={handleInputChange}
                          className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md py-2"
                        />
                      </div>
                    </div>
                    
                    {/* Class in Which Left */}
                    <div>
                      <label htmlFor="classInWhichLeft" className="block text-sm font-medium text-gray-700">
                        Class in Which Left
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaSchool className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="classInWhichLeft"
                          name="classInWhichLeft"
                          value={formData.classInWhichLeft || ''}
                          onChange={handleInputChange}
                          className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md py-2"
                          placeholder="Class in Which Left"
                        />
                      </div>
                    </div>
                    
                    {/* Reason of Leaving */}
                    <div className="md:col-span-2">
                      <label htmlFor="reasonOfLeaving" className="block text-sm font-medium text-gray-700">
                        Reason of Leaving
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaInfoCircle className="h-4 w-4 text-gray-400" />
                        </div>
                        <textarea
                          id="reasonOfLeaving"
                          name="reasonOfLeaving"
                          rows={2}
                          value={formData.reasonOfLeaving || ''}
                          onChange={handleInputChange}
                          className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md py-2"
                          placeholder="Reason of Leaving"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4">
                {isEditMode && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <FaTrash className="mr-2 h-4 w-4" />
                    Delete
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Print Preview
                </button>
                
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {isEditMode ? 'Update Student' : 'Add Student'}
                </button>
              </div>
            </form>
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
      />
    </div>
  );
};

export default AdmissionForm;