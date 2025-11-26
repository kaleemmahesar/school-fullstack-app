import React from 'react';
import { useSelector } from 'react-redux';
import { FaChalkboardTeacher, FaUser, FaPhone, FaCalendar, FaDollarSign, FaBriefcase, FaBook, FaTimes, FaCamera } from 'react-icons/fa';

const StaffDetailsModal = ({ staffMember, onClose, classes }) => {
  // Calculate months since joining (full months worked)
  const joiningDate = new Date(staffMember.dateOfJoining);
  const currentDate = new Date();
  
  // Calculate total months worked with partial month calculation
  // Get the difference in milliseconds and convert to months
  const timeDiff = currentDate.getTime() - joiningDate.getTime();
  const daysDiff = timeDiff / (1000 * 3600 * 24);
  
  // Calculate months including partial months
  // We consider a month as 30 days for simplicity
  let totalMonths = daysDiff / 30;
  
  // Ensure we don't have negative months
  totalMonths = Math.max(0, totalMonths);
  
  const adjustedMonthsSinceJoining = totalMonths;
  
  // Calculate total allowances for the member
  const totalAllowances = (staffMember.allowances || []).reduce((sum, allowance) => {
    return sum + parseFloat(allowance.amount || 0);
  }, 0);
  
  // Calculate monthly total (salary + allowances)
  const monthlyTotal = parseFloat(staffMember.salary || 0) + totalAllowances;
  
  // Calculate advances for this member
  const memberAdvances = (staffMember.salaryHistory || []).reduce((sum, record) => {
    return sum + (record.status === 'advance' ? Math.abs(parseFloat(record.netSalary || 0)) : 0);
  }, 0);
  
  // Calculate paid salaries for this member (total paid so far)
  // This includes both salary payments and advances given to staff
  const memberPaidSalaries = (staffMember.salaryHistory || []).reduce((sum, record) => {
    if (record.status === 'paid') {
      // Salary payments are positive amounts paid to staff
      return sum + Math.abs(parseFloat(record.netSalary || 0));
    } else if (record.status === 'advance') {
      // Advances are negative amounts (money given to staff), so we add the absolute value
      return sum + Math.abs(parseFloat(record.netSalary || 0));
    }
    return sum;
  }, 0);
  
  // Calculate expected salaries based on joining date (full months worked)
  const expectedSalaries = (() => {
    // Calculate months since joining
    const joiningDate = new Date(staffMember.dateOfJoining);
    const currentDate = new Date();
    
    // Calculate total months worked with partial month calculation
    // Get the difference in milliseconds and convert to months
    const timeDiff = currentDate.getTime() - joiningDate.getTime();
    const daysDiff = timeDiff / (1000 * 3600 * 24);
    
    // Calculate months including partial months
    // We consider a month as 30 days for simplicity
    let totalMonths = daysDiff / 30;
    
    // Ensure we don't have negative months
    totalMonths = Math.max(0, totalMonths);
    
    // Calculate monthly total (salary + allowances)
    const allowances = (staffMember.allowances || []).reduce((allowanceSum, allowance) => {
      return allowanceSum + parseFloat(allowance.amount || 0);
    }, 0);
    const monthlyTotal = parseFloat(staffMember.salary || 0) + allowances;
    
    // Total expected = total months worked * monthly salary
    return totalMonths * monthlyTotal;
  })();
  
  // Calculate pending amount (expected - paid)
  // Advances are money already given to staff, so they count as payments
  // memberPaidSalaries already includes advances, so we don't need to add them separately
  const memberPending = expectedSalaries - memberPaidSalaries;
  
  // Function to find classes taught by this teacher
  const getClassesForTeacher = (teacherName) => {
    const teacherClasses = [];
    
    // Split the teacher name to get first and last name
    const nameParts = teacherName.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts[nameParts.length - 1] || '';
    
    classes.forEach(classItem => {
      // Check if any subject in this class is taught by this teacher
      const teacherSubjects = classItem.subjects.filter(subject => {
        if (!subject.teacher) return false;
        
        const teacher = subject.teacher.toLowerCase();
        const fullName = teacherName.toLowerCase();
        const lowerFirstName = firstName.toLowerCase();
        const lowerLastName = lastName.toLowerCase();
        
        // Match if teacher name contains any part of the staff name
        return teacher.includes(lowerFirstName) || 
               teacher.includes(lowerLastName) || 
               teacher.includes(fullName);
      });
      
      if (teacherSubjects.length > 0) {
        // Add class with subjects taught by this teacher
        teacherClasses.push({
          className: classItem.name,
          subjects: teacherSubjects.map(subject => subject.name)
        });
      }
    });
    
    return teacherClasses;
  };
  
  const teacherClasses = getClassesForTeacher(`${staffMember.firstName} ${staffMember.lastName}`);
  
  // If no classes found by name matching, try to find by subject
  if (teacherClasses.length === 0 && staffMember.subject) {
    classes.forEach(classItem => {
      // Check if this class has the subject taught by this teacher
      const subjectMatch = classItem.subjects.find(subject => 
        subject.name.toLowerCase() === staffMember.subject.toLowerCase()
      );
      
      if (subjectMatch) {
        // Check if this class is not already added
        const alreadyAdded = teacherClasses.some(tc => tc.className === classItem.name);
        if (!alreadyAdded) {
          // Add class with the subject taught by this teacher
          teacherClasses.push({
            className: classItem.name,
            subjects: [staffMember.subject]
          });
        }
      }
    });
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">Staff Details</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Staff Information Card */}
            <div className="lg:col-span-1 bg-white rounded-lg shadow p-3">
              <div className="flex flex-col items-center mb-3">
                {staffMember.photo ? (
                  <img 
                    src={staffMember.photo} 
                    alt={`${staffMember.firstName} ${staffMember.lastName}`} 
                    className="h-20 w-20 rounded-lg object-cover border border-gray-300 mb-2"
                  />
                ) : (
                  <div className="bg-gray-200 border border-dashed rounded-lg w-20 h-20 mb-2 flex items-center justify-center">
                    <FaCamera className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <h3 className="text-base font-bold text-gray-900">{staffMember.firstName} {staffMember.lastName}</h3>
                <p className="text-gray-600 text-sm">{staffMember.position}</p>
                {staffMember.subject && (
                  <p className="text-xs text-gray-500 mt-1">Subject: {staffMember.subject}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center text-xs">
                  <FaUser className="text-gray-400 mr-2" />
                  <span className="text-gray-600">ID: {staffMember.id}</span>
                </div>
                
                <div className="flex items-center text-xs">
                  <FaPhone className="text-gray-400 mr-2" />
                  <span className="text-gray-600">{staffMember.phone || 'N/A'}</span>
                </div>
                
                <div className="flex items-center text-xs">
                  <FaCalendar className="text-gray-400 mr-2" />
                  <span className="text-gray-600">Joined: {new Date(staffMember.dateOfJoining).toLocaleDateString()}</span>
                </div>
                
                <div className="flex items-center text-xs">
                  <FaDollarSign className="text-gray-400 mr-2" />
                  <span className="text-gray-600">Salary: Rs {Math.round(staffMember.salary || 0)}</span>
                </div>
                
                <div className="flex items-center text-xs">
                  <FaBriefcase className="text-gray-400 mr-2" />
                  <span className="text-gray-600">Job Type: {staffMember.jobType || 'Teaching'}</span>
                </div>
              </div>
              
              {/* Classes Teaching - Moved to left column */}
              <div className="mt-4 pt-3 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Classes Teaching</h4>
                {teacherClasses.length > 0 ? (
                  <div className="space-y-2">
                    {teacherClasses.map((classItem, index) => (
                      <div key={index} className="border border-gray-200 rounded p-2">
                        <div className="flex items-center">
                          <FaChalkboardTeacher className="text-gray-400 mr-1 text-xs" />
                          <h5 className="font-medium text-gray-900 text-xs">{classItem.className}</h5>
                        </div>
                        <div className="mt-1">
                          <p className="text-xs text-gray-600">Subjects:</p>
                          <p className="text-xs text-gray-900">{classItem.subjects.join(', ')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-xs">No classes assigned</p>
                )}
              </div>
            </div>
            
            {/* Financial and Other Information */}
            <div className="lg:col-span-2 space-y-4">
              {/* Financial Summary */}
              <div className="bg-white rounded-lg shadow p-3">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Financial Summary</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-blue-50 rounded p-2">
                    <p className="text-xs text-gray-600">Monthly Salary</p>
                    <p className="text-sm font-bold text-gray-900">Rs {Math.round(monthlyTotal)}</p>
                  </div>
                  
                  <div className="bg-yellow-50 rounded p-2">
                    <p className="text-xs text-gray-600">Advances Taken</p>
                    <p className="text-sm font-bold text-gray-900">Rs {Math.round(memberAdvances)}</p>
                  </div>
                  
                  <div className="bg-green-50 rounded p-2">
                    <p className="text-xs text-gray-600">Total Paid</p>
                    <p className="text-sm font-bold text-gray-900">Rs {Math.round(memberPaidSalaries)}</p>
                  </div>
                  
                  <div className={`rounded p-2 ${memberPending > 0 ? 'bg-red-50' : memberPending < 0 ? 'bg-yellow-50' : 'bg-green-50'}`}>
                    <p className="text-xs text-gray-600">
                      {memberPending > 0 ? 'Amount Due' : memberPending < 0 ? 'Advance Balance' : 'Account Settled'}
                    </p>
                    <p className={`text-sm font-bold ${memberPending > 0 ? 'text-red-600' : memberPending < 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                      Rs {memberPending !== 0 ? Math.abs(Math.round(memberPending)) : '0'}
                      {memberPending > 0 ? ' (Due)' : memberPending < 0 ? ' (Advance)' : ''}
                    </p>
                  </div>
                </div>
                
                {/* Worked Months vs Paid Salaries */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Payroll Details</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                      <div>
                        <p className="text-gray-600 text-sm">Worked Months</p>
                        <p className="font-bold text-gray-900 text-lg">{adjustedMonthsSinceJoining.toFixed(1)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Expected Earnings</p>
                        <p className="font-bold text-green-600 text-lg">Rs {Math.round(expectedSalaries)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Salary History */}
              <div className="bg-white rounded-lg shadow p-3">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Salary History</h4>
                {staffMember.salaryHistory && staffMember.salaryHistory.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-xs">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                          <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {staffMember.salaryHistory.map((record, index) => (
                          <tr key={index}>
                            <td className="px-2 py-1 whitespace-nowrap text-gray-900">{record.month}</td>
                            <td className="px-2 py-1 whitespace-nowrap text-gray-900">
                              {record.status === 'advance' ? 'Advance' : 'Salary'}
                            </td>
                            <td className="px-2 py-1 whitespace-nowrap text-gray-900">
                              Rs {Math.round(Math.abs(record.netSalary))}
                            </td>
                            <td className="px-2 py-1 whitespace-nowrap">
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                                record.status === 'paid' ? 'bg-green-100 text-green-800' : 
                                record.status === 'advance' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-2 py-1 whitespace-nowrap text-gray-900">
                              {record.paymentDate ? new Date(record.paymentDate).toLocaleDateString() : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 text-xs">No salary history available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDetailsModal;