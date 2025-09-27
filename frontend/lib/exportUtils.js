/**
 * Export Utilities
 * Handles PDF export, calendar integration, and print formatting
 */

/**
 * Generate PDF-ready itinerary data
 */
export const generatePDFData = (itinerary) => {
  const { destination, startDate, endDate, description, days, accommodation, weather } = itinerary;
  
  return {
    title: `${destination} Travel Itinerary`,
    subtitle: formatDateRange(startDate, endDate),
    metadata: {
      generatedOn: new Date().toISOString(),
      tripDuration: calculateDays(startDate, endDate),
      destination: destination,
      traveler: 'Travel Planner User' // In real app, get from user profile
    },
    sections: [
      {
        title: 'Trip Overview',
        content: {
          destination,
          dates: formatDateRange(startDate, endDate),
          duration: `${calculateDays(startDate, endDate)} days`,
          description: description || 'An amazing adventure awaits!',
          weather: weather ? `${weather.temperature}°C, ${weather.description}` : null
        }
      },
      {
        title: 'Daily Itinerary',
        content: generateDailyItineraryFromDays(days, startDate, endDate)
      },
      {
        title: 'Accommodation',
        content: accommodation || []
      },
      {
        title: 'Important Information',
        content: generateImportantInfo(itinerary)
      }
    ]
  };
};

/**
 * Generate daily itinerary breakdown from days structure
 */
const generateDailyItineraryFromDays = (days = [], startDate, endDate) => {
  if (!days || days.length === 0) {
    // If no days are provided, generate empty days based on date range
    const emptyDays = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const currentDate = new Date(d);
      emptyDays.push({
        date: currentDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        activities: [],
        meals: [],
        notes: 'No activities planned for this day yet.'
      });
    }
    return emptyDays;
  }
  
  return days.map(day => {
    const dayDate = day.date ? new Date(day.date) : null;
    
    return {
      date: dayDate ? dayDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : `Day ${day.dayNumber || day.id}`,
      activities: (day.activities || []).map(activity => ({
        time: activity.time || 'All day',
        title: activity.name || activity.activity || activity.title,
        description: activity.description,
        location: activity.location,
        duration: activity.duration,
        cost: activity.cost
      })),
      meals: (day.meals || []).map(meal => ({
        type: meal.type,
        restaurant: meal.restaurant,
        cuisine: meal.cuisine,
        time: meal.time,
        notes: meal.notes
      })),
      notes: day.notes
    };
  });
};

/**
 * Legacy function for backward compatibility
 */
const generateDailyItinerary = (activities = [], meals = [], startDate, endDate) => {
  const days = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const currentDate = new Date(d);
    const dateString = currentDate.toISOString().split('T')[0];
    
    const dayActivities = activities.filter(activity => 
      activity.date === dateString || activity.day === dateString
    );
    
    const dayMeals = meals.filter(meal => 
      meal.date === dateString || meal.day === dateString
    );
    
    days.push({
      date: currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      activities: dayActivities.map(activity => ({
        time: activity.time || 'All day',
        title: activity.title,
        description: activity.description,
        location: activity.location,
        duration: activity.duration,
        cost: activity.cost
      })),
      meals: dayMeals.map(meal => ({
        type: meal.type,
        restaurant: meal.restaurant,
        cuisine: meal.cuisine,
        time: meal.time,
        notes: meal.notes
      }))
    });
  }
  
  return days;
};

/**
 * Generate important information section
 */
