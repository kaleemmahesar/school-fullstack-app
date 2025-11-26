import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaBell, FaTimes, FaGraduationCap, FaCalendarAlt, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { fetchStudents } from '../store/studentsSlice';
import { fetchNotifications } from '../store/notificationsSlice';

const NotificationPanel = () => {
  const dispatch = useDispatch();
  const { students, loading: studentsLoading } = useSelector(state => state.students);
  const { batches } = useSelector(state => state.alumni);
  const { events } = useSelector(state => state.events || { events: [] });
  const { notifications, loading: notificationsLoading } = useSelector(state => state.notifications || { notifications: [], loading: false });
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [localNotifications, setLocalNotifications] = useState([]);

  // Fetch students and notifications when component mounts
  useEffect(() => {
    dispatch(fetchStudents());
    dispatch(fetchNotifications());
  }, [dispatch]);

  // Combine static notifications with database notifications
  useEffect(() => {
    const allNotifications = [...notifications];
    
    // Generate dynamic notifications based on batches, students, and events
    batches.forEach(batch => {
      if (batch.status === 'active') {
        const endDate = new Date(batch.endDate);
        const today = new Date();
        const timeDiff = endDate.getTime() - today.getTime();
        const daysUntilEnd = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        if (daysUntilEnd <= 7 && daysUntilEnd > 0) {
          allNotifications.push({
            id: `batch-ending-${batch.id}`,
            type: 'batch-ending',
            title: 'Batch Ending Soon',
            message: `Academic year ${batch.name} ends in ${daysUntilEnd} days. Prepare for student promotions.`,
            date: new Date().toISOString(),
            read: false,
            icon: <FaGraduationCap className="text-yellow-500" />
          });
        }
      }
    });
    
    // Student promotion notifications
    const activeBatch = batches.find(b => b.status === 'active');
    if (activeBatch) {
      const batchStudents = students.filter(s => s.academicYear === activeBatch.name && s.status === 'studying');
      if (batchStudents.length > 0) {
        allNotifications.push({
          id: `student-promotion-${activeBatch.id}`,
          type: 'student-promotion',
          title: 'Student Promotion Due',
          message: `Review ${batchStudents.length} students for promotion in batch ${activeBatch.name}`,
          date: new Date().toISOString(),
          read: false,
          icon: <FaGraduationCap className="text-blue-500" />
        });
      }
    }
    
    // PTM/Event notifications
    events.forEach(event => {
      if (event.type === 'event') {
        const eventDate = new Date(event.date);
        const today = new Date();
        const timeDiff = eventDate.getTime() - today.getTime();
        const daysUntilEvent = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        if (daysUntilEvent === 1) {
          allNotifications.push({
            id: `event-tomorrow-${event.id}`,
            type: 'event',
            title: 'Event Tomorrow',
            message: `${event.title} is scheduled for tomorrow at ${event.startTime}`,
            date: new Date().toISOString(),
            read: false,
            icon: <FaCalendarAlt className="text-green-500" />
          });
        } else if (daysUntilEvent === 0) {
          allNotifications.push({
            id: `event-today-${event.id}`,
            type: 'event',
            title: 'Event Today',
            message: `${event.title} is scheduled for today at ${event.startTime}`,
            date: new Date().toISOString(),
            read: false,
            icon: <FaCalendarAlt className="text-green-500" />
          });
        }
      }
    });
    
    // Sort notifications by date (newest first)
    allNotifications.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    setLocalNotifications(allNotifications);
  }, [batches, students, events, notifications]);

  const markAsRead = (id) => {
    setLocalNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setLocalNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const unreadCount = localNotifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
      >
        <FaBell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
          <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
            <div className="flex space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Mark all as read
                </button>
              )}
              <button
                onClick={() => setShowNotifications(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {localNotifications.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                No notifications
              </div>
            ) : (
              localNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-1">
                      {notification.icon || <FaExclamationTriangle className="text-gray-500" />}
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.date).toLocaleDateString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="flex-shrink-0">
                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="px-4 py-2 border-t border-gray-100 text-center">
            <button className="text-xs text-gray-500 hover:text-gray-700">
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;