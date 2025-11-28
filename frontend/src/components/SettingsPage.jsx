import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateSchoolInfo, fetchSchoolInfo, setHolidays } from '../store/settingsSlice';
import { FaSchool, FaGraduationCap, FaToggleOn, FaToggleOff, FaSave, FaUndo, FaCalendarAlt, FaPlus, FaTrash, FaSun, FaSnowflake, FaBook, FaQuestionCircle } from 'react-icons/fa';
import { SCHOOL_CONFIG } from '../config/schoolConfig';
import AppGuideModal from './settings/AppGuideModal';

const SettingsPage = () => {
  const dispatch = useDispatch();
  const { schoolInfo, loading, error } = useSelector(state => state.settings);
  
  const [formData, setFormData] = useState({
    level: SCHOOL_CONFIG.level,
    hasPG: SCHOOL_CONFIG.hasPG,
    hasNursery: SCHOOL_CONFIG.hasNursery,
    hasKG: SCHOOL_CONFIG.hasKG,
  });
  
  const [holidays, setHolidaysState] = useState([]);
  const [vacations, setVacations] = useState({
    summer: { start: '', end: '' },
    winter: { start: '', end: '' }
  });
  
  // Add state for weekend configuration
  const [weekendDays, setWeekendDays] = useState([0]); // Default to Sunday (0)
  
  // State for AppGuideModal
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Initialize form with school info
  useEffect(() => {
    dispatch(fetchSchoolInfo());
  }, [dispatch]);

  useEffect(() => {
    if (schoolInfo) {
      setFormData({
        level: schoolInfo.level || SCHOOL_CONFIG.level,
        hasPG: schoolInfo.hasPG !== undefined ? schoolInfo.hasPG : SCHOOL_CONFIG.hasPG,
        hasNursery: schoolInfo.hasNursery !== undefined ? schoolInfo.hasNursery : SCHOOL_CONFIG.hasNursery,
        hasKG: schoolInfo.hasKG !== undefined ? schoolInfo.hasKG : SCHOOL_CONFIG.hasKG,
      });
      
      // Set holidays from schoolInfo, converting to new format if needed
      // Ensure holidays is an array before trying to map
      if (schoolInfo.holidays) {
        // If holidays is a string, parse it as JSON
        let holidaysData = schoolInfo.holidays;
        if (typeof holidaysData === 'string') {
          try {
            holidaysData = JSON.parse(holidaysData);
          } catch (e) {
            holidaysData = [];
          }
        }
        
        // If holidays is an array, format it properly
        if (Array.isArray(holidaysData)) {
          const formattedHolidays = holidaysData.map(holiday => 
            typeof holiday === 'string' ? { title: '', date: holiday } : holiday
          );
          setHolidaysState(formattedHolidays);
        } else {
          // If holidays is not an array, initialize with empty array
          setHolidaysState([]);
        }
      } else {
        // If no holidays data, initialize with empty array
        setHolidaysState([]);
      }
      
      // Set vacations from schoolInfo
      if (schoolInfo.vacations) {
        setVacations(schoolInfo.vacations);
      } else {
        // Default values for Pakistan
        setVacations({
          summer: { start: '2025-06-01', end: '2025-07-31' },
          winter: { start: '2025-12-20', end: '2026-01-05' }
        });
      }
      
      // Set weekend days from schoolInfo or default to Sunday
      if (schoolInfo.weekendDays && Array.isArray(schoolInfo.weekendDays)) {
        setWeekendDays(schoolInfo.weekendDays);
      } else {
        // Default to Sunday only
        setWeekendDays([0]);
      }
    }
  }, [schoolInfo]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggleChange = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };
  
  // Handle holiday changes
  const handleAddHoliday = () => {
    setHolidaysState(prev => [...prev, { title: '', date: '' }]);
  };
  
  const handleHolidayChange = (index, field, value) => {
    const updatedHolidays = [...holidays];
    updatedHolidays[index] = {
      ...updatedHolidays[index],
      [field]: value
    };
    setHolidaysState(updatedHolidays);
  };
  
  const handleRemoveHoliday = (index) => {
    const updatedHolidays = holidays.filter((_, i) => i !== index);
    setHolidaysState(updatedHolidays);
  };
  
  // Handle vacation changes
  const handleVacationChange = (type, field, value) => {
    setVacations(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }));
  };
  
  // Handle weekend day changes
  const handleWeekendDayChange = (day) => {
    setWeekendDays(prev => {
      if (prev.includes(day)) {
        // Remove day if already selected
        return prev.filter(d => d !== day);
      } else {
        // Add day if not selected
        return [...prev, day];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Format holidays to include both title and date
      // Ensure holidays is always an array before mapping
      const formattedHolidays = Array.isArray(holidays) 
        ? holidays.map(holiday => 
            typeof holiday === 'string' ? { title: '', date: holiday } : holiday
          ).filter(holiday => holiday.date) // Filter out empty dates
        : [];
      
      // Update school info including holidays, vacations, and weekend days
      const result = await dispatch(updateSchoolInfo({
        ...formData,
        holidays: formattedHolidays,
        vacations,
        weekendDays // Add weekend days to the settings
      })).unwrap();
      
      console.log('Settings updated successfully:', result);
    } catch (err) {
      console.error('Failed to update school info:', err);
      // Show error to user
      alert('Failed to update school settings: ' + (err.message || 'Unknown error'));
    }
  };

  const handleReset = () => {
    setFormData({
      level: SCHOOL_CONFIG.level,
      hasPG: SCHOOL_CONFIG.hasPG,
      hasNursery: SCHOOL_CONFIG.hasNursery,
      hasKG: SCHOOL_CONFIG.hasKG,
    });
    
    // Reset holidays to default
    setHolidaysState([
      { title: 'New Year\'s Day', date: '2025-01-01' },
      { title: 'Kashmir Day', date: '2025-02-05' },
      { title: 'Pakistan Day', date: '2025-03-23' },
      { title: 'Labour Day', date: '2025-05-01' },
      { title: 'Independence Day', date: '2025-08-14' },
      { title: 'Iqbal Day', date: '2025-11-09' },
      { title: 'Quaid-e-Azam Day', date: '2025-12-25' }
    ]);
    
    // Reset vacations to default
    setVacations({
      summer: { start: '2025-06-01', end: '2025-07-31' },
      winter: { start: '2025-12-20', end: '2026-01-05' }
    });
    
    // Reset weekend days to default (Sunday only)
    setWeekendDays([0]);
  };

  const getLevelDescription = (level) => {
    switch (level) {
      case 'primary': return 'Primary School (Grades 1-5)';
      case 'middle': return 'Middle School (Grades 6-8)';
      case 'high': return 'High School (Grades 9-10)';
      default: return 'Primary School (Grades 1-5)';
    }
  };
  
  // Days of the week mapping
  const daysOfWeek = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">School Settings</h1>
        <p className="text-gray-600 mt-1">Configure your school's basic information</p>
      </div>

      {/* Help Button */}
      <div className="mb-4">
        <button
          onClick={() => setIsGuideOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-blue-300 shadow-sm text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FaQuestionCircle className="mr-2" />
          How to Use This Page - Complete Guide
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <FaSchool className="text-gray-500 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">School Configuration</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4">
            <div className="space-y-8">
              {/* School Level Section */}
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                  <FaGraduationCap className="mr-2 text-blue-500" />
                  School Level
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['primary', 'middle', 'high'].map((level) => (
                    <div 
                      key={level}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        formData.level === level 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, level }))}
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id={level}
                          name="level"
                          value={level}
                          checked={formData.level === level}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor={level} className="ml-3 block text-sm font-medium text-gray-700">
                          {getLevelDescription(level)}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Early Childhood Education Section */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-md font-medium text-gray-900 mb-4">Early Childhood Education</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div 
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      formData.hasPG 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => handleToggleChange('hasPG')}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Play Group (PG)</span>
                      {formData.hasPG ? 
                        <FaToggleOn className="text-green-500 text-xl" /> : 
                        <FaToggleOff className="text-gray-400 text-xl" />
                      }
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Enable Play Group class
                    </p>
                  </div>
                  
                  <div 
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      formData.hasNursery 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => handleToggleChange('hasNursery')}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Nursery</span>
                      {formData.hasNursery ? 
                        <FaToggleOn className="text-green-500 text-xl" /> : 
                        <FaToggleOff className="text-gray-400 text-xl" />
                      }
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Enable Nursery class
                    </p>
                  </div>
                  
                  <div 
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      formData.hasKG 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => handleToggleChange('hasKG')}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Kindergarten (KG)</span>
                      {formData.hasKG ? 
                        <FaToggleOn className="text-green-500 text-xl" /> : 
                        <FaToggleOff className="text-gray-400 text-xl" />
                      }
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Enable Kindergarten class
                    </p>
                  </div>
                </div>
              </div>

              {/* Weekend Configuration Section */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                  <FaCalendarAlt className="mr-2 text-purple-500" />
                  Weekend Days
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Select which days of the week the school is closed. Students will not be marked as absent on these days.
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {daysOfWeek.map((day) => (
                    <div 
                      key={day.value}
                      className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                        weekendDays.includes(day.value)
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onClick={() => handleWeekendDayChange(day.value)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{day.label}</span>
                        {weekendDays.includes(day.value) ? 
                          <FaToggleOn className="text-purple-500 text-xl" /> : 
                          <FaToggleOff className="text-gray-400 text-xl" />
                        }
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 text-sm text-gray-500">
                  <p>Selected weekend days: {weekendDays.map(day => daysOfWeek.find(d => d.value === day)?.label).join(', ') || 'None'}</p>
                </div>
              </div>

              {/* Vacations Configuration Section */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                  <FaSun className="mr-2 text-orange-500" />
                  School Vacations
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Configure summer and winter vacations. Students will not be marked as absent during these periods.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Summer Vacation */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <FaSun className="text-orange-500 mr-2" />
                      <h4 className="font-medium text-gray-900">Summer Vacation</h4>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                          type="date"
                          value={vacations.summer.start}
                          onChange={(e) => handleVacationChange('summer', 'start', e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                          type="date"
                          value={vacations.summer.end}
                          onChange={(e) => handleVacationChange('summer', 'end', e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Winter Vacation */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <FaSnowflake className="text-blue-500 mr-2" />
                      <h4 className="font-medium text-gray-900">Winter Vacation</h4>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                          type="date"
                          value={vacations.winter.start}
                          onChange={(e) => handleVacationChange('winter', 'start', e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                          type="date"
                          value={vacations.winter.end}
                          onChange={(e) => handleVacationChange('winter', 'end', e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Holidays Configuration Section */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                  <FaCalendarAlt className="mr-2 text-purple-500" />
                  School Holidays
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Configure holidays for the current year. Students will not be marked as absent on these days.
                </p>
                
                <div className="space-y-3">
                  {holidays.map((holiday, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Holiday Title (e.g., Iqbal Day)"
                        value={holiday.title}
                        onChange={(e) => handleHolidayChange(index, 'title', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      <div className="flex items-center space-x-2">
                        <input
                          type="date"
                          value={holiday.date}
                          onChange={(e) => handleHolidayChange(index, 'date', e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveHoliday(index)}
                          className="inline-flex items-center p-2 border border-transparent rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <FaTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddHoliday}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FaPlus className="mr-1 h-4 w-4" />
                    Add Holiday
                  </button>
                </div>
              </div>
              
              
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaUndo className="mr-2 -ml-1 h-4 w-4" />
              Reset
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <FaSave className="mr-2 -ml-1 h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* App Guide Modal */}
      <AppGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
};

export default SettingsPage;