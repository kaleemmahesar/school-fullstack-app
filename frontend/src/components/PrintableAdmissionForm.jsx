import { useSelector } from 'react-redux';
import { FaUserGraduate, FaIdCard, FaPhone, FaEnvelope, FaCalendar, FaSchool, FaMoneyBillWave } from 'react-icons/fa';
import Logo from '../assets/student-photos/student2.jpg'; // Import the logo

const PrintableAdmissionForm = ({ formData, photoPreview }) => {
  const schoolInfo = useSelector(state => state.settings.schoolInfo);
  const fundingType = schoolInfo?.fundingType || 'traditional';
  const isNGOSchool = fundingType === 'ngo';
  const isTraditionalSchool = fundingType === 'traditional';
  
  const today = new Date().toLocaleDateString();
  
  // Helper function to format dates
  const formatDate = (date) => {
    if (!date) return '';
    if (date instanceof Date) {
      return date.toLocaleDateString();
    }
    // If it's already a string, return as is
    return date;
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Print-specific styles */}
      <style>{`
        @media print {
          @page {
            margin: 0.15in;
            size: A4;
          }
          body {
            margin: 0;
            padding: 0;
            font-size: 8pt;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.1;
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
            max-width: 100%;
          }
          /* Fix for print overflow issues */
          html, body {
            height: auto;
            overflow: visible;
          }
          /* Ensure content fits on page */
          .form-container {
            page-break-inside: avoid;
          }
          .section {
            page-break-inside: avoid;
            margin-bottom: 10px;
          }
          .form-row {
            page-break-inside: avoid;
            display: flex;
            flex-wrap: wrap;
            margin: 0 -4px 6px -4px;
          }
          .form-group {
            flex: 1 0 22%;
            min-width: 120px;
            padding: 0 4px;
            margin-bottom: 6px;
          }
          .form-label {
            font-weight: 600;
            margin-bottom: 2px;
            font-size: 7pt;
            color: #444;
          }
          .form-value {
            border-bottom: 1px solid #333;
            min-height: 16px;
            padding: 2px 0;
            font-size: 8pt;
          }
          .full-width {
            flex: 1 0 100%;
          }
          .half-width {
            flex: 1 0 48%;
          }
          .third-width {
            flex: 1 0 31%;
          }
          .header {
            text-align: center;
            margin-bottom: 10px;
            padding-bottom: 6px;
          }
          .header h1 {
            font-size: 14pt;
            font-weight: bold;
            color: #333;
            margin: 0 0 2px 0;
          }
          .header p {
            font-size: 10pt;
            color: #666;
            margin: 0;
          }
          .logo {
            max-height: 50px;
            width: auto;
            margin-bottom: 8px;
          }
          .section-title {
            font-weight: bold;
            font-size: 10pt;
            margin-bottom: 6px;
            color: #333;
            padding-bottom: 7px;
          }
          .declaration {
            border: 1px solid #333;
            padding: 8px;
            margin-top: 12px;
          }
          .declaration-text {
            font-size: 7pt;
            line-height: 1.2;
            margin-bottom: 8px;
            color: #555;
          }
          .signature-row {
            display: flex;
            justify-content: space-between;
            margin-top: 15px;
          }
          .signature-group {
            flex: 1;
            padding: 0 4px;
          }
          .signature-line {
            border-top: 1px solid #333;
            height: 1px;
            margin-top: 20px;
          }
          .signature-label {
            font-size: 7pt;
            color: #555;
            margin-top: 3px;
          }
          .footer {
            text-align: center;
            margin-top: 15px;
            font-size: 6pt;
            color: #777;
            border-top: 1px solid #ccc;
            padding-top: 4px;
          }
          .photo-container {
            width: 70px;
            height: 70px;
            border: 1px solid #333;
            margin-bottom: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }
          .photo-container img {
            max-width: 100%;
            max-height: 100%;
            object-fit: cover;
          }
          .photo-placeholder {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #f0f0f0;
            font-size: 6pt;
          }
          /* Better space utilization */
          .student-info-row {
            display: flex;
            flex-wrap: wrap;
          }
          .photo-section {
            flex: 0 0 70px;
            margin-right: 10px;
          }
          .student-details {
            flex: 1;
          }
          .compact-row {
            display: flex;
            flex-wrap: wrap;
          }
          .compact-group {
            flex: 1 0 22%;
            min-width: 120px;
            padding: 0 3px;
            margin-bottom: 5px;
          }
          /* Reduce font sizes further for better fit */
          .small-text {
            font-size: 7pt;
          }
          .x-small-text {
            font-size: 6pt;
          }
          /* Adjust specific sections for better space usage */
          .fee-section .form-group {
            flex: 1 0 23%;
          }
        }
        .form-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 15px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          font-size: 13px;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
          padding-bottom: 10px;
        }
        .header h1 {
          font-size: 20px;
          font-weight: bold;
          color: #333;
          margin: 0 0 3px 0;
        }
        .header p {
          font-size: 14px;
          color: #666;
          margin: 0;
        }
        .logo {
          max-height: 80px;
          width: auto;
          margin-bottom: 10px;
        }
        .section {
          margin-bottom: 18px;
        }
        .section-title {
          font-weight: bold;
          font-size: 15px;
          margin-bottom: 10px;
          color: #333;
          padding-bottom: 7px;
        }
        .form-row {
          display: flex;
          flex-wrap: wrap;
          margin: 0 -8px 12px -8px;
        }
        .form-group {
          flex: 1 0 23%;
          min-width: 160px;
          padding: 0 8px;
          margin-bottom: 12px;
        }
        .form-label {
          font-weight: 600;
          margin-bottom: 4px;
          font-size: 11px;
          color: #555;
        }
        .form-value {
          border-bottom: 1px solid #333;
          min-height: 24px;
          padding: 4px 0;
          font-size: 13px;
        }
        .full-width {
          flex: 1 0 100%;
        }
        .declaration {
          border: 1px solid #333;
          padding: 15px;
          margin-top: 20px;
        }
        .declaration-text {
          font-size: 11px;
          line-height: 1.4;
          margin-bottom: 15px;
          color: #555;
        }
        .signature-row {
          display: flex;
          justify-content: space-between;
          margin-top: 25px;
        }
        .signature-group {
          flex: 1;
          padding: 0 8px;
        }
        .signature-line {
          border-top: 1px solid #333;
          height: 1px;
          margin-top: 30px;
        }
        .signature-label {
          font-size: 11px;
          color: #555;
          margin-top: 4px;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          font-size: 9px;
          color: #777;
          border-top: 1px solid #ccc;
          padding-top: 8px;
        }
        .photo-container {
          width: 100px;
          height: 100px;
          border: 1px solid #333;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .photo-container img {
          max-width: 100%;
          max-height: 100%;
          object-fit: cover;
        }
        .photo-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f0f0f0;
          font-size: 10px;
        }
        @media screen {
          .form-container {
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            background: white;
            margin: 15px;
          }
        }
      `}</style>

      <div className="form-container">
        {/* School Header with Logo */}
        <div className="header">
          {/* <img src={Logo} alt="School Logo" className="logo" /> */}
          <h1>SCHOOL MANAGEMENT SYSTEM</h1>
          <p>Student Admission Form</p>
        </div>

        {/* Student Information Section */}
        <div className="section">
          <div className="section-title">Student Information</div>
          <div className="student-info-row mb-4">
            {/* Photo Section */}
            <div className="photo-section">
              {/* <div className="photo-container">
                {photoPreview ? (
                  <img src={photoPreview} alt="Student" />
                ) : (
                  <div className="photo-placeholder">
                    <span>No Photo</span>
                  </div>
                )}
              </div> */}
              <div className="photo-container">
                {Logo ? (
                  <img src={Logo} alt="Student" />
                ) : (
                  <div className="photo-placeholder">
                    <span>No Photo</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Student Details - Now below the photo */}
          <div className="compact-row">
            <div className="compact-group">
              <div className="form-label small-text">GR Number</div>
              <div className="form-value">{formData.grNo || ''}</div>
            </div>
            
            <div className="compact-group">
              <div className="form-label small-text">Student Name</div>
              <div className="form-value">{formData.firstName || ''} {formData.lastName || ''}</div>
            </div>
            
            <div className="compact-group">
              <div className="form-label small-text">Father's Name</div>
              <div className="form-value">{formData.fatherName || ''}</div>
            </div>
            
            <div className="compact-group">
              <div className="form-label small-text">Religion</div>
              <div className="form-value">{formData.religion || ''}</div>
            </div>
          </div>
          
          <div className="compact-row">
            <div className="compact-group">
              <div className="form-label small-text">Date of Birth</div>
              <div className="form-value">{formatDate(formData.dateOfBirth) || ''}</div>
            </div>
            
            <div className="compact-group">
              <div className="form-label small-text">Place of Birth</div>
              <div className="form-value">{formData.birthPlace || ''}</div>
            </div>
            
            <div className="compact-group">
              <div className="form-label small-text">Date of Admission</div>
              <div className="form-value">{formatDate(formData.dateOfAdmission) || ''}</div>
            </div>
            
            <div className="compact-group">
              <div className="form-label small-text">Class/Section</div>
              <div className="form-value">{formData.class || ''} - {formData.section || ''}</div>
            </div>
          </div>
          
          {/* Address and other details */}
          <div className="form-row">
            <div className="form-group full-width">
              <div className="form-label small-text">Address</div>
              <div className="form-value">{formData.address || ''}</div>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group half-width">
              <div className="form-label small-text">Last Attended School</div>
              <div className="form-value">{formData.lastSchoolAttended || ''}</div>
            </div>
            
            {/* Transfer Student Information (Only shown when applicable) */}
            {formData.isTransferStudent && (
              <>
                <div className="form-group third-width">
                  <div className="form-label small-text">Date of Removal</div>
                  <div className="form-value">{formatDate(formData.dateOfLeaving) || ''}</div>
                </div>
                
                <div className="form-group third-width">
                  <div className="form-label small-text">Class at Removal</div>
                  <div className="form-value">{formData.classInWhichLeft || ''}</div>
                </div>
              </>
            )}
            
            <div className="form-group half-width">
              <div className="form-label small-text">Remarks</div>
              <div className="form-value">{formData.remarks || ''}</div>
            </div>
          </div>
          
          {/* Transfer Student Reason (Only shown when applicable) */}
          {formData.isTransferStudent && (
            <div className="form-row">
              <div className="form-group full-width">
                <div className="form-label small-text">Reason for Leaving</div>
                <div className="form-value">{formData.reasonOfLeaving || ''}</div>
              </div>
            </div>
          )}
        </div>
        
        {/* Conditional Section: Fee Information for Traditional Schools or Funding Information for NGO Schools */}
        {isTraditionalSchool ? (
          <div className="section fee-section">
            <div className="section-title">Fee Information</div>
            <div className="form-row">
              <div className="form-group">
                <div className="form-label small-text">Admission Fees</div>
                <div className="form-value">Rs. {formData.admissionFees || '0'}</div>
              </div>
              
              <div className="form-group">
                <div className="form-label small-text">Monthly Fees</div>
                <div className="form-value">Rs. {formData.monthlyFees || '0'}</div>
              </div>
              
              <div className="form-group">
                <div className="form-label small-text">Fees Paid</div>
                <div className="form-value">Rs. {formData.feesPaid || '0'}</div>
              </div>
              
              <div className="form-group">
                <div className="form-label small-text">Total Fees</div>
                <div className="form-value">Rs. {formData.totalFees || '0'}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="section">
            <div className="section-title">Funding Information</div>
            <div className="form-row">
              <div className="form-group full-width">
                <div className="form-label small-text">Funding Status</div>
                <div className="form-value">This school is funded by quarterly NGO subsidies. No fees are charged to students.</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Declaration */}
        <div className="declaration">
          <div className="section-title x-small-text">Declaration</div>
          <div className="declaration-text x-small-text">
            I hereby declare that the information provided above is true and correct to the best of my knowledge.
            I understand that providing false information may lead to cancellation of admission.
          </div>
          <div className="signature-row">
            <div className="signature-group">
              <div className="signature-line"></div>
              <div className="signature-label x-small-text">Parent/Guardian Signature</div>
            </div>
            <div className="signature-group">
              <div className="signature-line"></div>
              <div className="signature-label x-small-text">Date: {today}</div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="footer x-small-text">
          <p>Form Generated on: {today} | This is an official document of School Management System</p>
        </div>
      </div>
    </div>
  );
};

export default PrintableAdmissionForm;