const generateImportantInfo = (itinerary) => {
  const info = [];
  
  // Emergency contacts
  info.push({
    title: 'Emergency Contacts',
    items: [
      'Local Emergency: 911 (US) / 112 (EU)',
      'Embassy/Consulate information',
      'Travel insurance hotline',
      'Hotel/Accommodation contact'
    ]
  });
  
  // Documents checklist
  info.push({
    title: 'Document Checklist',
    items: [
      'Passport/ID',
      'Travel insurance documents',
      'Flight confirmations',
      'Hotel reservations',
      'Emergency contact information'
    ]
  });
  
  // Weather and packing
  if (itinerary.weather) {
    info.push({
      title: 'Weather & Packing',
      items: [
        `Expected weather: ${itinerary.weather.temperature}°C, ${itinerary.weather.description}`,
        'Check weather forecast before departure',
        'Pack appropriate clothing',
        'Consider local customs for dress code'
      ]
    });
  }
  
  return info;
};

/**
 * Generate calendar events for itinerary
 */
export const generateCalendarEvents = (itinerary) => {
  const { destination, startDate, endDate, days } = itinerary;
  const events = [];
  
  // Main trip event
  events.push({
    title: `Trip to ${destination}`,
    start: startDate,
    end: endDate,
    allDay: true,
    description: `Travel itinerary for ${destination}`,
    location: destination,
    category: 'travel'
  });
  
  // Process days to create activity and meal events
  if (days && days.length > 0) {
    days.forEach(day => {
      const dayDate = day.date;
      
      // Activity events
      if (day.activities && day.activities.length > 0) {
        day.activities.forEach(activity => {
          const activityDate = dayDate || day.date;
          if (activityDate) {
            const startTime = activity.time 
              ? `${activityDate}T${convertTimeToISO(activity.time)}`
              : `${activityDate}T09:00:00`;
            
            events.push({
              title: activity.name || activity.activity || activity.title,
              start: startTime,
              end: calculateEndTime(startTime, activity.duration || '2 hours'),
              description: activity.description,
              location: activity.location || destination,
              category: 'activity'
            });
          }
        });
      }
      
      // Meal events
      if (day.meals && day.meals.length > 0) {
        day.meals.forEach(meal => {
          const mealDate = dayDate || day.date;
          if (mealDate && meal.restaurant) {
            const mealTime = getMealTime(meal.type, meal.time);
            const startTime = `${mealDate}T${mealTime}`;
            
            events.push({
              title: `${meal.type}: ${meal.restaurant}`,
              start: startTime,
              end: calculateEndTime(startTime, '1.5 hours'),
              description: meal.cuisine ? `${meal.cuisine} cuisine` : '',
              location: meal.restaurant,
              category: 'meal'
            });
          }
        });
      }
    });
  }
  
  return events;
};

/**
 * Convert time string to ISO format
 */
const convertTimeToISO = (timeString) => {
  // Handle formats like "9:00 AM", "14:30", etc.
  if (timeString.includes('AM') || timeString.includes('PM')) {
    const [time, period] = timeString.split(' ');
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours);
    minutes = minutes || '00';
    
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    return `${hours.toString().padStart(2, '0')}:${minutes}:00`;
  }
  
  // Already in 24-hour format
  if (timeString.includes(':')) {
    const [hours, minutes] = timeString.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
  }
  
  return '09:00:00'; // Default
};

/**
 * Get default meal times
 */
const getMealTime = (mealType, specifiedTime) => {
  if (specifiedTime) return convertTimeToISO(specifiedTime);
  
  const defaultTimes = {
    breakfast: '08:00:00',
    brunch: '10:00:00',
    lunch: '12:30:00',
    dinner: '19:00:00',
    snack: '15:00:00'
  };
  
  return defaultTimes[mealType.toLowerCase()] || '12:00:00';
};

/**
 * Calculate end time based on duration
 */
const calculateEndTime = (startTime, duration) => {
  const start = new Date(startTime);
  let durationMinutes = 60; // Default 1 hour
  
  if (duration.includes('hour')) {
    const hours = parseFloat(duration.match(/[\d.]+/)[0]);
    durationMinutes = hours * 60;
  } else if (duration.includes('minute')) {
    durationMinutes = parseInt(duration.match(/\d+/)[0]);
  }
  
  const end = new Date(start.getTime() + durationMinutes * 60000);
  return end.toISOString();
};

