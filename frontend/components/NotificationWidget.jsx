import React, { useState, useEffect } from 'react';
import {
  FaBell,
  FaExclamationTriangle,
  FaInfoCircle,
  FaTimes,
  FaCheck,
  FaChevronDown,
  FaChevronUp,
  FaClock,
  FaMapMarkerAlt
} from 'react-icons/fa';
import {
  getAllTripNotifications,
  getActiveNotifications,
  formatNotification,
  requestNotificationPermission,
  scheduleNotification
} from '../lib/notificationUtils';

const NotificationWidget = ({ itinerary, weatherData, onNotificationAction }) => {
  const [notifications, setNotifications] = useState([]);
  const [activeNotifications, setActiveNotifications] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [dismissedNotifications, setDismissedNotifications] = useState(new Set());
  const [notificationPermission, setNotificationPermission] = useState(() => {
    if (typeof window === 'undefined') return 'default';
    if (typeof Notification === 'undefined') return 'not-supported';
    return Notification.permission;
  });

  useEffect(() => {
    if (itinerary) {
      loadNotifications();
    }
  }, [itinerary, weatherData]);

  const loadNotifications = () => {
    try {
      // Generate all notifications for the trip
      const allNotifications = getAllTripNotifications(itinerary, weatherData);
      setNotifications(allNotifications);

      // Filter active notifications (due within 24 hours)
      const active = getActiveNotifications(allNotifications)
        .map(formatNotification)
        .filter(notification => !dismissedNotifications.has(notification.id || notification.title));
      
      setActiveNotifications(active);

      // Schedule notifications if permission granted and supported
      if (notificationPermission === 'granted' && typeof Notification !== 'undefined') {
        allNotifications.forEach(notification => {
          scheduleNotification(notification);
        });
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleRequestPermission = async () => {
    try {
      const granted = await requestNotificationPermission();
      setNotificationPermission(granted ? 'granted' : 'denied');
      if (granted) {
        loadNotifications(); // Reschedule notifications
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const handleDismissNotification = (notification) => {
    const id = notification.id || notification.title;
    setDismissedNotifications(prev => new Set(prev).add(id));
    setActiveNotifications(prev => prev.filter(n => (n.id || n.title) !== id));
    
    if (onNotificationAction) {
      onNotificationAction('dismiss', notification);
    }
  };

  const handleNotificationClick = (notification) => {
    if (notification.actions && notification.actions.length > 0) {
      // Execute first action
      const action = notification.actions[0];
      if (onNotificationAction) {
        onNotificationAction(action.action, notification);
      }
    } else if (onNotificationAction) {
      onNotificationAction('view', notification);
    }
  };

  const getPriorityColor = (notification) => {
    if (notification.isUrgent || notification.urgency === 'urgent') {
      return 'border-red-500 bg-red-50';
    } else if (notification.urgency === 'high' || notification.severity === 'high') {
      return 'border-orange-500 bg-orange-50';
    } else if (notification.urgency === 'medium' || notification.severity === 'medium') {
      return 'border-yellow-500 bg-yellow-50';
    }
    return 'border-blue-500 bg-blue-50';
  };

  const getPriorityTextColor = (notification) => {
    if (notification.isUrgent || notification.urgency === 'urgent') {
      return 'text-red-800';
    } else if (notification.urgency === 'high' || notification.severity === 'high') {
      return 'text-orange-800';
    } else if (notification.urgency === 'medium' || notification.severity === 'medium') {
      return 'text-yellow-800';
    }
    return 'text-blue-800';
  };

  const getNotificationIcon = (notification) => {
    if (notification.isUrgent || notification.urgency === 'urgent') {
      return <FaExclamationTriangle className="text-red-500" />;
    }
    return <FaInfoCircle className="text-blue-500" />;
  };

  // Don't render on server or if notifications are not supported
  if (typeof window === 'undefined') {
    return null;
  }
  
  if (!itinerary || activeNotifications.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <FaBell className="text-blue-600 mr-3" />
          <div>
            <h3 className="font-semibold text-gray-900">Travel Notifications</h3>
            <p className="text-sm text-gray-600">
              {activeNotifications.length} active reminder{activeNotifications.length !== 1 ? 's' : ''}
            </p>
          </div>
          {activeNotifications.some(n => n.isUrgent) && (
            <div className="ml-3 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
              Urgent
            </div>
          )}
        </div>
        <div className="flex items-center">
          {notificationPermission !== 'granted' && notificationPermission !== 'not-supported' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRequestPermission();
              }}
              className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mr-3 hover:bg-blue-200 transition-colors"
            >
              Enable Push
            </button>
          )}
          {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
        </div>
      </div>

      {/* Notifications List */}
      {isExpanded && (
        <div className="border-t border-gray-200 max-h-96 overflow-y-auto">
          {activeNotifications.map((notification, index) => (
            <div
              key={notification.id || notification.title || index}
              className={`border-l-4 ${getPriorityColor(notification)} p-4 border-b border-gray-100 last:border-b-0`}
            >
              <div className="flex items-start justify-between">
                <div 
                  className="flex items-start cursor-pointer flex-1"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="mr-3 mt-1">
                    {notification.icon || getNotificationIcon(notification)}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-medium ${getPriorityTextColor(notification)}`}>
                      {notification.title}
                    </h4>
                    {notification.message && (
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                    )}
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <FaClock className="mr-1" />
                      <span>{notification.timeText}</span>
                      {notification.daysUntilTrip !== undefined && (
                        <>
                          <span className="mx-2">•</span>
                          <FaMapMarkerAlt className="mr-1" />
                          <span>{notification.daysUntilTrip} days until trip</span>
                        </>
                      )}
                    </div>
                    
                    {/* Packing Suggestions */}
                    {notification.suggestions && notification.suggestions.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {notification.suggestions.map((suggestion, sugIndex) => (
                          <div key={sugIndex} className="bg-white rounded border border-gray-200 p-2">
                            <div className="font-medium text-sm text-gray-800 mb-1">
                              {suggestion.category}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {suggestion.items.map((item, itemIndex) => (
                                <span
                                  key={itemIndex}
                                  className={`text-xs px-2 py-1 rounded ${
                                    suggestion.priority === 'urgent'
                                      ? 'bg-red-100 text-red-800'
                                      : suggestion.priority === 'high'
                                      ? 'bg-orange-100 text-orange-800'
                                      : 'bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Checklist */}
                    {notification.checklist && (
                      <div className="mt-3 bg-white rounded border border-gray-200 p-3">
                        <ul className="space-y-1">
                          {notification.checklist.map((item, itemIndex) => (
                            <li key={itemIndex} className="flex items-center text-sm">
                              <FaCheck className="text-green-500 mr-2 text-xs" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Suggested Actions */}
                    {notification.suggestedActions && (
                      <div className="mt-3 space-y-1">
                        <p className="text-xs font-medium text-gray-700">Suggested actions:</p>
                        {notification.suggestedActions.map((action, actionIndex) => (
                          <p key={actionIndex} className="text-xs text-gray-600">• {action}</p>
                        ))}
                      </div>
                    )}

                    {/* Action Buttons */}
                    {notification.actions && notification.actions.length > 0 && (
                      <div className="flex space-x-2 mt-3">
                        {notification.actions.map((action, actionIndex) => (
                          <button
                            key={actionIndex}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onNotificationAction) {
                                onNotificationAction(action.action, notification);
                              }
                            }}
                            className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => handleDismissNotification(notification)}
                  className="text-gray-400 hover:text-gray-600 ml-2"
                >
                  <FaTimes className="text-sm" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Compact View - Show top urgent notification */}
      {!isExpanded && activeNotifications.length > 0 && (
        <div className="border-t border-gray-200 p-3">
          <div className={`border-l-4 ${getPriorityColor(activeNotifications[0])} pl-3`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${getPriorityTextColor(activeNotifications[0])}`}>
                  {activeNotifications[0].title}
                </p>
                <p className="text-xs text-gray-500">
                  {activeNotifications[0].timeText}
                </p>
              </div>
              {activeNotifications.length > 1 && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  +{activeNotifications.length - 1} more
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationWidget;