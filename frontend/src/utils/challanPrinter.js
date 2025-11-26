import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Print challan as PDF using html2canvas and jsPDF
 * @param {Object} challan - The challan data
 * @param {Object} student - The student data
 * @param {string} filename - The filename for the PDF
 */
export const printChallanAsPDF = async (challan, student, filename) => {
  try {
    // Create a temporary DOM element with the print content
    const printElement = document.createElement('div');
    printElement.innerHTML = `
      <div style="width: 80mm; font-family: Arial, Helvetica, sans-serif; font-size: 12px; padding: 10px;">
        <!-- School Header -->
        <div style="text-align: center; border-bottom: 1px solid #ccc; padding-bottom: 10px; margin-bottom: 10px;">
          <h1 style="font-size: 16px; font-weight: bold; margin: 0 0 5px 0;">School Management System</h1>
          <p style="font-size: 10px; margin: 0 0 2px 0;">123 Education Street, Learning City</p>
          <p style="font-size: 10px; margin: 0;">Phone: +1 (555) 123-4567</p>
        </div>

        <!-- Challan Header -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <div>
            <h2 style="font-size: 14px; font-weight: bold; margin: 0 0 3px 0;">Fee Challan</h2>
            <p style="font-size: 10px; margin: 0;">ID: ${challan.id}</p>
          </div>
          <div style="background: ${challan.status === 'paid' ? '#d1fae5' : '#fef3c7'}; 
                      color: ${challan.status === 'paid' ? '#065f46' : '#92400e'}; 
                      padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold;">
            ${challan.status === 'paid' ? 'PAID' : 'PENDING'}
          </div>
        </div>

        <!-- Student Information -->
        <div style="margin-bottom: 10px;">
          <h3 style="font-size: 12px; font-weight: bold; margin: 0 0 5px 0;">Student Information</h3>
          <div style="background: #f9fafb; padding: 8px; border-radius: 4px;">
            <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 2px; font-size: 10px;">
              <span style="font-weight: bold;">Name:</span>
              <span>${student.firstName} ${student.lastName}</span>
              
              <span style="font-weight: bold;">Class:</span>
              <span>${student.class} - Section ${student.section}</span>
              
              <span style="font-weight: bold;">Month:</span>
              <span>${challan.month}</span>
            </div>
          </div>
        </div>

        <!-- Fee Details -->
        <div style="margin-bottom: 10px;">
          <h3 style="font-size: 12px; font-weight: bold; margin: 0 0 5px 0;">Fee Details</h3>
          <div style="border: 1px solid #ccc; border-radius: 4px;">
            <div style="display: flex; justify-content: space-between; padding: 6px; background: #f9fafb; border-bottom: 1px solid #ccc; font-size: 10px; font-weight: bold;">
              <span>Description</span>
              <span>Amount</span>
            </div>
            <div style="padding: 6px; font-size: 10px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                <span>Monthly Tuition Fee</span>
                <span>Rs ${Math.round(challan.amount)}</span>
              </div>
              ${challan.description ? `
              <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                <span>${challan.description}</span>
                <span>Rs 0</span>
              </div>
              ` : ''}
              <div style="display: flex; justify-content: space-between; margin-top: 5px; padding-top: 5px; border-top: 1px solid #ccc; font-weight: bold;">
                <span>Total Amount</span>
                <span>Rs ${Math.round(challan.amount)}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Dates -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-bottom: 10px;">
          <div>
            <h4 style="font-size: 10px; font-weight: bold; margin: 0 0 3px 0;">Issue Date</h4>
            <div style="background: #f9fafb; padding: 6px; border-radius: 4px; border: 1px solid #ccc; font-size: 10px;">
              ${new Date(challan.date || new Date()).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </div>
          </div>
          <div>
            <h4 style="font-size: 10px; font-weight: bold; margin: 0 0 3px 0;">Due Date</h4>
            <div style="background: #f9fafb; padding: 6px; border-radius: 4px; border: 1px solid #ccc; font-size: 10px;">
              ${new Date(challan.dueDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </div>
          </div>
        </div>

        <!-- Payment Information -->
        ${challan.status === 'paid' && challan.paymentMethod ? `
        <div style="margin-bottom: 10px;">
          <h3 style="font-size: 12px; font-weight: bold; margin: 0 0 5px 0;">Payment Information</h3>
          <div style="background: #d1fae5; padding: 8px; border-radius: 4px; border: 1px solid #10b981; font-size: 10px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2px; margin-bottom: 2px;">
              <div style="font-weight: bold;">Payment Method:</div>
              <div style="text-transform: capitalize;">${challan.paymentMethod}</div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2px;">
              <div style="font-weight: bold;">Payment Date:</div>
              <div>${new Date(challan.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}</div>
            </div>
          </div>
        </div>
        ` : ''}

        <!-- Footer -->
        <div style="text-align: center; font-size: 10px; color: #6b7280; padding-top: 8px; border-top: 1px solid #ccc;">
          ${challan.status === 'paid' ? 
            '<p>Thank you for your payment.</p>' : 
            '<p>Please pay by the due date.</p>'}
          <p style="margin-top: 3px;">Generated on ${new Date().toLocaleDateString()}</p>
        </div>
      </div>
    `;
    
    // Add to document temporarily
    document.body.appendChild(printElement);
    
    // Create canvas from the element
    const canvas = await html2canvas(printElement, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      logging: false
    });

    // Remove temporary element
    document.body.removeChild(printElement);

    const imgData = canvas.toDataURL('image/png');
    // Use a smaller format suitable for thermal printing (80mm width)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 120] // 80mm width, 120mm height (adjustable)
    });

    // Calculate dimensions to fit the PDF for thermal printing
    const imgWidth = 80; // Thermal printer width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Add image to PDF
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

    // Save the PDF
    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};

