import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaSave, FaTimes } from 'react-icons/fa';

const TimeTableForm = ({ selectedClass, selectedSection, editingSlot, onClose, onSubmit }) => {
  const { classes } = useSelector(state => state.classes);
  const { staff } = useSelector(state => state.staff);
  
  // Default school schedule periods (this would come from settings in a real app)
  const schoolSchedule = [
    { id: 'period1', name: '1st Period', startTime: '08:00', endTime: '08:40', type: 'period' },
    { id: 'period2', name: '2nd Period', startTime: '08:40', endTime: '09:20', type: 'period' },
    { id: 'period3', name: '3rd Period', startTime: '09:20', endTime: '10:00', type: 'period' },
    { id: 'break1', name: 'Break', startTime: '10:00', endTime: '10:20', type: 'break' },
    { id: 'period4', name: '4th Period', startTime: '10:20', endTime: '11:00', type: 'period' },
    { id: 'period5', name: '5th Period', startTime: '11:00', endTime: '11:40', type: 'period' },
    { id: 'break2', name: 'Break', startTime: '11:40', endTime: '12:00', type: 'break' },
    { id: 'period6', name: '6th Period', startTime: '12:00', endTime: '12:40', type: 'period' },
    { id: 'period7', name: '7th Period', startTime: '12:40', endTime: '1:20', type: 'period' },
    { id: 'period8', name: '8th Period', startTime: '1:20', endTime: '2:00', type: 'period' },
    { id: 'leave', name: 'Leave', startTime: '2:00', endTime: '2:30', type: 'leave' }
  ];

  // Days of the week
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const [formData, setFormData] = useState({
    id: null,
    classId: selectedClass || '',
    sectionId: selectedSection || '',
    day: 'Monday',
    periodId: '',
    periodName: '',
    startTime: '',
    endTime: '',
    subject: '',
    teacher: '',
    room: ''
  });

  // Get the selected class and its subjects
  const currentClass = classes.find(c => c.id === (formData.classId || selectedClass));
  const classSubjects = currentClass?.subjects || [];
  const classSections = currentClass?.sections || [];

  // Get unique teachers
  const uniqueTeachers = [...new Set(staff.map(member => `${member.firstName} ${member.lastName}`))];

  // Set initial form data when editing
  useEffect(() => {
    if (editingSlot) {
      setFormData({
        ...editingSlot,
        id: editingSlot.id || `${editingSlot.classId}-${editingSlot.sectionId}-${editingSlot.day}-${editingSlot.periodId}`
      });
    } else {
      setFormData({
        id: null,
        classId: selectedClass || '',
        sectionId: selectedSection || '',
        day: 'Monday',
        periodId: '',
        periodName: '',
        startTime: '',
        endTime: '',
        subject: '',
        teacher: '',
        room: ''
      });
    }
  }, [editingSlot, selectedClass, selectedSection]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-populate period times
    if (name === 'periodId') {
      const selectedPeriod = schoolSchedule.find(p => p.id === value);
      if (selectedPeriod) {
        setFormData(prev => ({
          ...prev,
          periodId: value,
          periodName: selectedPeriod.name,
          startTime: selectedPeriod.startTime,
          endTime: selectedPeriod.endTime
        }));
      }
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would dispatch an action to save the timetable slot
    console.log('Saving timetable slot:', formData);
    onSubmit();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {editingSlot ? 'Edit Timetable Slot' : 'Add New Timetable Slot'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <FaTimes />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
                <select
                  name="classId"
                  value={formData.classId}
                  onChange={handleInputChange}
                  required
                  className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select Class</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section *</label>
                <select
                  name="sectionId"
                  value={formData.sectionId}
                  onChange={handleInputChange}
                  required
                  disabled={!formData.classId}
                  className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50"
                >
                  <option value="">Select Section</option>
                  {classSections.map(section => (
                    <option key={section.id} value={section.id}>{section.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Day *</label>
                <select
                  name="day"
                  value={formData.day}
                  onChange={handleInputChange}
                  required
                  className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  {daysOfWeek.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Period *</label>
                <select
                  name="periodId"
                  value={formData.periodId}
                  onChange={handleInputChange}
                  required
                  className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select Period</option>
                  {schoolSchedule
                    .filter(period => period.type === 'period')
                    .map(period => (
                      <option key={period.id} value={period.id}>
                        {period.name} ({period.startTime} - {period.endTime})
                      </option>
                    ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select Subject</option>
                  {classSubjects.map(subject => (
                    <option key={subject.id} value={subject.name}>{subject.name} ({subject.teacher})</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
                <select
                  name="teacher"
                  value={formData.teacher}
                  onChange={handleInputChange}
                  className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select Teacher</option>
                  {uniqueTeachers.map(teacher => (
                    <option key={teacher} value={teacher}>{teacher}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
                <input
                  type="text"
                  name="room"
                  value={formData.room}
                  onChange={handleInputChange}
                  placeholder="Room number"
                  className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaSave className="mr-2" /> {editingSlot ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TimeTableForm;