/**
 * Generate Google Calendar URL
 */
export const generateGoogleCalendarUrl = (event) => {
  const formatDateForGoogle = (date) => {
    return new Date(date).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatDateForGoogle(event.start)}/${formatDateForGoogle(event.end)}`,
    details: event.description || '',
    location: event.location || '',
    trp: 'false'
  });
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

/**
 * Generate Apple Calendar (.ics) content
 */
export const generateICSContent = (events) => {
  const formatDateForICS = (date) => {
    return new Date(date).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Travel Planner//Travel Itinerary//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ].join('\r\n');
  
  events.forEach((event, index) => {
    icsContent += '\r\n' + [
      'BEGIN:VEVENT',
      `UID:${Date.now()}-${index}@travel-planner.com`,
      `DTSTART:${formatDateForICS(event.start)}`,
      `DTEND:${formatDateForICS(event.end)}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description || ''}`,
      `LOCATION:${event.location || ''}`,
      `CATEGORIES:${event.category?.toUpperCase() || 'TRAVEL'}`,
      `STATUS:CONFIRMED`,
      'END:VEVENT'
    ].join('\r\n');
  });
  
  icsContent += '\r\nEND:VCALENDAR';
  return icsContent;
};

/**
 * Generate print-friendly HTML
 */
export const generatePrintHTML = (itinerary) => {
  const pdfData = generatePDFData(itinerary);
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${pdfData.title}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #007bff;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #007bff;
          margin: 0;
          font-size: 2.5em;
        }
        .header .subtitle {
          font-size: 1.2em;
          color: #666;
          margin: 10px 0;
        }
        .section {
          margin: 30px 0;
          break-inside: avoid;
        }
        .section h2 {
          color: #007bff;
          border-bottom: 2px solid #e9ecef;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        .day-block {
          background: #f8f9fa;
          border-left: 4px solid #007bff;
          padding: 15px;
          margin: 20px 0;
          break-inside: avoid;
        }
        .day-date {
          font-size: 1.2em;
          font-weight: bold;
          color: #007bff;
          margin-bottom: 15px;
        }
        .activity, .meal {
          margin: 10px 0;
          padding: 10px;
          background: white;
          border-radius: 5px;
          border-left: 3px solid #28a745;
        }
        .meal {
          border-left-color: #ffc107;
        }
        .activity-time, .meal-time {
          font-weight: bold;
          color: #007bff;
          font-size: 0.9em;
        }
        .activity-title, .meal-title {
          font-weight: bold;
          margin: 5px 0;
        }
        .overview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin: 20px 0;
        }
        .overview-item {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #007bff;
        }
        .overview-label {
          font-weight: bold;
          color: #007bff;
          font-size: 0.9em;
        }
        .checklist {
          list-style: none;
          padding: 0;
        }
        .checklist li {
          padding: 8px 0;
          border-bottom: 1px solid #e9ecef;
        }
        .checklist li:before {
          content: "✓ ";
          color: #28a745;
          font-weight: bold;
        }
        @media print {
          body { margin: 0; padding: 15px; }
          .section { break-inside: avoid; }
          .day-block { break-inside: avoid; }
          .header { border-bottom: 2px solid #000; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${pdfData.title}</h1>
        <div class="subtitle">${pdfData.subtitle}</div>
        <div>Generated on ${new Date().toLocaleDateString()}</div>
      </div>
      
      ${pdfData.sections.map(section => generateSectionHTML(section)).join('')}
    </body>
    </html>
  `;
};

/**
 * Generate HTML for a section
 */
