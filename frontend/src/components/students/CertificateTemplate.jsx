import React from 'react';
import { FaSchool, FaUser, FaClipboardList } from 'react-icons/fa';
import { useSelector } from 'react-redux';

const CertificateTemplate = ({ 
  student, 
  certificateType, 
  issueDate, 
  reason = '', 
  characterDetails = '',
  leavingCertificateData = null,
  schoolInfo,
  schoolName,
  schoolAddress,
  principalName = 'Principal',
  phoneNumber
}) => {
  // Use school info from props with fallback defaults
  const safeSchoolInfo = {
    schoolName: schoolInfo?.schoolName || schoolInfo?.name || "School Management System",
    schoolAddress: schoolInfo?.schoolAddress || schoolInfo?.address || "123 Education Street, Learning City",
    schoolPhone: schoolInfo?.schoolPhone || schoolInfo?.phone || "+1 (555) 123-4567"
  };
  
  // Use provided values or fall back to schoolInfo
  const finalSchoolName = schoolName || safeSchoolInfo.schoolName || "School Management System";
  const finalSchoolAddress = schoolAddress || safeSchoolInfo.schoolAddress || "123 Education Street, Learning City";
  const finalPhoneNumber = phoneNumber || safeSchoolInfo.schoolPhone || "+1 (555) 123-4567";

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // For leaving certificates, use the enhanced template with all required fields
  if (certificateType === 'leaving' && leavingCertificateData) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-4xl mx-auto border-4 border-blue-800 rounded-lg p-8 bg-white certificate-print-view">
          {/* Certificate Header */}
          <div className="text-center border-b border-gray-300 pb-3 mb-4 print:hidden">
            <div className="flex items-center justify-center mb-2">
              <FaSchool className="text-blue-600 text-xl mr-3" />
              <h1 className="text-xl font-bold text-gray-800">{finalSchoolName}</h1>
            </div>
            <p className="text-gray-600 text-sm mb-1">{finalSchoolAddress}</p>
            <p className="text-gray-600 text-sm">Phone: {finalPhoneNumber}</p>
          </div>

          {/* Certificate Title */}
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2">
              SCHOOL LEAVING CERTIFICATE
            </h2>
          </div>

          {/* Certificate Content */}
          <div className="mb-10">
            <p className="text-lg text-gray-700 text-center mb-6">
              This is to certify that
            </p>
            
            <div className="text-center mb-8">
              <p className="text-2xl font-bold text-gray-900 mb-2">
                {leavingCertificateData.studentName || `${student.firstName} ${student.lastName}`}
              </p>
            </div>

            {/* Student Information with All Required Fields */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-300 mb-8">
              <h3 className="font-bold text-gray-800 mb-4 text-center text-lg">Student Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex">
                  <span className="font-medium w-40">Serial No:</span>
                  <span>{leavingCertificateData.serialNo || 'N/A'}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-40">G.R No:</span>
                  <span>{leavingCertificateData.grNo || 'N/A'}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-40">Student Name:</span>
                  <span>{leavingCertificateData.studentName || 'N/A'}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-40">Father's Name:</span>
                  <span>{leavingCertificateData.fatherName || 'N/A'}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-40">Caste:</span>
                  <span>{leavingCertificateData.caste || 'N/A'}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-40">Place of Birth:</span>
                  <span>{leavingCertificateData.placeOfBirth || 'N/A'}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-40">Date of Birth:</span>
                  <span>{leavingCertificateData.dateOfBirth || 'N/A'}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-40">Date in Words:</span>
                  <span>{leavingCertificateData.dateOfBirthWords || 'N/A'}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-40">Date of Admission:</span>
                  <span>{leavingCertificateData.dateOfAdmission ? formatDate(leavingCertificateData.dateOfAdmission) : 'N/A'}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-40">Last Class Attended:</span>
                  <span>{leavingCertificateData.lastClassAttended || 'N/A'}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-40">Date of Leaving:</span>
                  <span>{leavingCertificateData.dateOfLeaving ? formatDate(leavingCertificateData.dateOfLeaving) : 'N/A'}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-40">Last School Attended:</span>
                  <span>{leavingCertificateData.lastSchoolAttended || 'N/A'}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-40">Standard:</span>
                  <span>{leavingCertificateData.standardStudying || 'N/A'}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-40">Reason for Leaving:</span>
                  <span>{leavingCertificateData.reasonForLeaving || 'N/A'}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-40">Attendance:</span>
                  <span>{leavingCertificateData.attendance || 'N/A'}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-40">Remarks:</span>
                  <span>{leavingCertificateData.remarks || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Certificate Statement */}
            <div className="text-lg text-gray-700 mb-8 leading-relaxed text-center">
              <p className="mb-4">
                was a bonafide student of this school and has left the institution on{' '}
                <span className="font-bold">{leavingCertificateData.dateOfLeaving ? formatDate(leavingCertificateData.dateOfLeaving) : 'N/A'}</span>.
              </p>
              {leavingCertificateData.reasonForLeaving && (
                <p className="mb-4">
                  Reason for leaving: <span className="font-medium">{leavingCertificateData.reasonForLeaving}</span>
                </p>
              )}
              <p>
                We wish {leavingCertificateData.studentName ? leavingCertificateData.studentName.split(' ')[0] : student.firstName} all the best in their future endeavors.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-300 pt-4 mt-6 text-center text-sm text-gray-600">
            <p className="mb-1">This is an official document generated on {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}</p>
            <p className="text-xs">Signature: _________________ &nbsp;&nbsp;&nbsp;&nbsp; Date: _________________</p>
          </div>
        </div>

        {/* Print Styles - Consistent with Marksheet */}
        <style>{`
          @media print {
            body {
              margin: 0;
              padding: 0;
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            
            .certificate-print-view {
              padding: 15px;
              max-width: 100%;
              page-break-inside: avoid;
              page-break-after: always;
            }
            
            /* Remove page break after the last certificate */
            .certificate-print-view:last-child {
              page-break-after: avoid;
            }
            
            @page {
              size: A4;
              margin: 0.5in;
            }
            
            .certificate-print-view {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            
            /* Enhanced print styling - Match marksheet styles */
            .text-center { text-align: center; }
            .flex { display: flex; }
            .items-center { align-items: center; }
            .justify-center { justify-content: center; }
            .justify-between { justify-content: space-between; }
            .border-b { border-bottom: 1px solid #d1d5db; }
            .border-t { border-top: 1px solid #d1d5db; }
            .border-gray-300 { border-color: #d1d5db; }
            .pb-2 { padding-bottom: 0.5rem; }
            .pb-3 { padding-bottom: 0.75rem; }
            .mb-3 { margin-bottom: 0.75rem; }
            .mb-4 { margin-bottom: 1rem; }
            .mb-6 { margin-bottom: 1.5rem; }
            .mb-8 { margin-bottom: 2rem; }
            .mt-3 { margin-top: 0.75rem; }
            .mt-6 { margin-top: 1.5rem; }
            .pt-3 { padding-top: 0.75rem; }
            .pt-4 { padding-top: 1rem; }
            .text-lg { font-size: 1.125rem; }
            .text-base { font-size: 1rem; }
            .text-sm { font-size: 0.875rem; }
            .text-xs { font-size: 0.75rem; }
            .font-bold { font-weight: 700; }
            .font-medium { font-weight: 500; }
            .text-gray-800 { color: #1f2937; }
            .text-gray-600 { color: #4b5563; }
            .text-gray-700 { color: #374151; }
            .bg-gray-50 { background-color: #f9fafb; }
            .bg-yellow-100 { background-color: #fef3c7; }
            .bg-green-100 { background-color: #dcfce7; }
            .bg-blue-100 { background-color: #dbeafe; }
            .bg-indigo-100 { background-color: #e0e7ff; }
            .bg-purple-100 { background-color: #f3e8ff; }
            .bg-red-100 { background-color: #fee2e2; }
            .text-yellow-800 { color: #92400e; }
            .text-green-800 { color: #166534; }
            .text-blue-800 { color: #1e40af; }
            .text-indigo-800 { color: #3730a3; }
            .text-purple-800 { color: #6b21a8; }
            .text-red-800 { color: #991b1b; }
            .p-6 { padding: 1.5rem; }
            .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
            .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
            .px-1 { padding-left: 0.25rem; padding-right: 0.25rem; }
            .py-0.5 { padding-top: 0.125rem; padding-bottom: 0.125rem; }
            .rounded { border-radius: 0.25rem; }
            .grid { display: grid; }
            .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
            .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .gap-1 { gap: 0.25rem; }
            .gap-2 { gap: 0.5rem; }
            .gap-3 { gap: 0.75rem; }
            .gap-4 { gap: 1rem; }
            .gap-6 { gap: 1.5rem; }
            .w-40 { width: 10rem; }
            .border { border: 1px solid #d1d5db; }
            .divide-y > :not([hidden]) ~ :not([hidden]) { border-top: 1px solid #e5e7eb; }
            .divide-gray-200 > :not([hidden]) ~ :not([hidden]) { border-color: #e5e7eb; }
          }
        `}</style>
      </div>
    );
  }

  // For other certificates, use the original template
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto border-4 border-blue-800 rounded-lg p-8 bg-white">
        {/* Certificate Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <FaSchool className="text-4xl text-blue-800" />
          </div>
          <h1 className="text-3xl font-bold text-blue-800 uppercase tracking-wider">
            {finalSchoolName}
          </h1>
          <p className="text-gray-600 mt-2">{finalSchoolAddress}</p>
          <div className="border-b-2 border-blue-800 mt-4 mx-auto w-32"></div>
        </div>

        {/* Certificate Title */}
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900 border-2 border-gray-900 inline-block px-6 py-2">
            {certificateType === 'leaving' ? 'LEAVING CERTIFICATE' : 
             certificateType === 'pass' ? 'PASS CERTIFICATE' : 
             'CHARACTER CERTIFICATE'}
          </h2>
        </div>

        {/* Certificate Content */}
        <div className="mb-10">
          <p className="text-lg text-gray-700 text-center mb-6">
            This is to certify that
          </p>
          
          <div className="text-center mb-8">
            <p className="text-2xl font-bold text-gray-900 mb-2">
              {student.firstName} {student.lastName}
            </p>
            <p className="text-gray-600">
              Student ID: <span className="font-medium">{student.id}</span>
            </p>
            <p className="text-gray-600">
              Class: <span className="font-medium">{student.class} - Section {student.section}</span>
            </p>
            <p className="text-gray-600">
              Admission Date: <span className="font-medium">{formatDate(student.dateOfAdmission)}</span>
            </p>
          </div>

          {certificateType === 'leaving' ? (
            <div className="text-lg text-gray-700 mb-8 leading-relaxed">
              <p className="text-center mb-4">
                was a bonafide student of this school and has left the institution on{' '}
                <span className="font-bold">{formatDate(issueDate)}</span>.
              </p>
              {reason && (
                <p className="text-center">
                  Reason for leaving: <span className="font-medium">{reason}</span>
                </p>
              )}
              <p className="text-center mt-6">
                We wish {student.firstName} all the best in their future endeavors.
              </p>
            </div>
          ) : certificateType === 'pass' ? (
            <div className="text-lg text-gray-700 mb-8 leading-relaxed">
              <p className="text-center mb-4">
                has successfully completed all required coursework and passed the final examination on{' '}
                <span className="font-bold">{formatDate(issueDate)}</span>.
              </p>
              {reason && (
                <p className="text-center mb-4">
                  Additional Details: <span className="font-medium">{reason}</span>
                </p>
              )}
              <p className="text-center">
                We congratulate {student.firstName} on this achievement and wish them success in their future endeavors.
              </p>
            </div>
          ) : (
            <div className="text-lg text-gray-700 mb-8 leading-relaxed">
              <p className="text-center mb-4">
                was a bonafide student of this school and during the period of study
                maintained good conduct and character.
              </p>
              {characterDetails && (
                <p className="text-center mb-4 font-medium">
                  {characterDetails}
                </p>
              )}
              <p className="text-center">
                We recommend {student.firstName} as a student of good moral character.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-end mt-12">
          <div>
            <p className="text-gray-600">Date: {formatDate(issueDate)}</p>
          </div>
          <div className="text-center">
            <div className="mb-12">_________________________</div>
            <p className="font-bold text-gray-900">{principalName}</p>
            <p className="text-gray-600">Principal</p>
          </div>
        </div>

        {/* Certificate Number and Seal */}
        <div className="flex justify-between items-end mt-8 pt-4 border-t border-gray-300">
          <p className="text-sm text-gray-500">
            Certificate No: CERT-{student.id}-{new Date().getFullYear()}
          </p>
          <p className="text-sm text-gray-500">
            Issued on: {formatDate(issueDate)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CertificateTemplate;