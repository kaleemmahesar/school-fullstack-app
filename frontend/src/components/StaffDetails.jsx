import React from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaChalkboardTeacher, FaUser, FaPhone, FaCalendar, FaDollarSign, FaBriefcase, FaBook } from 'react-icons/fa';
import PageHeader from './common/PageHeader';

const StaffDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { staff, loading, error } = useSelector(state => state.staff);
  const { classes } = useSelector(state => state.classes);
  
  // Find the staff member by ID
  const staffMember = staff.find(member => member.id === id);
  
  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }
  
  if (error) {
    return <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-700">Error: {error}</p>
        </div>
      </div>
    </div>;
  }
  
  if (!staffMember) {
    return <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">Staff member not found.</p>
        </div>
      </div>
    </div>;
  }
  
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
  
  const monthsSinceJoining = totalMonths;
  
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
  
  // Calculate pending amount for this member
  // Advances are money already given to staff, so they count as payments
  // memberPaidSalaries already includes advances, so we don't need to add them separately
  const memberPending = (monthsSinceJoining * monthlyTotal) - memberPaidSalaries;
  
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
  
  // Calculate total expected salaries based on joining date (full months worked)
  const totalExpectedSalaries = staff.reduce((sum, member) => {
    // Calculate months since joining
    const joiningDate = new Date(member.dateOfJoining);
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
    const allowances = (member.allowances || []).reduce((allowanceSum, allowance) => {
      return allowanceSum + parseFloat(allowance.amount || 0);
    }, 0);
    const monthlyTotal = parseFloat(member.salary || 0) + allowances;
    
    // Total expected = total months worked * monthly salary
    return sum + (totalMonths * monthlyTotal);
  }, 0);
  
  return (
    <>
      <PageHeader
        title="Staff Details"
        subtitle={`Detailed information for ${staffMember.firstName} ${staffMember.lastName}`}
        actionButton={
          <button
            onClick={() => navigate('/staff')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
          >
            <FaArrowLeft className="mr-2" /> Back to Staff
          </button>
        }
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Staff Information Card */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col items-center mb-6">
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-24 h-24 mb-4" />
            <h3 className="text-xl font-bold text-gray-900">{staffMember.firstName} {staffMember.lastName}</h3>
            <p className="text-gray-600">{staffMember.position}</p>
            {staffMember.subject && (
              <p className="text-sm text-gray-500 mt-1">Subject: {staffMember.subject}</p>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center text-sm">
              <FaUser className="text-gray-400 mr-3" />
              <span className="text-gray-600">ID: {staffMember.id}</span>
            </div>
            
            <div className="flex items-center text-sm">
              <FaPhone className="text-gray-400 mr-3" />
              <span className="text-gray-600">{staffMember.phone || 'N/A'}</span>
            </div>
            
            <div className="flex items-center text-sm">
              <FaCalendar className="text-gray-400 mr-3" />
              <span className="text-gray-600">Joined: {new Date(staffMember.dateOfJoining).toLocaleDateString()}</span>
            </div>
            
            <div className="flex items-center text-sm">
              <FaDollarSign className="text-gray-400 mr-3" />
              <span className="text-gray-600">Salary: Rs {Math.round(staffMember.salary || 0)}</span>
            </div>
            
            <div className="flex items-center text-sm">
              <FaBriefcase className="text-gray-400 mr-3" />
              <span className="text-gray-600">Job Type: {staffMember.jobType || 'Teaching'}</span>
            </div>
          </div>
        </div>
        
        {/* Financial and Class Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Financial Summary */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Monthly Salary</p>
                <p className="text-xl font-bold text-gray-900">Rs {Math.round(monthlyTotal)}</p>
              </div>
              
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Advances Taken</p>
                <p className="text-xl font-bold text-gray-900">Rs {Math.round(memberAdvances)}</p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Total Paid</p>
                <p className="text-xl font-bold text-gray-900">Rs {Math.round(memberPaidSalaries)}</p>
              </div>
              
              <div className={`rounded-lg p-4 ${memberPending > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                <p className="text-sm text-gray-600">Pending Amount</p>
                <p className={`text-xl font-bold ${memberPending > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  Rs {Math.round(Math.abs(memberPending))}
                  {memberPending > 0 ? ' (Due)' : ' (Paid)'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Classes Teaching */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Classes Teaching</h4>
            {teacherClasses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teacherClasses.map((classItem, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <FaChalkboardTeacher className="text-gray-400 mr-2" />
                      <h5 className="font-medium text-gray-900">{classItem.className}</h5>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Subjects:</p>
                      <p className="text-sm text-gray-900">{classItem.subjects.join(', ')}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No classes assigned</p>
            )}
          </div>
          
          {/* Salary History */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Salary History</h4>
            {staffMember.salaryHistory && staffMember.salaryHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {staffMember.salaryHistory.map((record, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{record.month}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {record.status === 'advance' ? 'Advance' : 'Salary'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          Rs {Math.round(Math.abs(record.netSalary))}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            record.status === 'paid' ? 'bg-green-100 text-green-800' : 
                            record.status === 'advance' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {record.paymentDate ? new Date(record.paymentDate).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No salary history available</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default StaffDetails;