const generateSectionHTML = (section) => {
  switch (section.title) {
    case 'Trip Overview':
      return `
        <div class="section">
          <h2>Trip Overview</h2>
          <div class="overview-grid">
            <div class="overview-item">
              <div class="overview-label">Destination</div>
              <div>${section.content.destination}</div>
            </div>
            <div class="overview-item">
              <div class="overview-label">Dates</div>
              <div>${section.content.dates}</div>
            </div>
            <div class="overview-item">
              <div class="overview-label">Duration</div>
              <div>${section.content.duration}</div>
            </div>
            ${section.content.weather ? `
            <div class="overview-item">
              <div class="overview-label">Weather</div>
              <div>${section.content.weather}</div>
            </div>
            ` : ''}
          </div>
          <p>${section.content.description}</p>
        </div>
      `;
    
    case 'Daily Itinerary':
      return `
        <div class="section">
          <h2>Daily Itinerary</h2>
          ${section.content.map(day => `
            <div class="day-block">
              <div class="day-date">${day.date}</div>
              ${day.activities.map(activity => `
                <div class="activity">
                  <div class="activity-time">${activity.time}</div>
                  <div class="activity-title">${activity.title}</div>
                  ${activity.description ? `<div>${activity.description}</div>` : ''}
                  ${activity.location ? `<div><strong>Location:</strong> ${activity.location}</div>` : ''}
                  ${activity.duration ? `<div><strong>Duration:</strong> ${activity.duration}</div>` : ''}
                  ${activity.cost ? `<div><strong>Cost:</strong> ${activity.cost}</div>` : ''}
                </div>
              `).join('')}
              ${day.meals.map(meal => `
                <div class="meal">
                  <div class="meal-time">${meal.time || meal.type}</div>
                  <div class="meal-title">${meal.restaurant}</div>
                  ${meal.cuisine ? `<div><strong>Cuisine:</strong> ${meal.cuisine}</div>` : ''}
                  ${meal.notes ? `<div>${meal.notes}</div>` : ''}
                </div>
              `).join('')}
              ${day.notes ? `
                <div class="day-notes" style="margin-top: 15px; padding: 10px; background: #fff3cd; border-radius: 5px; border-left: 3px solid #ffc107;">
                  <strong>Notes:</strong> ${day.notes}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      `;
    
    case 'Important Information':
      return `
        <div class="section">
          <h2>Important Information</h2>
          ${section.content.map(info => `
            <div style="margin-bottom: 25px;">
              <h3 style="color: #007bff; margin-bottom: 10px;">${info.title}</h3>
              <ul class="checklist">
                ${info.items.map(item => `<li>${item}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
      `;
    
    default:
      return `
        <div class="section">
          <h2>${section.title}</h2>
          <div>${JSON.stringify(section.content, null, 2)}</div>
        </div>
      `;
  }
};

/**
 * Utility functions
 */
const formatDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
};

const calculateDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
};

/**
 * Download file utility
 */
export const downloadFile = (content, filename, contentType) => {
  const blob = new Blob([content], { type: contentType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Export functions for different formats
 */
export const exportToPDF = async (itinerary) => {
  // In a real app, this would use a PDF library like jsPDF or Puppeteer
  // For now, we'll generate HTML and suggest print-to-PDF
  const htmlContent = generatePrintHTML(itinerary);
  const newWindow = window.open('', '_blank');
  newWindow.document.write(htmlContent);
  newWindow.document.close();
  newWindow.print();
};

export const exportToICS = (itinerary) => {
  const events = generateCalendarEvents(itinerary);
  const icsContent = generateICSContent(events);
  downloadFile(icsContent, `${itinerary.destination}-itinerary.ics`, 'text/calendar');
};

export const exportToJSON = (itinerary) => {
  const jsonContent = JSON.stringify(itinerary, null, 2);
  downloadFile(jsonContent, `${itinerary.destination}-itinerary.json`, 'application/json');
};

export default {
  generatePDFData,
  generateCalendarEvents,
  generateGoogleCalendarUrl,
  generateICSContent,
  generatePrintHTML,
  exportToPDF,
  exportToICS,
  exportToJSON,
  downloadFile
};