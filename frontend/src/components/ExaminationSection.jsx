import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchExams, addExam, updateExam, deleteExam } from '../store/examsSlice';
import { fetchClasses } from '../store/classesSlice';
import { fetchStudents } from '../store/studentsSlice';
import { fetchMarks } from '../store/marksSlice';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaCalendarAlt, FaFileAlt, FaEye, FaCheck, FaChartBar } from 'react-icons/fa';
import ExamSlipGenerator from './examinations/ExamSlipGenerator';
import ExamResultsTracker from './examinations/ExamResultsTracker';
import ClassExamResultsView from './examinations/ClassExamResultsView';
import { getCurrentAcademicYear } from '../utils/dateUtils';

const ExaminationSection = () => {
  const dispatch = useDispatch();
  const { exams, loading, error } = useSelector(state => state.exams);
  const { classes } = useSelector(state => state.classes);
  const { students } = useSelector(state => state.students);
  const { marks } = useSelector(state => state.marks); // Get marks from the marks slice
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [currentExam, setCurrentExam] = useState(null);
  const [view, setView] = useState('list'); // 'list', 'detail', 'slips', 'results', or 'class-results'
  const [selectedExam, setSelectedExam] = useState(null);
  
  // Set default dates to today
  const today = new Date().toISOString().split('T')[0];
  
  const [formData, setFormData] = useState({
    name: '',
    classes: [], // Changed from single class to array of classes
    section: '',
    examType: '',
    startDate: today, // Set default to today
    endDate: today,   // Set default to today
    subjects: [],
    maxMarks: 100
  });

  useEffect(() => {
    dispatch(fetchExams());
    dispatch(fetchClasses());
    dispatch(fetchStudents());
    dispatch(fetchMarks()); // Add fetch marks
  }, [dispatch]);

  // Add effect to log when marks change
  useEffect(() => {
    console.log('=== MARKS STATE CHANGED ===');
    console.log('Marks state:', marks);
    console.log('Marks data:', marks.marks);
    console.log('Marks loading:', marks.loading);
    console.log('Marks error:', marks.error);
  }, [marks]);

  const handleEdit = (exam) => {
    setCurrentExam(exam);
    setFormData({
      ...exam,
      classes: [exam.class] // For editing, we'll show the single class as selected
    });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this examination?')) {
      dispatch(deleteExam(id));
    }
  };

  const handleSave = (examData) => {
    if (currentExam) {
      // For editing, we need to preserve the scheduled subjects structure
      dispatch(updateExam(examData));
    } else {
      // Create exams for each selected class
      examData.classes.forEach(className => {
        // Check if this class is eligible (has students in current batch who haven't passed out)
        const isClassEligible = students.some(student => 
          student.class === className && 
          student.academicYear === currentAcademicYear && 
          student.status !== 'passed_out' && 
          student.status !== 'left'
        );
        
        // Also check if class simply exists in our class data
        const classExists = classes.some(c => c.name === className);
        
        // Create exam if class is eligible OR if we simply have the class data (less restrictive)
        if (isClassEligible || classExists) {
          // Get subjects for this class from the class data and apply schedule
          const classSubjects = classes.find(c => c.name === className)?.subjects || [];
          const scheduledSubjectsForClass = examData.scheduledSubjects?.find(sc => sc.className === className)?.subjects || [];
          
          // Merge scheduled data with class subjects
          const subjectsWithSchedule = classSubjects.map(subject => {
            const subjectId = subject.id || subject.name;
            const scheduledSubject = scheduledSubjectsForClass.find(s => (s.id || s.name) === subjectId);
            return {
              ...subject,
              date: scheduledSubject?.date || subject.date || '',
              time: scheduledSubject?.time || subject.time || '',
              duration: scheduledSubject?.duration || subject.duration || 180
            };
          });
          
          // Create a copy of examData and remove classes and scheduledSubjects
          const examForClass = {
            ...examData,
            class: className,
            subjects: subjectsWithSchedule
          };
          
          // Remove the classes array and scheduledSubjects as we're creating individual exams
          delete examForClass.classes;
          delete examForClass.scheduledSubjects;
          dispatch(addExam(examForClass));
        }
      });
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      classes: [],
      section: '',
      examType: '',
      startDate: today, // Set default to today
      endDate: today,   // Set default to today
      subjects: [],
      maxMarks: 100
    });
    setCurrentExam(null);
    setShowForm(false);
  };

  const handleViewDetails = (exam) => {
    setSelectedExam(exam);
    setView('detail');
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedExam(null);
  };

  // Filter classes to only include those with students in current batch who haven't passed out
  const currentAcademicYear = getCurrentAcademicYear();
  const eligibleClasses = classes.filter(cls => {
    // Check if this class has any students in the current academic year who haven't passed out
    return students.some(student => 
      student.class === cls.name && 
      student.academicYear === currentAcademicYear && 
      student.status !== 'passed_out' && 
      student.status !== 'left'
    );
  });
  
  // Use all classes - don't filter based on students
  // This allows creating exams for all configured classes regardless of current student enrollment
  const availableClasses = classes;
  
  // Filter exams based on search term and current academic year
  const filteredExams = exams.filter(exam => 
    exam.academicYear === currentAcademicYear &&
    (exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.examType.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  if (error) return <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
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
    <div className="">
      <div className="mb-4 p-2 bg-yellow-100 text-yellow-800 text-xs">
        <p>Debug Info - ExaminationSection:</p>
        <p>Exams: {exams.length}</p>
        <p>Students: {students.length}</p>
        <p>Marks from Redux: {marks.marks ? marks.marks.length : 'undefined'}</p>
        <p>Marks type: {marks.marks ? typeof marks.marks : 'undefined'}</p>
        <p>Marks loading: {marks.loading ? 'true' : 'false'}</p>
        <p>Marks error: {marks.error || 'none'}</p>
      </div>
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Examinations Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            {view === 'list' ? 'Manage examinations and schedules' : 
             view === 'slips' ? 'Generate examination slips' :
             view === 'results' ? 'Track examination results' :
             view === 'class-results' ? 'View class-wise examination results' :
             'Examination details'}
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          {view === 'list' && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="print:hidden inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaPlus className="mr-2" /> {showForm ? 'Cancel' : 'Create Exam'}
            </button>
          )}
          {view === 'list' && (
            <div className="flex space-x-2">
              <button
                onClick={() => setView('slips')}
                className="print:hidden inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaFileAlt className="mr-2" /> Exam Slips
              </button>
              <button
                onClick={() => setView('results')}
                className="print:hidden inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaChartBar className="mr-2" /> Results Tracker
              </button>
              <button
                onClick={() => setView('class-results')}
                className="print:hidden inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaChartBar className="mr-2" /> Class Results
              </button>
            </div>
          )}
        </div>
      </div>

      {view === 'list' && (
        <>
          {showForm && (
            <ExamForm 
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSave}
              onCancel={resetForm}
              classes={availableClasses}
            />
          )}

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="mb-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search examinations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Examination</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Range</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Academic Year</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredExams.map((exam) => (
                    <tr key={exam.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FaCalendarAlt className="text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{exam.name}</div>
                            <div className="text-sm text-gray-500">{exam.section ? `${exam.section}` : 'All Sections'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{exam.class}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {exam.examType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {exam.startDate} to {exam.endDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {exam.academicYear}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {exam.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewDetails(exam)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleEdit(exam)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(exam.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredExams.length === 0 && (
              <div className="text-center py-12">
                <FaCalendarAlt className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No examinations found</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new examination.</p>
              </div>
            )}
          </div>
        </>
      )}

      {view === 'detail' && selectedExam && (
        <ExamDetail exam={selectedExam} classes={classes} />
      )}
      {view === 'slips' && (
        <ExamSlipGenerator />
      )}
      {view === 'results' && (
        <ExamResultsTracker />
      )}
      {view === 'class-results' && (
        marks.loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : marks.error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">Error loading marks: {marks.error}</p>
              </div>
            </div>
          </div>
        ) : (
          <ClassExamResultsView 
            exams={filteredExams} // Pass filtered exams instead of all exams
            students={students}
            marks={marks} // Pass the entire marks object, let ClassExamResultsView handle extraction
          />
        )
      )}

    </div>
  );
};

// Exam Form Component
const ExamForm = ({ formData, setFormData, onSubmit, onCancel, classes }) => {
  // Set default dates to today
  const today = new Date().toISOString().split('T')[0];
  
  const [subjectSchedule, setSubjectSchedule] = useState({});

  // Initialize subject schedule when form data changes
  useEffect(() => {
    // Create a default schedule for all subjects in selected classes
    const initialSchedule = {};
    
    // If we're editing an existing exam, initialize with existing subject data
    if (formData.id && formData.subjects) {
      formData.subjects.forEach(subject => {
        const subjectKey = subject.id || subject.name;
        initialSchedule[subjectKey] = {
          date: subject.date || today, // Set default to today
          time: subject.time || '10:00', // Set default to 10:00 AM
          duration: subject.duration || 180
        };
      });
    } else {
      // For new exams, initialize with default values
      formData.classes.forEach(className => {
        const classObj = classes.find(c => c.name === className);
        if (classObj && classObj.subjects) {
          classObj.subjects.forEach(subject => {
            const subjectKey = subject.id || subject.name;
            if (!initialSchedule[subjectKey]) {
              initialSchedule[subjectKey] = {
                date: subject.date || today, // Set default to today
                time: subject.time || '10:00', // Set default to 10:00 AM
                duration: subject.duration || 180
              };
            }
          });
        }
      });
    }
    
    // Only update if we have new data
    if (Object.keys(initialSchedule).length > 0) {
      setSubjectSchedule(prev => ({
        ...prev,
        ...initialSchedule
      }));
    }
  }, [formData.classes, classes, formData.id, formData.subjects]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle multiple class selection
  const handleClassChange = (className) => {
    setFormData(prev => {
      const newClasses = prev.classes.includes(className)
        ? prev.classes.filter(c => c !== className) // Remove if already selected
        : [...prev.classes, className]; // Add if not selected
      return {
        ...prev,
        classes: newClasses
      };
    });
  };

  // Handle subject schedule changes
  const handleSubjectScheduleChange = (subjectId, field, value) => {
    setSubjectSchedule(prev => ({
      ...prev,
      [subjectId]: {
        ...prev[subjectId],
        [field]: value
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Prepare subjects with schedule data
    const classesWithScheduledSubjects = formData.classes.map(className => {
      const classObj = classes.find(c => c.name === className);
      if (!classObj) return { className, subjects: [] };
      
      const scheduledSubjects = classObj.subjects.map(subject => {
        const schedule = subjectSchedule[subject.id] || subjectSchedule[subject.name] || {};
        return {
          ...subject,
          date: schedule.date || today, // Use today as default
          time: schedule.time || '10:00', // Use 10:00 AM as default
          duration: schedule.duration || 180
        };
      });
      
      return {
        className,
        subjects: scheduledSubjects
      };
    });
    
    // Submit with scheduled subjects
    onSubmit({
      ...formData,
      scheduledSubjects: classesWithScheduledSubjects
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {formData.id ? 'Edit Examination' : 'Create New Examination'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Examination Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter examination name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Examination Type *</label>
            <select
              name="examType"
              value={formData.examType}
              onChange={handleChange}
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select examination type</option>
              <option value="Midterm">Midterm</option>
              <option value="Final">Final</option>
              <option value="Quiz">Quiz</option>
              <option value="Assignment">Assignment</option>
              <option value="Project">Project</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Marks</label>
            <input
              type="number"
              name="maxMarks"
              value={formData.maxMarks}
              onChange={handleChange}
              min="1"
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Classes *</label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {classes.map((cls) => (
              <div key={cls.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`class-${cls.id}`}
                  checked={formData.classes.includes(cls.name)}
                  onChange={() => handleClassChange(cls.name)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={`class-${cls.id}`} className="ml-2 block text-sm text-gray-900">
                  {cls.name}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        {formData.classes.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject Schedule</label>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-4">
                {formData.classes.map((className, classIndex) => {
                  const classObj = classes.find(c => c.name === className);
                  if (!classObj || !classObj.subjects) return null;
                  
                  return (
                    <div key={classIndex} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                      <h4 className="font-medium text-gray-900 mb-2">{className} Subjects</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {classObj.subjects.map((subject, subjectIndex) => {
                          const subjectKey = subject.id || subject.name;
                          const schedule = subjectSchedule[subjectKey] || {};
                          
                          return (
                            <div key={subjectIndex} className="bg-white rounded-lg p-3 shadow-sm">
                              <div className="font-medium text-gray-900 mb-2">{subject.name}</div>
                              <div className="grid grid-cols-3 gap-2">
                                <div>
                                  <label className="block text-xs text-gray-500">Date</label>
                                  <input
                                    type="date"
                                    value={schedule.date || ''}
                                    onChange={(e) => handleSubjectScheduleChange(subjectKey, 'date', e.target.value)}
                                    className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-500">Time</label>
                                  <input
                                    type="time"
                                    value={schedule.time || '10:00'}
                                    onChange={(e) => handleSubjectScheduleChange(subjectKey, 'time', e.target.value)}
                                    className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-500">Duration (mins)</label>
                                  <input
                                    type="number"
                                    min="1"
                                    value={schedule.duration || 180}
                                    onChange={(e) => handleSubjectScheduleChange(subjectKey, 'duration', parseInt(e.target.value))}
                                    className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FaCheck className="mr-2" /> {formData.id ? 'Update' : 'Create'} Examination
          </button>
        </div>
      </form>
    </div>
  );
};

// Exam Detail Component
const ExamDetail = ({ exam, classes }) => {
  const classObj = classes.find(c => c.name === exam.class);
  
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{exam.name}</h2>
          <p className="text-gray-600 mt-1">{exam.class} - {exam.examType}</p>
        </div>
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Examination Details</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Start Date:</span>
              <span className="font-medium">{exam.startDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">End Date:</span>
              <span className="font-medium">{exam.endDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Academic Year:</span>
              <span className="font-medium">{exam.academicYear}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                {exam.status}
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Schedule Information</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Section:</span>
              <span className="font-medium">{exam.section || 'All Sections'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Max Marks:</span>
              <span className="font-medium">{exam.maxMarks}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Subject Schedule</h3>
        {exam.subjects && exam.subjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exam.subjects.map((subject, index) => (
              <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="font-medium text-gray-900">{subject.name}</div>
                <div className="mt-2 text-sm text-gray-600">
                  <div>Date: {subject.date || 'Not scheduled'}</div>
                  <div>Time: {subject.time || 'Not scheduled'}</div>
                  <div>Duration: {subject.duration || 'Not set'} minutes</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No subjects scheduled for this examination.</p>
        )}
      </div>
    </div>
  );
};

export default ExaminationSection;