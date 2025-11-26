import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { addStudent, updateStudent } from '../store/studentsSlice';
import { fetchClasses } from '../store/classesSlice';
import { FaUserGraduate, FaIdCard, FaPhone, FaEnvelope, FaCalendar, FaSchool, FaMoneyBillWave, FaCamera, FaArrowLeft, FaPrint, FaUser, FaHome, FaMapMarker, FaMoon, FaSun, FaInfoCircle } from 'react-icons/fa';
import { API_BASE_URL, API_BASE_URL_PHOTO } from '../utils/apiConfig';
import { validateForm } from '../utils/validation';
import { admissionFormValidationRules } from '../utils/validation';
import PrintableAdmissionForm from './PrintableAdmissionForm';
import PageHeader from './common/PageHeader';
import { useSchoolFunding } from '../hooks/useSchoolFunding';
import FundingConditional from './common/FundingConditional';
import 'react-datepicker/dist/react-datepicker.css';

const AdmissionPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { classes } = useSelector(state => state.classes);
  const { students } = useSelector(state => state.students);
  const { isNGOSchool } = useSchoolFunding();
  const fileInputRef = useRef(null);
  
  // Check if we're editing an existing student
  const studentData = location.state?.studentData;
  const isEditMode = !!studentData;

  const getNextImageId = () => {
    // Get the last used image ID from localStorage or start at 1
    const lastId = localStorage.getItem('lastStudentImageId') || '0';
    const nextId = parseInt(lastId) + 1;
    // Save the new ID for next time
    localStorage.setItem('lastStudentImageId', nextId.toString());
    return nextId;
  };

  const [formData, setFormData] = useState({
    grNo: '',
    firstName: '',
    fatherName: '',
    lastName: '',
    photo: '',
    address: '',
    dateOfBirth: null,
    birthPlace: '',
    dateOfAdmission: new Date(),
    class: '',
    section: '',
    admissionFees: '',
    lastSchoolAttended: '',
    isTransferStudent: false,
    dateOfLeaving: null,
    classInWhichLeft: '',
    reasonOfLeaving: '',
    remarks: '',
    religion: 'Islam',
    parentContact: '' // Add parent contact number field
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [showPrintView, setShowPrintView] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(fetchClasses());
  }, [dispatch]);

  useEffect(() => {
    if (studentData) {
      // Determine if this is a transfer student based on whether transfer fields have values
      const isTransferStudent = !!(studentData.dateOfLeaving || studentData.classInWhichLeft || studentData.reasonOfLeaving);
      
      setFormData({
        ...studentData,
        dateOfBirth: studentData.dateOfBirth ? new Date(studentData.dateOfBirth) : null,
        dateOfAdmission: studentData.dateOfAdmission ? new Date(studentData.dateOfAdmission) : new Date(),
        dateOfLeaving: studentData.dateOfLeaving ? new Date(studentData.dateOfLeaving) : null,
        isTransferStudent,
        // Set default religion if not present in studentData
        religion: studentData.religion || 'Islam',
        // Set parentContact if present in studentData
        parentContact: studentData.parentContact || ''
      });
      // If student has a photo, set the preview
      if (studentData.photo) {
        setPhotoPreview(studentData.photo);
      }
    }
  }, [studentData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData({
      ...formData,
      [name]: newValue,
    });

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleDateChange = (date, name) => {
    setFormData({
      ...formData,
      [name]: date,
    });

    // Clear error for this field when user selects a date
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePhotoChange = async (e) => {
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

  const validateFormFields = () => {
    // Create a copy of the validation rules
    const validationRules = { ...admissionFormValidationRules };
    
    // Add validation rules for transfer student fields if the student is a transfer student
    if (formData.isTransferStudent) {
      validationRules.dateOfLeaving = [
        { type: 'required' },
        { type: 'date' }
      ];
      validationRules.classInWhichLeft = [
        { type: 'required' },
        { type: 'length', minLength: 1, maxLength: 50 }
      ];
      validationRules.reasonOfLeaving = [
        { type: 'required' },
        { type: 'length', minLength: 1, maxLength: 100 }
      ];
    }
    
    const formErrors = validateForm(formData, validationRules);
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submitting
    if (!validateFormFields()) {
      return;
    }
    
    try {
      // Handle photo upload logic
      let photoUrl = photoPreview || '';
      
      // If there's a photo file, upload it to the server
      if (photoFile) {
        const formDataObj = new FormData();
        formDataObj.append('photo', photoFile);
        
        try {
          const response = await fetch(API_BASE_URL_PHOTO, {
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
            alert('Failed to upload photo: ' + result.error);
            return;
          }
        } catch (error) {
          console.error('Photo upload error:', error);
          alert('Failed to upload photo. Please try again. Error: ' + error.message);
          return;
        }
      } else if (photoPreview) {
        // If photoPreview exists, check if it's a URL or data URL
        if (photoPreview.startsWith('http')) {
          // If photoPreview is already a URL (from existing student data), keep it
          photoUrl = photoPreview;
          console.log('Using existing photo URL:', photoPreview);
        } else if (photoPreview.startsWith('data:')) {
          // If photoPreview is a data URL, we should either upload the file or clear the photo
          // Since we don't have the file anymore, we'll clear it to avoid storing base64 data
          photoUrl = '';
          console.log('Clearing data URL photo');
        }
      } else {
        // If no photo, clear the photo field
        photoUrl = '';
        console.log('No photo provided, clearing photo field');
      }

      // Create form data to send to the backend
      const submissionData = { 
        ...formData,
        dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth.toISOString().split('T')[0] : '',
        dateOfAdmission: formData.dateOfAdmission ? formData.dateOfAdmission.toISOString().split('T')[0] : '',
        dateOfLeaving: formData.dateOfLeaving ? formData.dateOfLeaving.toISOString().split('T')[0] : '',
        photo: photoUrl
      };
      
      // If not a transfer student, clear transfer fields
      if (!formData.isTransferStudent) {
        submissionData.dateOfLeaving = '';
        submissionData.classInWhichLeft = '';
        submissionData.reasonOfLeaving = '';
      }
      
      console.log('Submitting student data:', submissionData);
      
      if (isEditMode) {
        // For editing, we need to preserve the original ID and other important fields
        dispatch(updateStudent({ 
          ...studentData,      // Include all original data
          ...submissionData,   // Override with updated data
          id: studentData.id   // Ensure ID is preserved at the end
        }));
      } else {
        dispatch(addStudent(submissionData));
      }
      
      // Navigate back to students page
      navigate('/students');
    } catch (error) {
      console.error('Form submission error:', error);
      alert('Failed to submit form. Please try again.');
    }
  };

  const handlePrint = () => {
    // Validate form before printing
    if (!validateFormFields()) {
      return;
    }
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
      <div className="inset-0 bg-white z-50 p-0 m-0">
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
    <div className={`min-h-screen ${showPrintView ? 'bg-white' : 'bg-gray-50'}`}>
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {showPrintView ? (
          <PrintableAdmissionForm 
            formData={formData} 
            photoPreview={photoPreview}
          />
        ) : (
          <div className="space-y-6">
            <PageHeader
              title={isEditMode ? "Edit Student" : "New Student Admission"}
              subtitle={isEditMode ? "Update student information" : "Add a new student to the system"}
              backButton={
                <button
                  onClick={() => navigate('/students')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FaArrowLeft className="mr-2" /> Back to Students
                </button>
              }
              actionButton={
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FaPrint className="mr-2" /> Print Form
                </button>
              }
            />

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white shadow rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Photo Upload Section */}
                  <div className="md:col-span-3">
                    <div className="flex flex-col items-start space-y-4 mb-6">
                      <div className="flex-shrink-0">
                        {photoPreview ? (
                          <img 
                            src={photoPreview} 
                            alt="Student Preview" 
                            className="h-24 w-24 rounded-xl object-cover border-2 border-gray-300 shadow-sm"
                          />
                        ) : (
                          <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl w-24 h-24 flex items-center justify-center">
                            <FaCamera className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col space-y-3">
                        <div className="flex flex-col">
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handlePhotoChange}
                            accept="image/*"
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                          >
                            <FaCamera className="mr-2 h-4 w-4" />
                            {photoPreview ? 'Change Photo' : 'Upload Photo'}
                          </button>
                          <p className="text-xs text-gray-500 mt-1">JPEG, PNG up to 5MB</p>
                        </div>
                        {photoPreview && (
                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition"
                          >
                            Remove Photo
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GR Numbers
                    </label>
                    <input
                      type="text"
                      name="grNo"
                      value={formData.grNo}
                      onChange={handleInputChange}
                      className={`block w-full px-4 py-2.5 border ${errors.grNo ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition`}
                      placeholder="Enter GR Number"
                    />
                    {errors.grNo && (
                      <p className="mt-1 text-sm text-red-600">{errors.grNo}</p>
                    )}
                   
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`block w-full px-4 py-2.5 border ${errors.firstName ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition`}
                      placeholder="Enter Student Name"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                    )}
                   
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`block w-full px-4 py-2.5 border ${errors.lastName ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition`}
                      placeholder="Enter Student Name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Father's Name
                    </label>
                    <input
                      type="text"
                      name="fatherName"
                      value={formData.fatherName}
                      onChange={handleInputChange}
                      className={`block w-full px-4 py-2.5 border ${errors.fatherName ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition`}
                      placeholder="Enter Father's Name"
                    />
                    {errors.fatherName && (
                      <p className="mt-1 text-sm text-red-600">{errors.fatherName}</p>
                    )}
                   
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Parent Contact Number
                    </label>
                    <input
                      type="tel"
                      name="parentContact"
                      value={formData.parentContact}
                      onChange={handleInputChange}
                      className={`block w-full px-4 py-2.5 border ${errors.parentContact ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition`}
                      placeholder="Enter Parent Contact Number"
                    />
                    {errors.parentContact && (
                      <p className="mt-1 text-sm text-red-600">{errors.parentContact}</p>
                    )}
                   
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Religion
                    </label>
                    <select
                      name="religion"
                      value={formData.religion}
                      onChange={handleInputChange}
                      className={`block w-full px-4 py-2.5 border ${errors.religion ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition`}
                    >
                      <option value="">Select Religion</option>
                      <option value="Islam">Islam</option>
                      <option value="Hindu">Hindu</option>
                      <option value="Christian">Christian</option>
                      <option value="Others">Others</option>
                    </select>
                    {errors.religion && (
                      <p className="mt-1 text-sm text-red-600">{errors.religion}</p>
                    )}
                   
                  </div>
                  {/* Class and Section Fields in a single column */}
                  <div className="md:col-span-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Class Field */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Class
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaSchool className="h-5 w-5 text-gray-400" />
                          </div>
                          <select
                            name="class"
                            value={formData.class}
                            onChange={handleInputChange}
                            className={`block w-full pl-10 pr-3 py-2 border ${errors.class ? 'border-red-300' : 'border-gray-300'} rounded-md focus:ring-blue-500 focus:border-blue-500`}
                          >
                            <option value="">Select Class</option>
                            {uniqueClasses.map((cls) => (
                              <option key={cls} value={cls}>{cls}</option>
                            ))}
                          </select>
                        </div>
                        {errors.class && (
                          <p className="mt-1 text-sm text-red-600">{errors.class}</p>
                        )}
                       
                      </div>

                      {/* Section Field */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Section
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaSchool className="h-5 w-5 text-gray-400" />
                          </div>
                          <select
                            name="section"
                            value={formData.section}
                            onChange={handleInputChange}
                            disabled={!formData.class}
                            className={`block w-full pl-10 pr-3 py-2 border ${errors.section ? 'border-red-300' : 'border-gray-300'} rounded-md focus:ring-blue-500 focus:border-blue-500 ${!formData.class ? 'bg-gray-100' : ''}`}
                          >
                            <option value="">Select Section</option>
                            {classSections.map((section) => (
                              <option key={section.id} value={section.name}>{section.name}</option>
                            ))}
                          </select>
                        </div>
                        {errors.section && (
                          <p className="mt-1 text-sm text-red-600">{errors.section}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Address field spanning full width */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`block w-full px-4 py-2 border ${errors.address ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition`}
                      placeholder="Enter Full Address"
                    />
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <div className={`relative rounded-lg shadow-sm ${errors.dateOfBirth ? 'border border-red-300 rounded-lg' : ''}`}>
                      <DatePicker
                        selected={formData.dateOfBirth}
                        onChange={(date) => handleDateChange(date, 'dateOfBirth')}
                        className={`block w-full px-4 py-2.5 border ${errors.dateOfBirth ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500 transition`}
                        placeholderText="Select Date of Birth"
                        showYearDropdown
                        scrollableYearDropdown
                        yearDropdownItemNumber={100}
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <FaCalendar className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                    {errors.dateOfBirth && (
                      <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Place of Birth
                    </label>
                    <input
                      type="text"
                      name="birthPlace"
                      value={formData.birthPlace}
                      onChange={handleInputChange}
                      className={`block w-full px-4 py-2.5 border ${errors.birthPlace ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition`}
                      placeholder="Enter Place of Birth"
                    />
                    {errors.birthPlace && (
                      <p className="mt-1 text-sm text-red-600">{errors.birthPlace}</p>
                    )}
                  </div>
                  
                  
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Admission
                    </label>
                    <div className={`relative rounded-lg shadow-sm ${errors.dateOfAdmission ? 'border border-red-300 rounded-lg' : ''}`}>
                      <DatePicker
                        selected={formData.dateOfAdmission}
                        onChange={(date) => handleDateChange(date, 'dateOfAdmission')}
                        className={`block w-full px-4 py-2.5 border ${errors.dateOfAdmission ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500 transition`}
                        placeholderText="Select Date of Admission"
                        showYearDropdown
                        scrollableYearDropdown
                        yearDropdownItemNumber={100}
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <FaCalendar className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                    {errors.dateOfAdmission && (
                      <p className="mt-1 text-sm text-red-600">{errors.dateOfAdmission}</p>
                    )}
                  </div>
                  
                  

                  {/* Transfer Student Information Toggle */}
                  <div className="md:col-span-3 bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isTransferStudent"
                        name="isTransferStudent"
                        checked={formData.isTransferStudent}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="isTransferStudent" className="ml-2 block text-sm font-medium text-gray-700">
                        Student is transferring from another school
                      </label>
                      <FaInfoCircle className="ml-2 h-4 w-4 text-blue-500" title="Check this box if the student is coming from another school" />
                    </div>
                  </div>

                  {/* Transfer Student Information (Only shown when isTransferStudent is true) */}
                  {formData.isTransferStudent && (
                    <>
                      <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Attended School
                    </label>
                    <input
                      type="text"
                      name="lastSchoolAttended"
                      value={formData.lastSchoolAttended}
                      onChange={handleInputChange}
                      className={`block w-full px-4 py-2.5 border ${errors.lastSchoolAttended ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition`}
                      placeholder="Enter Last School Attended"
                    />
                    {errors.lastSchoolAttended && (
                      <p className="mt-1 text-sm text-red-600">{errors.lastSchoolAttended}</p>
                    )}
                  </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date of Removal Last School <span className="text-red-500">*</span>
                        </label>
                        <div className={`relative rounded-lg shadow-sm ${errors.dateOfLeaving ? 'border border-red-300 rounded-lg' : ''}`}>
                          <DatePicker
                            selected={formData.dateOfLeaving}
                            onChange={(date) => handleDateChange(date, 'dateOfLeaving')}
                            className={`block w-full px-4 py-2.5 border ${errors.dateOfLeaving ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500 transition`}
                            placeholderText="Select Date of Removal"
                            showYearDropdown
                            scrollableYearDropdown
                            yearDropdownItemNumber={100}
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <FaCalendar className="h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                        {errors.dateOfLeaving && (
                          <p className="mt-1 text-sm text-red-600">{errors.dateOfLeaving}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Class in Previous School <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="classInWhichLeft"
                          value={formData.classInWhichLeft}
                          onChange={handleInputChange}
                          className={`block w-full px-4 py-2.5 border ${errors.classInWhichLeft ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500 transition`}
                          placeholder="Enter Class at time of removal"
                        />
                        {errors.classInWhichLeft && (
                          <p className="mt-1 text-sm text-red-600">{errors.classInWhichLeft}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Reason for leaving Last School <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="reasonOfLeaving"
                          value={formData.reasonOfLeaving}
                          onChange={handleInputChange}
                          className={`block w-full px-4 py-2.5 border ${errors.reasonOfLeaving ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500 transition`}
                          placeholder="Enter Reason for leaving"
                        />
                        {errors.reasonOfLeaving && (
                          <p className="mt-1 text-sm text-red-600">{errors.reasonOfLeaving}</p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last School Remarks
                    </label>
                    <input
                      type="text"
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleInputChange}
                      className={`block w-full px-4 py-2.5 border ${errors.remarks ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500 transition`}
                      placeholder="Enter Remarks"
                    />
                    {errors.remarks && (
                      <p className="mt-1 text-sm text-red-600">{errors.remarks}</p>
                    )}
                  </div>
                    </>
                  )}
                  
                  
                </div>
              </div>
              
              {/* Fee Information Section - Only for traditional schools */}
              <FundingConditional showFor="traditional">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">Fee Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Admission Fees
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaMoneyBillWave className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          name="admissionFees"
                          value={formData.admissionFees}
                          onChange={handleInputChange}
                          className={`block w-full pl-10 pr-3 py-2.5 border ${errors.admissionFees ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500 transition`}
                          placeholder="Enter Admission Fees"
                        />
                      </div>
                      {errors.admissionFees && (
                        <p className="mt-1 text-sm text-red-600">{errors.admissionFees}</p>
                      )}
                    </div>
                  </div>
                </div>
              </FundingConditional>
              
              {/* NGO Funding Section - Only for NGO schools */}
              <FundingConditional showFor="ngo">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">NGO Funding</h2>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-4">
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <FaInfoCircle className="h-5 w-5 text-blue-500" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-blue-700">
                              This school is funded by quarterly NGO subsidies. No fees are charged to students.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </FundingConditional>
              
              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => navigate('/students')}
                  className="inline-flex items-center px-5 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center px-5 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition"
                >
                  <FaPrint className="mr-2" />
                  Print Form
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                >
                  {isEditMode ? 'Update Student' : 'Save Student'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdmissionPage;