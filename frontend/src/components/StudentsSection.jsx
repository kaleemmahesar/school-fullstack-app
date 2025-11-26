import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchStudents, addStudent, updateStudent, deleteStudent, payFees } from '../store/studentsSlice';
import { fetchClasses } from '../store/classesSlice';
import { FaEdit, FaTrash, FaSearch, FaUserGraduate, FaIdCard, FaPhone, FaEnvelope, FaCalendar, FaDollarSign, FaSchool, FaMoneyBillWave, FaHistory, FaPrint, FaCheck, FaTimes } from 'react-icons/fa';
import PageHeader from './common/PageHeader';
import StudentManagement from './students/StudentManagement';

const StudentsSection = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { students, loading, error } = useSelector(state => state.students);
  const { classes } = useSelector(state => state.classes);

  useEffect(() => {
    console.log('StudentsSection mounted, current students count:', students.length);
    // Only fetch students if the store is empty (initial load)
    if (students.length === 0) {
      console.log('Fetching students and classes for initial load');
      dispatch(fetchStudents());
    }
    dispatch(fetchClasses());
  }, [dispatch, students.length]);

  if (loading && students.length === 0) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  if (error && students.length === 0) return <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
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

  return (
    <>
      {/* Use the new unified student management component */}
      <StudentManagement onAddStudent={() => navigate('/students/admission')} />
    </>
  );
};

export default StudentsSection;