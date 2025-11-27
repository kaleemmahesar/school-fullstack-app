import React, { useState, useEffect, useRef } from 'react';
import { FaUser, FaPhone, FaBriefcase, FaDollarSign, FaCalendar, FaChalkboardTeacher, FaTimes, FaCamera, FaTrash } from 'react-icons/fa';
import { API_BASE_URL } from '../utils/apiConfig';

const StaffFormModal = ({ onClose, onSubmit, staffData, classes }) => {
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    contactNumber: '',
    position: '',
    salary: '',
    dateOfJoining: '',
    jobType: 'Teaching', // Default to Teaching
    subject: '', // For teachers only
    photo: null, // Add photo field
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const isEditMode = !!staffData;

  useEffect(() => {
    if (staffData) {
      setFormData({
        ...staffData,
        contactNumber: staffData.contactNumber || staffData.phone || '', // Use contactNumber if available, otherwise phone
        jobType: staffData.position && (staffData.position.toLowerCase().includes('teacher') || staffData.position.toLowerCase().includes('professor')) 
          ? 'Teaching' 
          : 'Non-Teaching',
        subject: staffData.subject || '', // Assuming we add this field to staff data
      });
      // If staff has a photo, set the preview
      if (staffData.photo) {
        setPhotoPreview(staffData.photo);
      }
    } else {
      // For new staff members, set the date of joining to today's date
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        dateOfJoining: today
      }));
    }
  }, [staffData]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Handle photo upload logic
    let photoUrl = photoPreview || '';
    
    // If there's a photo file, upload it to the server
    if (photoFile) {
      const formDataObj = new FormData();
      formDataObj.append('photo', photoFile);
      
      try {
        const response = await fetch(`${API_BASE_URL}/photos`, {
          method: 'POST',
          body: formDataObj
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
          // Store the URL of the uploaded photo
          photoUrl = result.url;
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
        // If photoPreview is already a URL (from existing staff data), keep it
        photoUrl = photoPreview;
      } else if (photoPreview.startsWith('data:')) {
        // If photoPreview is a data URL, we should not save it as-is
        // Instead, we should either upload the file or clear the photo
        // For now, we'll clear it to avoid storing base64 data
        photoUrl = '';
      }
    } else {
      // If no photo, clear the photo field
      photoUrl = '';
    }
    
    // Prepare data for submission
    const submissionData = {
      ...formData,
      // Include jobType and subject directly in the submission data
      jobType: formData.jobType,
      subject: formData.jobType === 'Teaching' ? formData.subject : null,
      // For teaching staff, use the subject as part of the position
      position: formData.jobType === 'Teaching' ? 
        (formData.subject ? `${formData.subject} Teacher` : 'Teacher') : 
        formData.position,
      photo: photoUrl
    };
    
    onSubmit(submissionData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Reset subject field when job type changes to Non-Teaching
    if (name === 'jobType' && value === 'Non-Teaching') {
      setFormData(prev => ({
        ...prev,
        subject: ''
      }));
    }
  };

  // Get all unique subjects from classes
  const getAllSubjects = () => {
    if (!classes || !Array.isArray(classes)) return [];
    
    const subjects = new Set();
    classes.forEach(cls => {
      if (cls.subjects && Array.isArray(cls.subjects)) {
        cls.subjects.forEach(subject => {
          if (subject.name) {
            subjects.add(subject.name);
          }
        });
      }
    });
    return Array.from(subjects).sort();
  };

  const allSubjects = getAllSubjects();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">
            {isEditMode ? 'Edit Staff Member' : 'Add New Staff Member'}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Photo Upload Section */}
            <div className="bg-gray-50 rounded-lg p-3">
              <label className="block text-xs font-medium text-gray-700 mb-2">Staff Photo</label>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {photoPreview ? (
                    <img 
                      src={photoPreview} 
                      alt="Staff Preview" 
                      className="h-20 w-20 rounded-lg object-cover border border-gray-300"
                    />
                  ) : (
                    <div className="bg-gray-200 border border-dashed border-gray-300 rounded-lg w-20 h-20 flex items-center justify-center">
                      <FaCamera className="h-5 w-5 text-gray-400" />
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
                      className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500"
                      aria-describedby="photo-upload-help"
                    >
                      <FaCamera className="mr-1 h-3 w-3" />
                      {photoPreview ? 'Change Photo' : 'Upload Photo'}
                    </button>
                    <p id="photo-upload-help" className="text-xs text-gray-500 mt-1">JPEG, PNG up to 5MB</p>
                  </div>
                  {photoPreview && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg text-red-700 bg-white border border-gray-300 hover:bg-red-50 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-red-500"
                    >
                      <FaTrash className="mr-1 h-3 w-3" />
                      Remove Photo
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column - Name Fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                        <FaUser className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="block w-full pl-7 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="First Name"
                        required
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                        <FaUser className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="block w-full pl-7 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Last Name"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <FaPhone className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleInputChange}
                      className="block w-full pl-7 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Salary</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <FaDollarSign className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      name="salary"
                      value={formData.salary}
                      onChange={handleInputChange}
                      className="block w-full pl-7 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="4000"
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* Right Column - Job Details */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Job Type</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <FaBriefcase className="h-4 w-4 text-gray-400" />
                    </div>
                    <select
                      name="jobType"
                      value={formData.jobType}
                      onChange={handleInputChange}
                      className="block w-full pl-7 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 appearance-none"
                      required
                    >
                      <option value="Teaching">Teaching</option>
                      <option value="Non-Teaching">Non-Teaching</option>
                    </select>
                  </div>
                </div>
                
                {formData.jobType === 'Teaching' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Subject Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                        <FaChalkboardTeacher className="h-4 w-4 text-gray-400" />
                      </div>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="block w-full pl-7 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 appearance-none"
                        required
                      >
                        <option value="">Select Subject</option>
                        {allSubjects.map((subject) => (
                          <option key={subject} value={subject}>
                            {subject}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
                
                {formData.jobType === 'Non-Teaching' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Position</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                        <FaBriefcase className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="position"
                        value={formData.position}
                        onChange={handleInputChange}
                        className="block w-full pl-7 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Accountant"
                        required
                      />
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Date of Joining</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <FaCalendar className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      name="dateOfJoining"
                      value={formData.dateOfJoining}
                      onChange={handleInputChange}
                      className="block w-full pl-7 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
              >
                {isEditMode ? 'Update Staff' : 'Add Staff'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StaffFormModal;