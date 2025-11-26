import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { FaCertificate, FaDownload, FaPrint, FaUser, FaSchool, FaClipboardList } from 'react-icons/fa';
import { updateStudent, markStudentAsLeft } from '../../store/studentsSlice';
import PrintableCertificate from './PrintableCertificate';

const CertificateGenerator = ({ student, onClose }) => {
  const dispatch = useDispatch();
  const [certificateType, setCertificateType] = useState('leaving');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [characterDetails, setCharacterDetails] = useState('is a student of good moral character and has shown consistent academic performance throughout their time at our institution.');
  const [showPrintView, setShowPrintView] = useState(false);
  
  // Leaving certificate specific fields
  const [leavingCertificateData, setLeavingCertificateData] = useState({
    serialNo: '',
    grNo: student.grNo || '',
    studentName: `${student.firstName} ${student.lastName}`,
    fatherName: student.fatherName || '',
    caste: student.religion || '',
    placeOfBirth: student.birthPlace || '',
    dateOfBirth: student.dateOfBirth || '',
    dateOfBirthWords: '',
    dateOfAdmission: student.dateOfAdmission || '',
    lastClassAttended: student.class || '',
    dateOfLeaving: new Date().toISOString().split('T')[0],
    lastSchoolAttended: student.lastSchoolAttended || '',
    standardStudying: student.class || '',
    reasonForLeaving: '',
    attendance: '',
    remarks: student.remarks || ''
  });

  // Auto-generate serial number and format date of birth in words
  useEffect(() => {
    // Generate serial number based on current year and student ID
    const year = new Date().getFullYear();
    const serialNo = `SL-${year}-${student.id}`;
    setLeavingCertificateData(prev => ({
      ...prev,
      serialNo: serialNo
    }));
    
    // Auto-format date of birth in words if date of birth is available
    if (student.dateOfBirth) {
      const formattedDate = formatDateToWords(student.dateOfBirth);
      setLeavingCertificateData(prev => ({
        ...prev,
        dateOfBirth: student.dateOfBirth,
        dateOfBirthWords: formattedDate
      }));
    }
  }, [student]);

  const handleGenerateCertificate = () => {
    // If generating a leaving certificate, update the student status
    if (certificateType === 'leaving') {
      const updatedStudent = {
        ...student,
        leavingDate: issueDate,
        leavingReason: reason
      };
      
      dispatch(markStudentAsLeft(updatedStudent));
    }
    
    // If generating a pass certificate, update the student status to passed_out
    if (certificateType === 'pass') {
      const updatedStudent = {
        ...student,
        status: 'passed_out',
        passDate: issueDate,
        passDetails: reason
      };
      
      dispatch(updateStudent(updatedStudent));
    }
    
    setShowPrintView(true);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatDateToWords = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    // Simple day suffix (1st, 2nd, 3rd, etc.)
    let daySuffix = 'th';
    if (day === 1 || day === 21 || day === 31) daySuffix = 'st';
    else if (day === 2 || day === 22) daySuffix = 'nd';
    else if (day === 3 || day === 23) daySuffix = 'rd';
    
    return `${day}${daySuffix} day of ${month}, ${year}`;
  };

  const handleLeavingDataChange = (field, value) => {
    setLeavingCertificateData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Auto-update date in words when date of birth changes
    if (field === 'dateOfBirth') {
      setLeavingCertificateData(prev => ({
        ...prev,
        dateOfBirthWords: formatDateToWords(value)
      }));
    }
  };

  if (showPrintView) {
    return (
      <PrintableCertificate
        student={student}
        certificateType={certificateType}
        issueDate={issueDate}
        reason={reason}
        characterDetails={characterDetails}
        leavingCertificateData={leavingCertificateData}
        onClose={() => {
          setShowPrintView(false);
          onClose();
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
        <div className="mt-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              <FaCertificate className="inline mr-2 text-blue-600" />
              Generate Certificate
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="text-2xl">&times;</span>
            </button>
          </div>
          
          <div className="mt-4">
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="font-medium text-gray-900">Student Information</h4>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Name:</span>
                  <span className="ml-2 font-medium">{student.firstName} {student.lastName}</span>
                </div>
                <div>
                  <span className="text-gray-500">Student ID:</span>
                  <span className="ml-2 font-medium">{student.id}</span>
                </div>
                <div>
                  <span className="text-gray-500">Class:</span>
                  <span className="ml-2 font-medium">{student.class} - Section {student.section}</span>
                </div>
                <div>
                  <span className="text-gray-500">Admission Date:</span>
                  <span className="ml-2 font-medium">{formatDate(student.dateOfAdmission)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Certificate Type
                </label>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => setCertificateType('leaving')}
                    className={`px-4 py-2 border rounded-md text-sm font-medium ${
                      certificateType === 'leaving'
                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Leaving Certificate
                  </button>
                  <button
                    type="button"
                    onClick={() => setCertificateType('pass')}
                    className={`px-4 py-2 border rounded-md text-sm font-medium ${
                      certificateType === 'pass'
                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Pass Certificate
                  </button>
                  <button
                    type="button"
                    onClick={() => setCertificateType('character')}
                    className={`px-4 py-2 border rounded-md text-sm font-medium ${
                      certificateType === 'character'
                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Character Certificate
                  </button>
                </div>
              </div>

              {certificateType === 'leaving' && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-3">Leaving Certificate Details</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label htmlFor="serialNo" className="block text-sm font-medium text-gray-700 mb-1">
                        Serial No
                      </label>
                      <input
                        type="text"
                        id="serialNo"
                        value={leavingCertificateData.serialNo}
                        onChange={(e) => handleLeavingDataChange('serialNo', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        readOnly
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="grNo" className="block text-sm font-medium text-gray-700 mb-1">
                        G.R No
                      </label>
                      <input
                        type="text"
                        id="grNo"
                        value={leavingCertificateData.grNo}
                        onChange={(e) => handleLeavingDataChange('grNo', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-1">
                        Student Name
                      </label>
                      <input
                        type="text"
                        id="studentName"
                        value={leavingCertificateData.studentName}
                        onChange={(e) => handleLeavingDataChange('studentName', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="fatherName" className="block text-sm font-medium text-gray-700 mb-1">
                        Father's Name
                      </label>
                      <input
                        type="text"
                        id="fatherName"
                        value={leavingCertificateData.fatherName}
                        onChange={(e) => handleLeavingDataChange('fatherName', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="caste" className="block text-sm font-medium text-gray-700 mb-1">
                        Caste
                      </label>
                      <input
                        type="text"
                        id="caste"
                        value={leavingCertificateData.caste}
                        onChange={(e) => handleLeavingDataChange('caste', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="placeOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                        Place of Birth
                      </label>
                      <input
                        type="text"
                        id="placeOfBirth"
                        value={leavingCertificateData.placeOfBirth}
                        onChange={(e) => handleLeavingDataChange('placeOfBirth', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth (in Figure)
                      </label>
                      <input
                        type="date"
                        id="dateOfBirth"
                        value={leavingCertificateData.dateOfBirth}
                        onChange={(e) => handleLeavingDataChange('dateOfBirth', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="dateOfBirthWords" className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth (in Words)
                      </label>
                      <input
                        type="text"
                        id="dateOfBirthWords"
                        value={leavingCertificateData.dateOfBirthWords}
                        onChange={(e) => handleLeavingDataChange('dateOfBirthWords', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="dateOfAdmission" className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Admission
                      </label>
                      <input
                        type="date"
                        id="dateOfAdmission"
                        value={leavingCertificateData.dateOfAdmission}
                        onChange={(e) => handleLeavingDataChange('dateOfAdmission', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="lastClassAttended" className="block text-sm font-medium text-gray-700 mb-1">
                        Last Class Attended
                      </label>
                      <input
                        type="text"
                        id="lastClassAttended"
                        value={leavingCertificateData.lastClassAttended}
                        onChange={(e) => handleLeavingDataChange('lastClassAttended', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="dateOfLeaving" className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Leaving School
                      </label>
                      <input
                        type="date"
                        id="dateOfLeaving"
                        value={leavingCertificateData.dateOfLeaving}
                        onChange={(e) => handleLeavingDataChange('dateOfLeaving', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="lastSchoolAttended" className="block text-sm font-medium text-gray-700 mb-1">
                        Last School Attended
                      </label>
                      <input
                        type="text"
                        id="lastSchoolAttended"
                        value={leavingCertificateData.lastSchoolAttended}
                        onChange={(e) => handleLeavingDataChange('lastSchoolAttended', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="standardStudying" className="block text-sm font-medium text-gray-700 mb-1">
                        Standard in which studying
                      </label>
                      <input
                        type="text"
                        id="standardStudying"
                        value={leavingCertificateData.standardStudying}
                        onChange={(e) => handleLeavingDataChange('standardStudying', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="reasonForLeaving" className="block text-sm font-medium text-gray-700 mb-1">
                        Reason for Leaving
                      </label>
                      <input
                        type="text"
                        id="reasonForLeaving"
                        value={leavingCertificateData.reasonForLeaving}
                        onChange={(e) => handleLeavingDataChange('reasonForLeaving', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="attendance" className="block text-sm font-medium text-gray-700 mb-1">
                        Attendance
                      </label>
                      <input
                        type="text"
                        id="attendance"
                        value={leavingCertificateData.attendance}
                        onChange={(e) => handleLeavingDataChange('attendance', e.target.value)}
                        placeholder="e.g., 95%"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">
                        Remarks
                      </label>
                      <input
                        type="text"
                        id="remarks"
                        value={leavingCertificateData.remarks}
                        onChange={(e) => handleLeavingDataChange('remarks', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Issue Date
                </label>
                <input
                  type="date"
                  id="issueDate"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {certificateType === 'leaving' ? (
                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for Leaving (Optional)
                  </label>
                  <textarea
                    id="reason"
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Enter reason for leaving the school..."
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              ) : (
                <div>
                  <label htmlFor="characterDetails" className="block text-sm font-medium text-gray-700 mb-1">
                    Character Details
                  </label>
                  <textarea
                    id="characterDetails"
                    rows={4}
                    value={characterDetails}
                    onChange={(e) => setCharacterDetails(e.target.value)}
                    placeholder="Enter details about the student's character, conduct, and achievements..."
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                  <FaClipboardList className="mr-2" /> Certificate Preview
                </h4>
                <div className="border-2 border-dashed border-blue-200 rounded-lg p-4">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {certificateType === 'leaving' ? 'SCHOOL LEAVING CERTIFICATE' : 
                       certificateType === 'pass' ? 'PASS CERTIFICATE' : 
                       'CHARACTER CERTIFICATE'}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">This is to certify that</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {certificateType === 'leaving' && leavingCertificateData.studentName 
                        ? leavingCertificateData.studentName 
                        : `${student.firstName} ${student.lastName}`}
                    </p>
                    
                    {certificateType === 'leaving' ? (
                      <div className="mt-4">
                        {/* Student Information Preview for Leaving Certificate */}
                        <div className="bg-gray-50 p-4 rounded border border-gray-300 mb-6 text-left">
                          <h4 className="font-bold text-gray-800 mb-3 text-center">Student Information</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div className="flex">
                              <span className="font-medium w-32">Serial No:</span>
                              <span>{leavingCertificateData.serialNo || 'N/A'}</span>
                            </div>
                            <div className="flex">
                              <span className="font-medium w-32">G.R No:</span>
                              <span>{leavingCertificateData.grNo || 'N/A'}</span>
                            </div>
                            <div className="flex">
                              <span className="font-medium w-32">Student Name:</span>
                              <span>{leavingCertificateData.studentName || 'N/A'}</span>
                            </div>
                            <div className="flex">
                              <span className="font-medium w-32">Father's Name:</span>
                              <span>{leavingCertificateData.fatherName || 'N/A'}</span>
                            </div>
                            <div className="flex">
                              <span className="font-medium w-32">Caste:</span>
                              <span>{leavingCertificateData.caste || 'N/A'}</span>
                            </div>
                            <div className="flex">
                              <span className="font-medium w-32">Place of Birth:</span>
                              <span>{leavingCertificateData.placeOfBirth || 'N/A'}</span>
                            </div>
                            <div className="flex">
                              <span className="font-medium w-32">Date of Birth:</span>
                              <span>{leavingCertificateData.dateOfBirth || 'N/A'}</span>
                            </div>
                            <div className="flex">
                              <span className="font-medium w-32">Date in Words:</span>
                              <span>{leavingCertificateData.dateOfBirthWords || 'N/A'}</span>
                            </div>
                            <div className="flex">
                              <span className="font-medium w-32">Date of Admission:</span>
                              <span>{leavingCertificateData.dateOfAdmission || 'N/A'}</span>
                            </div>
                            <div className="flex">
                              <span className="font-medium w-32">Last Class:</span>
                              <span>{leavingCertificateData.lastClassAttended || 'N/A'}</span>
                            </div>
                            <div className="flex">
                              <span className="font-medium w-32">Date of Leaving:</span>
                              <span>{leavingCertificateData.dateOfLeaving || 'N/A'}</span>
                            </div>
                            <div className="flex">
                              <span className="font-medium w-32">Last School:</span>
                              <span>{leavingCertificateData.lastSchoolAttended || 'N/A'}</span>
                            </div>
                            <div className="flex">
                              <span className="font-medium w-32">Standard:</span>
                              <span>{leavingCertificateData.standardStudying || 'N/A'}</span>
                            </div>
                            <div className="flex">
                              <span className="font-medium w-32">Reason:</span>
                              <span>{leavingCertificateData.reasonForLeaving || 'N/A'}</span>
                            </div>
                            <div className="flex">
                              <span className="font-medium w-32">Attendance:</span>
                              <span>{leavingCertificateData.attendance || 'N/A'}</span>
                            </div>
                            <div className="flex">
                              <span className="font-medium w-32">Remarks:</span>
                              <span>{leavingCertificateData.remarks || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-700">
                          <p className="text-center mb-2">
                            was a bonafide student of this school and has left the institution on{' '}
                            <span className="font-medium">
                              {leavingCertificateData.dateOfLeaving 
                                ? formatDate(leavingCertificateData.dateOfLeaving) 
                                : formatDate(issueDate)}
                            </span>.
                          </p>
                          {(leavingCertificateData.reasonForLeaving || reason) && (
                            <p className="text-center">
                              Reason: <span className="font-medium">
                                {leavingCertificateData.reasonForLeaving || reason}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    ) : certificateType === 'pass' ? (
                      <div className="mt-4 text-sm text-gray-700">
                        <p>
                          has successfully passed the final examination and is awarded this certificate on{' '}
                          <span className="font-medium">{formatDate(issueDate)}</span>.
                        </p>
                        {reason && (
                          <p className="mt-2">
                            Additional Details: <span className="font-medium">{reason}</span>
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="mt-4 text-sm text-gray-700">
                        {characterDetails && (
                          <p className="mt-2 font-medium">{characterDetails}</p>
                        )}
                      </div>
                    )}
                    
                    <div className="mt-6 flex justify-between text-sm text-gray-600">
                      <div>
                        <p>Date: {formatDate(issueDate)}</p>
                      </div>
                      <div>
                        <p>Principal's Signature</p>
                        <div className="mt-8 border-t border-gray-400 pt-2">Principal</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerateCertificate}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaPrint className="mr-2" />
                Generate & Print Certificate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateGenerator;