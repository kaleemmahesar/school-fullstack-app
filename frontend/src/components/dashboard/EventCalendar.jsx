import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaCalendarAlt, FaChevronLeft, FaChevronRight, FaPlus, FaTimes, FaPrint, FaShare, FaWhatsapp } from 'react-icons/fa';
import { fetchSchoolInfo } from '../../store/settingsSlice';
import { API_BASE_URL } from '../../utils/apiConfig';

const EventCalendar = () => {
  const dispatch = useDispatch();
  const { schoolInfo } = useSelector(state => state.settings);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: ''
  });
  const [showPrintView, setShowPrintView] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [savedEvent, setSavedEvent] = useState(null);
  
  // Fetch school info on component mount
  useEffect(() => {
    dispatch(fetchSchoolInfo());
    
    // Fetch events from db.json
    fetchEvents();
  }, [dispatch]);
  
  // Fetch events from db.json
  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/events`);
      if (response.ok) {
        const eventData = await response.json();
        // Convert date strings to Date objects
        const formattedEvents = eventData.map(event => ({
          ...event,
          date: new Date(event.date)
        }));
        setEvents(formattedEvents);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };
  
  // Generate events from school holidays and vacations
  const generateEvents = () => {
    const events = [];
    
    // Add holidays as events
    if (schoolInfo && schoolInfo.holidays && Array.isArray(schoolInfo.holidays)) {
      schoolInfo.holidays.forEach((holiday, index) => {
        if (holiday) {
          // Handle both old format (string) and new format (object with title and date)
          const holidayDate = typeof holiday === 'string' ? holiday : holiday.date;
          const holidayTitle = typeof holiday === 'string' ? 'Holiday' : (holiday.title || 'Holiday');
          
          if (holidayDate) {
            events.push({
              id: `holiday-${index}`,
              title: holidayTitle,
              date: new Date(holidayDate),
              type: 'holiday'
            });
          }
        }
      });
    }
    
    // Add vacations as events
    if (schoolInfo && schoolInfo.vacations) {
      const { summer, winter } = schoolInfo.vacations;
      
      // Summer vacation - create events for each day in the range
      if (summer && summer.start && summer.end) {
        const startDate = new Date(summer.start);
        const endDate = new Date(summer.end);
        
        // Add the start date as a vacation event
        events.push({
          id: 'summer-vacation-start',
          title: 'Summer Vacation',
          date: startDate,
          type: 'vacation'
        });
      }
      
      // Winter vacation - create events for each day in the range
      if (winter && winter.start && winter.end) {
        const startDate = new Date(winter.start);
        const endDate = new Date(winter.end);
        
        // Add the start date as a vacation event
        events.push({
          id: 'winter-vacation-start',
          title: 'Winter Break',
          date: startDate,
          type: 'vacation'
        });
      }
    }
    
    return events;
  };
  
  // Combine system events with user-created events
  const allEvents = [...generateEvents(), ...events];

  // Function to get days in month
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Function to get first day of month
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  // Function to navigate to previous month
  const prevMonth = () => {
    setCurrentDate(prev => {
      const prevMonth = new Date(prev);
      prevMonth.setMonth(prevMonth.getMonth() - 1);
      return prevMonth;
    });
  };

  // Function to navigate to next month
  const nextMonth = () => {
    setCurrentDate(prev => {
      const nextMonth = new Date(prev);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      return nextMonth;
    });
  };

  // Function to check if a date has events
  const getEventsForDate = (date) => {
    const events = allEvents.filter(event => 
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
    );
    
    // Additionally check if date falls within vacation periods
    if (schoolInfo && schoolInfo.vacations) {
      const { summer, winter } = schoolInfo.vacations;
      const dateString = date.toISOString().split('T')[0];
      
      // Check summer vacation
      if (summer && summer.start && summer.end) {
        if (dateString >= summer.start && dateString <= summer.end) {
          // Add a vacation event if not already present
          if (!events.some(e => e.type === 'vacation')) {
            events.push({
              id: `vacation-${dateString}`,
              title: 'Vacation',
              date: date,
              type: 'vacation'
            });
          }
        }
      }
      
      // Check winter vacation
      if (winter && winter.start && winter.end) {
        if (dateString >= winter.start && dateString <= winter.end) {
          // Add a vacation event if not already present
          if (!events.some(e => e.type === 'vacation')) {
            events.push({
              id: `vacation-${dateString}`,
              title: 'Vacation',
              date: date,
              type: 'vacation'
            });
          }
        }
      }
    }
    
    return events;
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push(date);
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Handle date click
  const handleDateClick = (date) => {
    // Don't allow adding events for past dates (before today)
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time part for comparison
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0); // Reset time part for comparison
    
    if (selectedDate < today) {
      return; // Don't allow selecting past dates
    }
    
    // Get events for this date to check if it's a holiday or vacation
    const dayEvents = getEventsForDate(date);
    const hasHolidayOrVacation = dayEvents.some(event => 
      event.type === 'holiday' || event.type === 'vacation'
    );
    
    // Don't allow adding events on holidays or vacations
    if (hasHolidayOrVacation) {
      return;
    }
    
    // Check if there are existing user-created events
    const existingEvents = dayEvents.filter(event => event.type === 'event');
    
    if (existingEvents.length > 0) {
      // For now, just open the first event for editing
      // In a more advanced implementation, you might want to show a list of events
      const eventToEdit = existingEvents[0];
      setSelectedDate(date);
      setNewEvent({
        title: eventToEdit.title,
        description: eventToEdit.description || '',
        startTime: eventToEdit.startTime || '',
        endTime: eventToEdit.endTime || ''
      });
      setEditingEventId(eventToEdit.id);
      setShowEventModal(true);
    } else {
      // No existing events, create a new one
      setSelectedDate(date);
      setNewEvent({
        title: '',
        description: '',
        startTime: '',
        endTime: ''
      });
      setEditingEventId(null);
      setShowEventModal(true);
    }
  };

  // Handle event input change
  const handleEventInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Check if there's a time conflict with existing events
  const hasTimeConflict = () => {
    if (!selectedDate || !newEvent.startTime) return false;
    
    // Get all events on the selected date
    const dateEvents = allEvents.filter(event => 
      event.date.getDate() === selectedDate.getDate() &&
      event.date.getMonth() === selectedDate.getMonth() &&
      event.date.getFullYear() === selectedDate.getFullYear() &&
      event.type === 'event' // Only check user-created events
    );
    
    // If we're editing, exclude the current event from conflict check
    const filteredEvents = editingEventId 
      ? dateEvents.filter(event => event.id !== editingEventId)
      : dateEvents;
    
    // Check for time conflicts
    for (const event of filteredEvents) {
      // If the existing event doesn't have time info, skip
      if (!event.startTime) continue;
      
      // Check if both events have start and end times
      if (newEvent.endTime && event.endTime) {
        // Check if time ranges overlap
        if (newEvent.startTime < event.endTime && newEvent.endTime > event.startTime) {
          return true;
        }
      } else if (newEvent.startTime === event.startTime) {
        // If only start times are provided, check for exact match
        return true;
      }
    }
    
    return false;
  };

  // Save or update event to db.json
  const saveEvent = async () => {
    if (!newEvent.title || !selectedDate) return;
    
    // Check for time conflicts (but allow editing the current event)
    if (hasTimeConflict()) {
      alert('There is already an event scheduled at this time. Please choose a different time.');
      return;
    }
    
    const event = {
      title: newEvent.title,
      description: newEvent.description,
      date: selectedDate.toISOString(),
      startTime: newEvent.startTime,
      endTime: newEvent.endTime,
      type: 'event'
    };
    
    try {
      let response;
      
      if (editingEventId) {
        // Update existing event
        event.id = editingEventId;
        response = await fetch(`${API_BASE_URL}/events/${editingEventId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        });
      } else {
        // Create new event
        event.id = `event-${Date.now()}`;
        response = await fetch(`${API_BASE_URL}/events`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        });
      }
      
      if (response.ok) {
        const savedEventData = await response.json();
        // Convert date string back to Date object for local state
        const formattedEvent = {
          ...savedEventData,
          date: new Date(savedEventData.date)
        };
        
        if (editingEventId) {
          // Update existing event in state
          setEvents(prev => prev.map(e => e.id === editingEventId ? formattedEvent : e));
        } else {
          // Add new event to state
          setEvents(prev => [...prev, formattedEvent]);
          // Set saved event for sharing
          setSavedEvent(formattedEvent);
          setShowShareOptions(true);
        }
        
        setShowEventModal(false);
        setEditingEventId(null);
      } else {
        console.error('Failed to save event');
      }
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  // Print events
  const printEvents = () => {
    setShowPrintView(true);
    // Small delay to ensure print view is rendered
    setTimeout(() => {
      window.print();
    }, 500);
  };
  
  // Generate WhatsApp share link for event
  const generateWhatsAppShareLink = () => {
    if (!savedEvent) return '';
    
    // Format event details for WhatsApp message
    let message = `*School Event Notification*\n\n`;
    message += `📅 *Event:* ${savedEvent.title}\n`;
    message += `🗓️ *Date:* ${savedEvent.date.toLocaleDateString()}\n`;
    
    if (savedEvent.startTime) {
      message += `⏰ *Time:* ${savedEvent.startTime}`;
      if (savedEvent.endTime) {
        message += ` - ${savedEvent.endTime}`;
      }
      message += `\n`;
    }
    
    if (savedEvent.description) {
      message += `📝 *Details:* ${savedEvent.description}\n`;
    }
    
    message += `\nPlease mark your calendars!`;
    
    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Return WhatsApp web URL
    return `https://web.whatsapp.com/send?text=${encodedMessage}`;
  };
  
  // Open WhatsApp for sharing
  const shareOnWhatsApp = () => {
    const whatsappUrl = generateWhatsAppShareLink();
    if (whatsappUrl) {
      window.open(whatsappUrl, '_blank');
      setShowShareOptions(false);
      setSavedEvent(null);
    }
  };
  
  // Close share options without sharing
  const closeShareOptions = () => {
    setShowShareOptions(false);
    setSavedEvent(null);
  };

  // Print view component
  const PrintView = () => (
    <div className="print-view" style={{ display: showPrintView ? 'block' : 'none' }}>
      <div className="p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">School Event Calendar</h1>
          <p className="text-gray-600 mt-2">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allEvents
            .filter(event => event.date.getMonth() === currentDate.getMonth() && event.date.getFullYear() === currentDate.getFullYear())
            .sort((a, b) => a.date - b.date)
            .map(event => (
              <div key={event.id} className="border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {event.date.toLocaleDateString()} 
                      {event.startTime && ` at ${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''}`}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    event.type === 'holiday' ? 'bg-red-100 text-red-800' :
                    event.type === 'vacation' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                  </span>
                </div>
                {event.description && (
                  <p className="mt-3 text-gray-700">{event.description}</p>
                )}
              </div>
            ))
          }
        </div>
        
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Generated on {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      {/* Print View */}
      <PrintView />
      
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <FaCalendarAlt className="mr-2 text-blue-500" />
          Event Calendar
        </h3>
        <div className="flex items-center space-x-2">
          <button 
            onClick={printEvents}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors text-gray-600"
            title="Print Events"
          >
            <FaPrint />
          </button>
          <button 
            onClick={prevMonth}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <FaChevronLeft />
          </button>
          <span className="font-medium">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button 
            onClick={nextMonth}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, index) => {
          if (!date) {
            return <div key={index} className="h-16 border border-gray-100 rounded"></div>;
          }
          
          const dayEvents = getEventsForDate(date);
          const userEvents = dayEvents.filter(event => event.type === 'event');
          const isToday = date.toDateString() === new Date().toDateString();
          const hasHolidayOrVacation = dayEvents.some(event => 
            event.type === 'holiday' || event.type === 'vacation'
          );
          
          return (
            <div 
              key={index} 
              onClick={() => handleDateClick(date)}
              className={`h-16 border border-gray-100 rounded p-1 relative ${
                isToday ? 'bg-blue-50 border-blue-200' : 
                hasHolidayOrVacation ? 'bg-gray-100 cursor-not-allowed' : 
                date < new Date(new Date().setHours(0, 0, 0, 0)) ? 'bg-gray-50 cursor-not-allowed' : 
                userEvents.length > 0 ? 'bg-blue-50' : 
                'hover:bg-gray-50 cursor-pointer'
              }`}
            >
              <div className={`text-sm font-medium ${
                isToday ? 'text-blue-600' : 
                hasHolidayOrVacation ? 'text-gray-400' : 
                date < new Date(new Date().setHours(0, 0, 0, 0)) ? 'text-gray-400' : 
                'text-gray-700'
              }`}>
                {date.getDate()}
                {hasHolidayOrVacation && (
                  <span className="absolute top-0 right-0 text-[8px] text-red-500">●</span>
                )}
                {date < new Date(new Date().setHours(0, 0, 0, 0)) && (
                  <span className="absolute top-0 right-0 text-[8px] text-gray-400">●</span>
                )}
                {!hasHolidayOrVacation && date >= new Date(new Date().setHours(0, 0, 0, 0)) && (
                  <button className="absolute top-0 left-0 p-1 text-gray-400 hover:text-gray-600"></button>
                )}
              </div>
              <div className="mt-1 space-y-0.5">
                {dayEvents.slice(0, 2).map(event => (
                  <div 
                    key={event.id} 
                    className={`text-[10px] truncate px-1 rounded ${
                      event.type === 'holiday' ? 'bg-red-100 text-red-800' :
                      event.type === 'vacation' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {event.title}
                    {event.type === 'event' && event.startTime && (
                      <b className="block text-[10px]">
                        {event.startTime}
                        {event.endTime && `-${event.endTime}`}
                      </b>
                    )}
                    {event.type === 'event' && (
                      <div className="flex justify-end mt-1">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSavedEvent(event);
                            setShowShareOptions(true);
                          }}
                          className="text-green-600 hover:text-green-800"
                          title="Share event"
                        >
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-[10px] text-gray-500 truncate">
                    +{dayEvents.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="flex items-center justify-center mt-4 space-x-4 text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-100 rounded mr-1"></div>
          <span>Holiday</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-100 rounded mr-1"></div>
          <span>Vacation</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-100 rounded mr-1"></div>
          <span>Event</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gray-100 rounded mr-1"></div>
          <span>Disabled</span>
        </div>
      </div>
      
      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingEventId ? 'Edit Event' : 'Add Event'} for {selectedDate?.toLocaleDateString()}
                </h3>
                <button 
                  onClick={() => {
                    setShowEventModal(false);
                    setEditingEventId(null);
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
            
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={newEvent.title}
                  onChange={handleEventInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Parent-Teacher Meeting"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={newEvent.description}
                  onChange={handleEventInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Event details..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={newEvent.startTime}
                    onChange={handleEventInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={newEvent.endTime}
                    onChange={handleEventInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              {hasTimeConflict() && (
                <div className="text-red-500 text-sm">
                  Warning: This time conflicts with an existing event.
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowEventModal(false);
                  setEditingEventId(null);
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEvent}
                disabled={!newEvent.title || hasTimeConflict()}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  !newEvent.title || hasTimeConflict()
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {editingEventId ? 'Update Event' : 'Save Event'}
              </button>
              {editingEventId && (
                <button
                  type="button"
                  onClick={() => {
                    // Find the event being edited
                    const eventToShare = events.find(e => e.id === editingEventId);
                    if (eventToShare) {
                      setSavedEvent(eventToShare);
                      setShowShareOptions(true);
                      setShowEventModal(false);
                    }
                  }}
                  className="inline-flex items-center px-4 py-2 border border-green-300 text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <FaShare className="mr-2" />
                  Share
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* WhatsApp Share Modal */}
      {showShareOptions && savedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Share Event
                </h3>
                <button 
                  onClick={closeShareOptions}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
            
            <div className="px-6 py-4">
              <div className="text-center mb-4">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <FaWhatsapp className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mt-2">Share via WhatsApp</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Share event details with parents group on WhatsApp
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-gray-900">{savedEvent.title}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {savedEvent.date.toLocaleDateString()}
                  {savedEvent.startTime && ` at ${savedEvent.startTime}${savedEvent.endTime ? ` - ${savedEvent.endTime}` : ''}`}
                </p>
                {savedEvent.description && (
                  <p className="text-sm text-gray-600 mt-2">{savedEvent.description}</p>
                )}
              </div>
              
              <div className="flex justify-center space-x-3">
                <button
                  type="button"
                  onClick={closeShareOptions}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={shareOnWhatsApp}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <FaWhatsapp className="mr-2" />
                  Share on WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventCalendar;