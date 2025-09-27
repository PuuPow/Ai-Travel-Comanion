/**
 * Smart Notification System
 * Handles packing reminders, weather alerts, and trip notifications
 */

/**
 * Notification types
 */
export const NOTIFICATION_TYPES = {
  PACKING_REMINDER: 'packing_reminder',
  WEATHER_ALERT: 'weather_alert',
  FLIGHT_CHECKIN: 'flight_checkin',
  TRIP_REMINDER: 'trip_reminder',
  DOCUMENT_REMINDER: 'document_reminder',
  ITINERARY_UPDATE: 'itinerary_update'
};

/**
 * Generate smart packing reminders based on trip details
 */
export const generatePackingReminders = (itinerary) => {
  const { destination, startDate, endDate, activities, weather } = itinerary;
  const tripStart = new Date(startDate);
  const now = new Date();
  const daysUntilTrip = Math.ceil((tripStart - now) / (1000 * 60 * 60 * 24));
  
  const reminders = [];

  // Base packing reminder timeline
  const packingSchedule = [
    { days: 7, urgency: 'low', title: 'Start thinking about packing' },
    { days: 3, urgency: 'medium', title: 'Begin packing preparations' },
    { days: 1, urgency: 'high', title: 'Final packing check' },
    { days: 0, urgency: 'urgent', title: 'Last-minute essentials check' }
  ];

  packingSchedule.forEach(({ days, urgency, title }) => {
    if (daysUntilTrip <= days) {
      const reminder = {
        type: NOTIFICATION_TYPES.PACKING_REMINDER,
        title,
        urgency,
        daysUntilTrip,
        suggestions: generatePackingSuggestions(itinerary, days),
        scheduledFor: new Date(tripStart.getTime() - days * 24 * 60 * 60 * 1000)
      };
      reminders.push(reminder);
    }
  });

  return reminders;
};

/**
 * Generate packing suggestions based on trip context
 */
const generatePackingSuggestions = (itinerary, daysUntilTrip) => {
  const { destination, activities, weather, startDate, endDate } = itinerary;
  const tripDuration = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
  
  const suggestions = [];

  // Essential items based on timeline
  if (daysUntilTrip <= 7) {
    suggestions.push({
      category: 'Documents',
      items: ['Passport/ID', 'Travel insurance', 'Boarding passes', 'Hotel confirmations'],
      priority: 'high'
    });
  }

  if (daysUntilTrip <= 3) {
    // Weather-based suggestions
    if (weather?.temperature) {
      if (weather.temperature < 10) {
        suggestions.push({
          category: 'Cold Weather',
          items: ['Warm jacket', 'Thermal layers', 'Gloves', 'Hat', 'Warm socks'],
          priority: 'high'
        });
      } else if (weather.temperature > 25) {
        suggestions.push({
          category: 'Warm Weather',
          items: ['Sunscreen', 'Sunglasses', 'Light clothing', 'Hat', 'Swimwear'],
          priority: 'high'
        });
      }
    }

    // Activity-based suggestions
    if (activities?.some(activity => activity.title?.toLowerCase().includes('beach'))) {
      suggestions.push({
        category: 'Beach Activities',
        items: ['Swimwear', 'Beach towel', 'Sunscreen', 'Flip flops', 'Waterproof bag'],
        priority: 'medium'
      });
    }

    if (activities?.some(activity => 
      activity.title?.toLowerCase().includes('hike') || 
      activity.title?.toLowerCase().includes('trek')
    )) {
      suggestions.push({
        category: 'Hiking/Outdoor',
        items: ['Hiking boots', 'Backpack', 'Water bottle', 'First aid kit', 'Maps'],
        priority: 'medium'
      });
    }

    // Trip duration suggestions
    if (tripDuration > 7) {
      suggestions.push({
        category: 'Extended Travel',
        items: ['Laundry supplies', 'Extra phone charger', 'Backup medications', 'Comfortable shoes'],
        priority: 'medium'
      });
    }
  }

  if (daysUntilTrip <= 1) {
    suggestions.push({
      category: 'Last Minute',
      items: ['Phone charger', 'Medications', 'Contact solution', 'Snacks for travel', 'Cash/cards'],
      priority: 'urgent'
    });
  }

  return suggestions;
};

/**
 * Generate weather alerts for upcoming trips
 */
export const generateWeatherAlerts = (itinerary, currentWeather, forecast) => {
  const alerts = [];
  const tripStart = new Date(itinerary.startDate);
  const now = new Date();
  const daysUntilTrip = Math.ceil((tripStart - now) / (1000 * 60 * 60 * 24));

  if (daysUntilTrip <= 7 && forecast) {
    // Significant weather changes
    if (forecast.some(day => day.description?.includes('storm') || day.description?.includes('heavy rain'))) {
      alerts.push({
        type: NOTIFICATION_TYPES.WEATHER_ALERT,
        title: 'Weather Alert: Storms Expected',
        message: `Heavy rain or storms are forecasted for your trip to ${itinerary.destination}. Consider packing rain gear.`,
        severity: 'high',
        suggestedActions: ['Pack waterproof jacket', 'Bring umbrella', 'Plan indoor alternatives'],
        scheduledFor: new Date(now.getTime() + 24 * 60 * 60 * 1000) // Tomorrow
      });
    }

    // Temperature extremes
    const minTemp = Math.min(...forecast.map(day => day.minTemp || day.temperature));
    const maxTemp = Math.max(...forecast.map(day => day.maxTemp || day.temperature));

    if (minTemp < 0) {
      alerts.push({
        type: NOTIFICATION_TYPES.WEATHER_ALERT,
        title: 'Cold Weather Alert',
        message: `Freezing temperatures expected in ${itinerary.destination}. Pack warm clothing.`,
        severity: 'medium',
        suggestedActions: ['Pack winter coat', 'Bring warm layers', 'Consider thermal underwear'],
        scheduledFor: new Date(tripStart.getTime() - 3 * 24 * 60 * 60 * 1000) // 3 days before
      });
    }

    if (maxTemp > 35) {
      alerts.push({
        type: NOTIFICATION_TYPES.WEATHER_ALERT,
        title: 'Heat Warning',
        message: `Very hot weather expected in ${itinerary.destination}. Stay hydrated and protect from sun.`,
        severity: 'medium',
        suggestedActions: ['Pack sunscreen', 'Bring hat and sunglasses', 'Plan for shade breaks'],
        scheduledFor: new Date(tripStart.getTime() - 2 * 24 * 60 * 60 * 1000) // 2 days before
      });
    }
  }

  return alerts;
};

/**
 * Generate flight check-in reminders
 */
export const generateFlightReminders = (itinerary) => {
  const reminders = [];
  const tripStart = new Date(itinerary.startDate);
  const now = new Date();

  // Check-in reminder (24 hours before flight)
  const checkinTime = new Date(tripStart.getTime() - 24 * 60 * 60 * 1000);
  if (checkinTime > now) {
    reminders.push({
      type: NOTIFICATION_TYPES.FLIGHT_CHECKIN,
      title: 'Flight Check-in Available',
      message: `You can now check in for your flight to ${itinerary.destination}!`,
      scheduledFor: checkinTime,
      actions: [
        { label: 'Check in online', action: 'open_airline_website' },
        { label: 'Set departure reminder', action: 'set_departure_reminder' }
      ]
    });
  }

  // Departure reminder (3 hours before domestic, 4 hours before international)
  const isInternational = !itinerary.destination?.toLowerCase().includes('united states');
  const hoursBeforeDeparture = isInternational ? 4 : 3;
  const departureReminderTime = new Date(tripStart.getTime() - hoursBeforeDeparture * 60 * 60 * 1000);

  if (departureReminderTime > now) {
    reminders.push({
      type: NOTIFICATION_TYPES.TRIP_REMINDER,
      title: 'Time to Head to Airport',
      message: `Your flight to ${itinerary.destination} departs soon. Time to leave for the airport!`,
      scheduledFor: departureReminderTime,
      actions: [
        { label: 'Check traffic', action: 'check_traffic' },
        { label: 'Call ride', action: 'call_ride' }
      ]
    });
  }

  return reminders;
};

/**
 * Generate document and preparation reminders
 */
export const generateDocumentReminders = (itinerary) => {
  const reminders = [];
  const tripStart = new Date(itinerary.startDate);
  const now = new Date();
  const daysUntilTrip = Math.ceil((tripStart - now) / (1000 * 60 * 60 * 24));

  const isInternational = !itinerary.destination?.toLowerCase().includes('united states');

  // Document check reminders
  if (daysUntilTrip <= 30 && daysUntilTrip > 0) {
    const reminderTime = new Date(tripStart.getTime() - 14 * 24 * 60 * 60 * 1000); // 2 weeks before

    if (isInternational) {
      reminders.push({
        type: NOTIFICATION_TYPES.DOCUMENT_REMINDER,
        title: 'Check Travel Documents',
        message: 'Verify your passport is valid and check visa requirements.',
        scheduledFor: reminderTime,
        checklist: [
          'Passport valid for 6+ months',
          'Visa requirements checked',
          'Travel insurance purchased',
          'Emergency contacts updated',
          'Bank notified of travel'
        ]
      });
    } else {
      reminders.push({
        type: NOTIFICATION_TYPES.DOCUMENT_REMINDER,
        title: 'Travel Preparation Checklist',
        message: 'Complete your travel preparations.',
        scheduledFor: reminderTime,
        checklist: [
          'Valid ID ready',
          'Travel insurance considered',
          'Accommodation confirmed',
          'Transportation planned'
        ]
      });
    }
  }

  return reminders;
};

/**
 * Get all notifications for a trip
 */
export const getAllTripNotifications = (itinerary, weatherData = null) => {
  const allNotifications = [
    ...generatePackingReminders(itinerary),
    ...generateWeatherAlerts(itinerary, weatherData?.current, weatherData?.forecast),
    ...generateFlightReminders(itinerary),
    ...generateDocumentReminders(itinerary)
  ];

  // Sort by scheduled time
  return allNotifications.sort((a, b) => new Date(a.scheduledFor) - new Date(b.scheduledFor));
};

/**
 * Check if notifications should be shown (within 24 hours of scheduled time)
 */
export const getActiveNotifications = (notifications) => {
  const now = new Date();
  const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  return notifications.filter(notification => {
    const scheduledTime = new Date(notification.scheduledFor);
    return scheduledTime <= next24Hours && scheduledTime >= now;
  });
};

/**
 * Format notification for display
 */
export const formatNotification = (notification) => {
  const timeUntil = new Date(notification.scheduledFor) - new Date();
  const hoursUntil = Math.ceil(timeUntil / (1000 * 60 * 60));

  let timeText = '';
  if (hoursUntil <= 1) {
    timeText = 'Now';
  } else if (hoursUntil <= 24) {
    timeText = `In ${hoursUntil} hours`;
  } else {
    const daysUntil = Math.ceil(hoursUntil / 24);
    timeText = `In ${daysUntil} days`;
  }

  return {
    ...notification,
    timeText,
    isUrgent: notification.urgency === 'urgent' || hoursUntil <= 2,
    icon: getNotificationIcon(notification.type)
  };
};

/**
 * Get icon for notification type
 */
const getNotificationIcon = (type) => {
  const icons = {
    [NOTIFICATION_TYPES.PACKING_REMINDER]: '🎒',
    [NOTIFICATION_TYPES.WEATHER_ALERT]: '🌦️',
    [NOTIFICATION_TYPES.FLIGHT_CHECKIN]: '✈️',
    [NOTIFICATION_TYPES.TRIP_REMINDER]: '🧳',
    [NOTIFICATION_TYPES.DOCUMENT_REMINDER]: '📄',
    [NOTIFICATION_TYPES.ITINERARY_UPDATE]: '📅'
  };
  return icons[type] || '📋';
};

/**
 * Browser notification API integration
 */
export const requestNotificationPermission = async () => {
  if (typeof window === 'undefined' || typeof Notification === 'undefined') {
    console.log('This browser does not support notifications');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.log('Error requesting notification permission:', error);
    return false;
  }
};

/**
 * Send browser notification
 */
export const sendBrowserNotification = (notification) => {
  if (typeof window === 'undefined' || typeof Notification === 'undefined') {
    console.log('Browser notifications not supported');
    return;
  }
  
  try {
    if (Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.type
      });

      browserNotification.onclick = () => {
        window.focus();
        browserNotification.close();
      };

      // Auto close after 10 seconds
      setTimeout(() => {
        browserNotification.close();
      }, 10000);
    }
  } catch (error) {
    console.log('Error sending browser notification:', error);
  }
};

/**
 * Schedule recurring notifications (for PWA)
 */
export const scheduleNotification = (notification) => {
  // In a PWA with service worker, this would register the notification
  // For now, we'll store it in localStorage for demo purposes
  
  const scheduledNotifications = JSON.parse(localStorage.getItem('scheduledNotifications') || '[]');
  scheduledNotifications.push({
    ...notification,
    id: Date.now().toString(),
    created: new Date().toISOString()
  });
  
  localStorage.setItem('scheduledNotifications', JSON.stringify(scheduledNotifications));
  
  console.log('Notification scheduled:', notification.title);
};

export default {
  generatePackingReminders,
  generateWeatherAlerts,
  generateFlightReminders,
  generateDocumentReminders,
  getAllTripNotifications,
  getActiveNotifications,
  formatNotification,
  requestNotificationPermission,
  sendBrowserNotification,
  scheduleNotification
};