/**
 * Print challan directly using browser print
 * @param {Object} challan - The challan data
 * @param {Object} student - The student data
 */
export const printChallanDirect = (challan, student) => {
  try {
    // Create the print content
    const printContent = `
      <div style="width: 80mm; font-family: Arial, Helvetica, sans-serif; font-size: 12px; padding: 10px;">
        <!-- School Header -->
        <div style="text-align: center; border-bottom: 1px solid #ccc; padding-bottom: 10px; margin-bottom: 10px;">
          <h1 style="font-size: 16px; font-weight: bold; margin: 0 0 5px 0;">School Management System</h1>
          <p style="font-size: 10px; margin: 0 0 2px 0;">123 Education Street, Learning City</p>
          <p style="font-size: 10px; margin: 0;">Phone: +1 (555) 123-4567</p>
        </div>

        <!-- Challan Header -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <div>
            <h2 style="font-size: 14px; font-weight: bold; margin: 0 0 3px 0;">Fee Challan</h2>
            <p style="font-size: 10px; margin: 0;">ID: ${challan.id}</p>
          </div>
          <div style="background: ${challan.status === 'paid' ? '#d1fae5' : '#fef3c7'}; 
                      color: ${challan.status === 'paid' ? '#065f46' : '#92400e'}; 
                      padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold;">
            ${challan.status === 'paid' ? 'PAID' : 'PENDING'}
          </div>
        </div>

        <!-- Student Information -->
        <div style="margin-bottom: 10px;">
          <h3 style="font-size: 12px; font-weight: bold; margin: 0 0 5px 0;">Student Information</h3>
          <div style="background: #f9fafb; padding: 8px; border-radius: 4px;">
            <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 2px; font-size: 10px;">
              <span style="font-weight: bold;">Name:</span>
              <span>${student.firstName} ${student.lastName}</span>
              
              <span style="font-weight: bold;">Class:</span>
              <span>${student.class} - Section ${student.section}</span>
              
              <span style="font-weight: bold;">Month:</span>
              <span>${challan.month}</span>
            </div>
          </div>
        </div>

        <!-- Fee Details -->
        <div style="margin-bottom: 10px;">
          <h3 style="font-size: 12px; font-weight: bold; margin: 0 0 5px 0;">Fee Details</h3>
          <div style="border: 1px solid #ccc; border-radius: 4px;">
            <div style="display: flex; justify-content: space-between; padding: 6px; background: #f9fafb; border-bottom: 1px solid #ccc; font-size: 10px; font-weight: bold;">
              <span>Description</span>
              <span>Amount</span>
            </div>
            <div style="padding: 6px; font-size: 10px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                <span>Monthly Tuition Fee</span>
                <span>Rs ${Math.round(challan.amount)}</span>
              </div>
              ${challan.description ? `
              <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                <span>${challan.description}</span>
                <span>Rs 0</span>
              </div>
              ` : ''}
              <div style="display: flex; justify-content: space-between; margin-top: 5px; padding-top: 5px; border-top: 1px solid #ccc; font-weight: bold;">
                <span>Total Amount</span>
                <span>Rs ${Math.round(challan.amount)}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Dates -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-bottom: 10px;">
          <div>
            <h4 style="font-size: 10px; font-weight: bold; margin: 0 0 3px 0;">Issue Date</h4>
            <div style="background: #f9fafb; padding: 6px; border-radius: 4px; border: 1px solid #ccc; font-size: 10px;">
              ${new Date(challan.date || new Date()).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </div>
          </div>
          <div>
            <h4 style="font-size: 10px; font-weight: bold; margin: 0 0 3px 0;">Due Date</h4>
            <div style="background: #f9fafb; padding: 6px; border-radius: 4px; border: 1px solid #ccc; font-size: 10px;">
              ${new Date(challan.dueDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </div>
          </div>
        </div>

        <!-- Payment Information -->
        ${challan.status === 'paid' && challan.paymentMethod ? `
        <div style="margin-bottom: 10px;">
          <h3 style="font-size: 12px; font-weight: bold; margin: 0 0 5px 0;">Payment Information</h3>
          <div style="background: #d1fae5; padding: 8px; border-radius: 4px; border: 1px solid #10b981; font-size: 10px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2px; margin-bottom: 2px;">
              <div style="font-weight: bold;">Payment Method:</div>
              <div style="text-transform: capitalize;">${challan.paymentMethod}</div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2px;">
              <div style="font-weight: bold;">Payment Date:</div>
              <div>${new Date(challan.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}</div>
            </div>
          </div>
        </div>
        ` : ''}

        <!-- Footer -->
        <div style="text-align: center; font-size: 10px; color: #6b7280; padding-top: 8px; border-top: 1px solid #ccc;">
          ${challan.status === 'paid' ? 
            '<p>Thank you for your payment.</p>' : 
            '<p>Please pay by the due date.</p>'}
          <p style="margin-top: 3px;">Generated on ${new Date().toLocaleDateString()}</p>
        </div>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Challan Print</title>
          <style>
            @media print {
              @page {
                size: 80mm auto;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
                font-family: Arial, Helvetica, sans-serif;
                font-size: 12px;
                width: 80mm;
              }
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
    return true;
  } catch (error) {
    console.error('Error printing challan:', error);
    return false;
  }
};