import React, { useState } from 'react';
import { FaPlus, FaTrash, FaSave } from 'react-icons/fa';

const TimeTableSettings = () => {
  // Default schedule configuration
  const defaultSchedule = [
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

  const [scheduleItems, setScheduleItems] = useState(defaultSchedule);
  const [newItem, setNewItem] = useState({
    name: '',
    startTime: '',
    endTime: '',
    type: 'period'
  });

  // Add a new schedule item
  const handleAddItem = () => {
    if (newItem.name && newItem.startTime && newItem.endTime) {
      const newItemObj = {
        id: `item-${Date.now()}`,
        ...newItem
      };
      setScheduleItems([...scheduleItems, newItemObj]);
      setNewItem({
        name: '',
        startTime: '',
        endTime: '',
        type: 'period'
      });
    }
  };

  // Remove a schedule item
  const handleRemoveItem = (id) => {
    setScheduleItems(scheduleItems.filter(item => item.id !== id));
  };

  // Update an existing item
  const handleUpdateItem = (id, field, value) => {
    setScheduleItems(scheduleItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // Save settings (in a real app, this would dispatch to Redux or API)
  const handleSaveSettings = () => {
    console.log('Saving timetable settings:', scheduleItems);
    // In a real app: dispatch(saveTimeTableSettings(scheduleItems))
    alert('Timetable settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Timetable Configuration</h2>
        <p className="text-gray-600 mb-6">
          Configure your school's timetable schedule. Add, remove, or modify periods, breaks, and leave times.
        </p>

        {/* Add New Item Form */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Add New Schedule Item</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={newItem.name}
                onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                placeholder="e.g., Period 1"
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input
                type="time"
                value={newItem.startTime}
                onChange={(e) => setNewItem({...newItem, startTime: e.target.value})}
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input
                type="time"
                value={newItem.endTime}
                onChange={(e) => setNewItem({...newItem, endTime: e.target.value})}
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={newItem.type}
                onChange={(e) => setNewItem({...newItem, type: e.target.value})}
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="period">Period</option>
                <option value="break">Break</option>
                <option value="leave">Leave</option>
              </select>
            </div>
          </div>
          <div className="mt-3">
            <button
              onClick={handleAddItem}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaPlus className="mr-2" /> Add Item
            </button>
          </div>
        </div>

        {/* Schedule Items List */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Current Schedule</h3>
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                    Name
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Start Time
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    End Time
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Type
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {scheduleItems.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                        className="block w-full pl-3 pr-10 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <input
                        type="time"
                        value={item.startTime}
                        onChange={(e) => handleUpdateItem(item.id, 'startTime', e.target.value)}
                        className="block pl-3 pr-10 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <input
                        type="time"
                        value={item.endTime}
                        onChange={(e) => handleUpdateItem(item.id, 'endTime', e.target.value)}
                        className="block pl-3 pr-10 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <select
                        value={item.type}
                        onChange={(e) => handleUpdateItem(item.id, 'type', e.target.value)}
                        className="block pl-3 pr-10 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="period">Period</option>
                        <option value="break">Break</option>
                        <option value="leave">Leave</option>
                      </select>
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <button
                        onClick={() => handleRemoveItem(item.id)}
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
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSaveSettings}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FaSave className="mr-2" /> Save Timetable Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeTableSettings;