import React, { useEffect, useRef } from 'react';
import CertificateTemplate from './CertificateTemplate';

const PrintableCertificate = ({ 
  student, 
  certificateType, 
  issueDate, 
  reason, 
  characterDetails,
  leavingCertificateData,
  onClose 
}) => {
  const printRef = useRef();

  const handlePrint = () => {
    // Create a simplified, print-optimized HTML version
    let printContent = '';
    
    if (certificateType === 'leaving' && leavingCertificateData) {
      // Format date function
      const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
      };
      
      // Generate leaving certificate content
      printContent = `
        <div style="max-width: 800px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px;">
          <!-- Certificate Header -->
          <div style="text-align: center; border-bottom: 1px solid #d1d5db; padding-bottom: 15px; margin-bottom: 20px;">
            <h1 style="font-size: 24px; font-weight: bold; color: #1e40af; margin: 0 0 10px 0;">School Management System</h1>
            <p style="font-size: 14px; color: #4b5563; margin: 0 0 5px 0;">123 Education Street, Learning City</p>
            <p style="font-size: 14px; color: #4b5563; margin: 0;">Phone: +1 (555) 123-4567</p>
          </div>

          <!-- Certificate Title -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="font-size: 20px; font-weight: bold; color: #1f2937; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; display: inline-block;">
              SCHOOL LEAVING CERTIFICATE
            </h2>
          </div>

          <!-- Certificate Content -->
          <div style="margin-bottom: 30px;">
            <p style="font-size: 18px; color: #374151; text-align: center; margin: 0 0 20px 0;">
              This is to certify that
            </p>
            
            <div style="text-align: center; margin-bottom: 25px;">
              <p style="font-size: 24px; font-weight: bold; color: #1f2937; margin: 0 0 10px 0;">
                ${leavingCertificateData.studentName || `${student.firstName} ${student.lastName}`}
              </p>
            </div>

            <!-- Student Information -->
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 4px; border: 1px solid #d1d5db; margin-bottom: 30px;">
              <h3 style="font-size: 18px; font-weight: bold; color: #1f2937; text-align: center; margin: 0 0 15px 0;">Student Information</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 14px;">
                <div style="display: flex;">
                  <span style="font-weight: 500; width: 160px; color: #1f2937;">Serial No:</span>
                  <span style="color: #4b5563;">${leavingCertificateData.serialNo || 'N/A'}</span>
                </div>
                <div style="display: flex;">
                  <span style="font-weight: 500; width: 160px; color: #1f2937;">G.R No:</span>
                  <span style="color: #4b5563;">${leavingCertificateData.grNo || 'N/A'}</span>
                </div>
                <div style="display: flex;">
                  <span style="font-weight: 500; width: 160px; color: #1f2937;">Student Name:</span>
                  <span style="color: #4b5563;">${leavingCertificateData.studentName || 'N/A'}</span>
                </div>
                <div style="display: flex;">
                  <span style="font-weight: 500; width: 160px; color: #1f2937;">Father's Name:</span>
                  <span style="color: #4b5563;">${leavingCertificateData.fatherName || 'N/A'}</span>
                </div>
                <div style="display: flex;">
                  <span style="font-weight: 500; width: 160px; color: #1f2937;">Caste:</span>
                  <span style="color: #4b5563;">${leavingCertificateData.caste || 'N/A'}</span>
                </div>
                <div style="display: flex;">
                  <span style="font-weight: 500; width: 160px; color: #1f2937;">Place of Birth:</span>
                  <span style="color: #4b5563;">${leavingCertificateData.placeOfBirth || 'N/A'}</span>
                </div>
                <div style="display: flex;">
                  <span style="font-weight: 500; width: 160px; color: #1f2937;">Date of Birth:</span>
                  <span style="color: #4b5563;">${leavingCertificateData.dateOfBirth || 'N/A'}</span>
                </div>
                <div style="display: flex;">
                  <span style="font-weight: 500; width: 160px; color: #1f2937;">Date in Words:</span>
                  <span style="color: #4b5563;">${leavingCertificateData.dateOfBirthWords || 'N/A'}</span>
                </div>
                <div style="display: flex;">
                  <span style="font-weight: 500; width: 160px; color: #1f2937;">Date of Admission:</span>
                  <span style="color: #4b5563;">${leavingCertificateData.dateOfAdmission ? formatDate(leavingCertificateData.dateOfAdmission) : 'N/A'}</span>
                </div>
                <div style="display: flex;">
                  <span style="font-weight: 500; width: 160px; color: #1f2937;">Last Class Attended:</span>
                  <span style="color: #4b5563;">${leavingCertificateData.lastClassAttended || 'N/A'}</span>
                </div>
                <div style="display: flex;">
                  <span style="font-weight: 500; width: 160px; color: #1f2937;">Date of Leaving:</span>
                  <span style="color: #4b5563;">${leavingCertificateData.dateOfLeaving ? formatDate(leavingCertificateData.dateOfLeaving) : 'N/A'}</span>
                </div>
                <div style="display: flex;">
                  <span style="font-weight: 500; width: 160px; color: #1f2937;">Last School Attended:</span>
                  <span style="color: #4b5563;">${leavingCertificateData.lastSchoolAttended || 'N/A'}</span>
                </div>
                <div style="display: flex;">
                  <span style="font-weight: 500; width: 160px; color: #1f2937;">Standard:</span>
                  <span style="color: #4b5563;">${leavingCertificateData.standardStudying || 'N/A'}</span>
                </div>
                <div style="display: flex;">
                  <span style="font-weight: 500; width: 160px; color: #1f2937;">Reason for Leaving:</span>
                  <span style="color: #4b5563;">${leavingCertificateData.reasonForLeaving || 'N/A'}</span>
                </div>
                <div style="display: flex;">
                  <span style="font-weight: 500; width: 160px; color: #1f2937;">Attendance:</span>
                  <span style="color: #4b5563;">${leavingCertificateData.attendance || 'N/A'}</span>
                </div>
                <div style="display: flex;">
                  <span style="font-weight: 500; width: 160px; color: #1f2937;">Remarks:</span>
                  <span style="color: #4b5563;">${leavingCertificateData.remarks || 'N/A'}</span>
                </div>
              </div>
            </div>

            <!-- Certificate Statement -->
            <div style="font-size: 18px; color: #374151; text-align: center; margin-bottom: 30px; line-height: 1.6;">
              <p style="margin: 0 0 15px 0;">
                was a bonafide student of this school and has left the institution on
                <span style="font-weight: bold;">${leavingCertificateData.dateOfLeaving ? formatDate(leavingCertificateData.dateOfLeaving) : 'N/A'}</span>.
              </p>
              ${leavingCertificateData.reasonForLeaving ? `
              <p style="margin: 0 0 15px 0;">
                Reason for leaving: <span style="font-weight: 500;">${leavingCertificateData.reasonForLeaving}</span>
              </p>
              ` : ''}
              <p style="margin: 0;">
                We wish ${leavingCertificateData.studentName ? leavingCertificateData.studentName.split(' ')[0] : student.firstName} all the best in their future endeavors.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="border-top: 1px solid #d1d5db; padding-top: 15px; text-align: center; font-size: 14px; color: #4b5563;">
            <p style="margin: 0 0 5px 0;">This is an official document generated on ${new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}</p>
            <p style="font-size: 12px; margin: 0;">Signature: _________________ &nbsp;&nbsp;&nbsp;&nbsp; Date: _________________</p>
          </div>
        </div>
      `;
    } else {
      // For other certificates, use the existing approach
      printContent = printRef.current.innerHTML;
    }
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Certificate</title>
          <style>
            @media print {
              body { 
                margin: 0; 
                padding: 0; 
                background: white;
              }
              
              @page {
                size: A4;
                margin: 0.5in;
              }
            }
            
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px;
              background: white;
            }
            .certificate-container {
              max-width: 100%;
              margin: 0 auto;
            }
          </style>
        </head>
        <body>
          <div class="certificate-container">
            ${printContent}
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  useEffect(() => {
    // Don't auto-print immediately, let user click the print button
    // This is more reliable across different browsers
  }, []);

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-auto">
      <div ref={printRef} className="p-8">
        <CertificateTemplate
          student={student}
          certificateType={certificateType}
          issueDate={issueDate}
          reason={reason}
          characterDetails={characterDetails}
          leavingCertificateData={leavingCertificateData}
        />
      </div>
      
      {/* Buttons for manual control */}
      <div className="fixed bottom-4 right-4 space-x-2 print:hidden">
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Print Certificate
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default PrintableCertificate;