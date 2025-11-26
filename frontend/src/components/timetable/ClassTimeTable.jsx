import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaEdit, FaTrash } from 'react-icons/fa';

const ClassTimeTable = ({ classId, sectionId, onEditSlot }) => {
  const { classes } = useSelector(state => state.classes);
  const { staff } = useSelector(state => state.staff);
  
  // Default school schedule periods (this would come from settings in a real app)
  const [schoolSchedule, setSchoolSchedule] = useState([
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
  ]);

  // Days of the week
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // State for timetable data (in a real app, this would come from a store or API)
  const [timetableData, setTimetableData] = useState([]);

  // Get the selected class and section
  const selectedClass = classes.find(c => c.id === classId);
  const selectedSection = selectedClass?.sections.find(s => s.id === sectionId);
  const classSubjects = selectedClass?.subjects || [];

  // Initialize with sample data for demonstration
  useEffect(() => {
    // In a real app, this would fetch from an API or Redux store
    const sampleData = [];
    
    // Create timetable entries for each day and period combination
    daysOfWeek.forEach(day => {
      schoolSchedule
        .filter(item => item.type === 'period')
        .forEach((period, index) => {
          // Get a subject for this period (rotate through available subjects)
          const subjectIndex = index % classSubjects.length;
          const subject = classSubjects[subjectIndex];
          
          if (subject) {
            sampleData.push({
              id: `${classId}-${sectionId}-${day}-${period.id}`,
              classId,
              sectionId,
              day,
              periodId: period.id,
              periodName: period.name,
              startTime: period.startTime,
              endTime: period.endTime,
              subject: subject.name,
              teacher: subject.teacher || '',
              room: `Room ${Math.floor(Math.random() * 10) + 1}`
            });
          }
        });
    });
    
    setTimetableData(sampleData);
  }, [classId, sectionId, classSubjects, schoolSchedule]);

  // Get timetable slots for a specific day and period
  const getSlotForPeriod = (day, periodId) => {
    return timetableData.find(
      slot => slot.classId === classId && 
              slot.sectionId === sectionId && 
              slot.day === day && 
              slot.periodId === periodId
    );
  };

  // Handle delete slot
  const handleDeleteSlot = (slotId) => {
    setTimetableData(prev => prev.filter(slot => slot.id !== slotId));
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden print:shadow-none print:rounded-none">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 print:border-none">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Section Timetable</h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedClass?.name} - {selectedSection?.name} (Monthly/Yearly Schedule)
            </p>
          </div>
          <div className="mt-4 md:mt-0 text-sm text-gray-500">
            School Schedule: 8:00 AM - 2:30 PM
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Period
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              {daysOfWeek.map(day => (
                <th key={day} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {day}
                </th>
              ))}
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:hidden">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {schoolSchedule.map((scheduleItem, index) => {
              // Only show period items (not breaks or leave)
              if (scheduleItem.type !== 'period') {
                return null;
              }
              
              return (
                <tr key={scheduleItem.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {scheduleItem.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {scheduleItem.startTime} - {scheduleItem.endTime}
                  </td>
                  {daysOfWeek.map(day => {
                    const slot = getSlotForPeriod(day, scheduleItem.id);
                    return (
                      <td key={`${day}-${scheduleItem.id}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {slot ? (
                          <div>
                            <div className="font-medium">{slot.subject}</div>
                            <div className="text-gray-500 text-xs">{slot.teacher}</div>
                            <div className="text-gray-400 text-xs">{slot.room}</div>
                          </div>
                        ) : (
                          <button
                            onClick={() => onEditSlot({ 
                              classId, 
                              sectionId, 
                              day, 
                              periodId: scheduleItem.id,
                              periodName: scheduleItem.name,
                              startTime: scheduleItem.startTime,
                              endTime: scheduleItem.endTime
                            })}
                            className="text-blue-600 hover:text-blue-900 text-xs"
                          >
                            + Add Subject
                          </button>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 print:hidden">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          // Edit all slots for this period across all days
                          const periodSlots = daysOfWeek.map(day => 
                            getSlotForPeriod(day, scheduleItem.id)
                          ).filter(slot => slot);
                          
                          if (periodSlots.length > 0) {
                            // For simplicity, edit the first slot found
                            onEditSlot(periodSlots[0]);
                          } else {
                            // Create a new slot for the first day
                            onEditSlot({ 
                              classId, 
                              sectionId, 
                              day: daysOfWeek[0], 
                              periodId: scheduleItem.id,
                              periodName: scheduleItem.name,
                              startTime: scheduleItem.startTime,
                              endTime: scheduleItem.endTime
                            });
                          }
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FaEdit />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            
            {schoolSchedule.filter(item => item.type === 'period').length === 0 && (
              <tr>
                <td colSpan={daysOfWeek.length + 3} className="px-6 py-4 text-center text-sm text-gray-500">
                  No timetable schedule defined. Please configure the timetable schedule in settings.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Weekly Overview Section */}
      <div className="px-4 py-5 sm:px-6 border-t border-gray-200 mt-8">
        <h4 className="text-md font-medium text-gray-900 mb-4">Weekly Schedule Overview</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {daysOfWeek.map(day => {
            const daySlots = timetableData.filter(slot => slot.day === day);
            return (
              <div key={day} className="border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-2">{day}</h5>
                <div className="space-y-2">
                  {daySlots.length > 0 ? (
                    daySlots.map(slot => (
                      <div key={slot.id} className="text-sm">
                        <span className="font-medium">{slot.periodName}:</span> {slot.subject} ({slot.startTime}-{slot.endTime})
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">No classes scheduled</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ClassTimeTable;