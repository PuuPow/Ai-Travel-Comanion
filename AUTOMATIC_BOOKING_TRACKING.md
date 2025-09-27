# Automatic Booking Tracking Implementation Guide

This document outlines how to implement automatic booking detection and tracking for your Travel Planner app.

## 🎯 Current Implementation

### ✅ What's Already Working

1. **Manual Booking Entry**: Users can manually add bookings through a comprehensive form
2. **Booking Display**: Professional booking confirmation cards with all details
3. **Local Storage**: Bookings are saved and persist between sessions
4. **Integration**: Seamlessly integrated into the reservations page
5. **CRUD Operations**: Users can add, view, edit, and delete bookings

### 🔧 How It Works Now

1. User clicks "Add Booking" on any trip
2. Modal opens with smart form (adapts to booking type)
3. User enters booking details (hotel, flight, car, restaurant, activity)
4. Booking is saved and immediately appears in reservations
5. Users can edit or delete bookings as needed

## 🚀 Future: Automatic Booking Detection

### Phase 1: Affiliate Callback Integration

#### **Booking.com Integration**
```javascript
// API endpoint: /api/bookings/callback/booking-com
app.post('/api/bookings/callback/booking-com', async (req, res) => {
  const { booking_id, user_ref, status, guest_name, hotel_name, checkin, checkout } = req.body;
  
  if (status === 'confirmed') {
    await createBooking({
      type: 'hotel',
      title: hotel_name,
      provider: 'Booking.com',
      confirmationNumber: booking_id,
      date: checkin,
      checkOut: checkout,
      status: 'confirmed',
      userRef: user_ref
    });
  }
});
```

#### **Expedia Integration**
```javascript
// API endpoint: /api/bookings/callback/expedia
app.post('/api/bookings/callback/expedia', async (req, res) => {
  const { confirmation_number, trip_id, booking_type, details } = req.body;
  
  await createBooking({
    type: booking_type,
    title: details.name,
    provider: 'Expedia',
    confirmationNumber: confirmation_number,
    itineraryId: trip_id,
    ...details
  });
});
```

### Phase 2: Email Parsing System

#### **Gmail API Integration**
```javascript
const { google } = require('googleapis');

async function parseBookingEmails(userId) {
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  
  // Search for booking confirmation emails
  const searchQueries = [
    'from:booking.com subject:confirmation',
    'from:expedia.com subject:itinerary',
    'from:hotels.com subject:confirmation',
    'from:kayak.com subject:confirmation'
  ];
  
  for (const query of searchQueries) {
    const messages = await gmail.users.messages.list({
      userId: 'me',
      q: query
    });
    
    for (const message of messages.data.messages || []) {
      const email = await gmail.users.messages.get({
        userId: 'me',
        id: message.id
      });
      
      const booking = await parseEmailContent(email.data);
      if (booking) {
        await suggestBooking(userId, booking);
      }
    }
  }
}
```

#### **Email Parsing Rules**
```javascript
const emailParsers = {
  'booking.com': {
    confirmationNumber: /Booking\.com confirmation number:\s*(\d+)/i,
    hotelName: /Hotel:\s*(.+)/i,
    checkIn: /Check-in:\s*(.+)/i,
    checkOut: /Check-out:\s*(.+)/i,
    guestName: /Guest name:\s*(.+)/i
  },
  
  'expedia.com': {
    confirmationNumber: /Confirmation number:\s*(\d+)/i,
    hotelName: /Hotel:\s*(.+)/i,
    dates: /(\w{3} \d{1,2}, \d{4}) - (\w{3} \d{1,2}, \d{4})/i
  }
};
```

### Phase 3: Smart Booking Detection

#### **AI-Powered Email Analysis**
```javascript
async function analyzeEmailWithAI(emailContent) {
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `
    Extract booking information from this email:
    ${emailContent}
    
    Return JSON with:
    - type: hotel/flight/car/restaurant/activity
    - title: name of booking
    - provider: company name
    - confirmationNumber: confirmation code
    - date: booking date
    - location: address/location
    - cost: total amount
    `,
    max_tokens: 200
  });
  
  return JSON.parse(response.data.choices[0].text);
}
```

## 📋 Implementation Steps

### Step 1: Set Up Affiliate Callbacks

1. **Register Webhooks** with each platform:
   - Booking.com Partner Center → Webhooks
   - Expedia Partner API → Event Notifications
   - Hotels.com Affiliate Dashboard → Postback URLs

2. **Create API Endpoints**:
   ```bash
   mkdir pages/api/bookings/callbacks
   touch pages/api/bookings/callbacks/booking-com.js
   touch pages/api/bookings/callbacks/expedia.js
   touch pages/api/bookings/callbacks/hotels-com.js
   ```

3. **Configure Webhook URLs**:
   - Production: `https://yourapp.com/api/bookings/callback/booking-com`
   - Development: Use ngrok for local testing

### Step 2: Implement Email Integration

1. **Google OAuth Setup**:
   ```javascript
   const oauth2Client = new google.auth.OAuth2(
     CLIENT_ID,
     CLIENT_SECRET,
     REDIRECT_URL
   );
   ```

2. **Request Gmail Permissions**:
   - Scope: `https://www.googleapis.com/auth/gmail.readonly`
   - User consent flow for accessing emails

3. **Background Email Processing**:
   ```javascript
   // Cron job to check for new booking emails
   cron.schedule('0 */6 * * *', async () => {
     const users = await getActiveUsers();
     for (const user of users) {
       await parseBookingEmails(user.id);
     }
   });
   ```

### Step 3: Database Schema

```sql
CREATE TABLE bookings (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  itinerary_id VARCHAR(50),
  type ENUM('hotel', 'flight', 'car', 'restaurant', 'activity'),
  title VARCHAR(255) NOT NULL,
  provider VARCHAR(100),
  confirmation_number VARCHAR(100),
  date DATE NOT NULL,
  time TIME,
  check_out DATE,
  location TEXT,
  cost DECIMAL(10,2),
  guests INT,
  status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'confirmed',
  source ENUM('manual', 'affiliate', 'email', 'api') DEFAULT 'manual',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Step 4: Smart Matching

```javascript
async function matchBookingToItinerary(booking, userItineraries) {
  // Match by date range
  const dateMatches = userItineraries.filter(itinerary => {
    const bookingDate = new Date(booking.date);
    const tripStart = new Date(itinerary.startDate);
    const tripEnd = new Date(itinerary.endDate);
    return bookingDate >= tripStart && bookingDate <= tripEnd;
  });
  
  // Match by destination
  const destinationMatches = dateMatches.filter(itinerary => {
    return booking.location?.includes(itinerary.destination) ||
           itinerary.destination.includes(booking.location);
  });
  
  return destinationMatches[0] || dateMatches[0];
}
```

## 🔒 Privacy & Security

### Data Protection
1. **Encryption**: All booking data encrypted at rest
2. **Limited Access**: Only access emails explicitly consented to
3. **Data Retention**: Clear policies on how long to store data
4. **User Control**: Users can revoke email access anytime

### Compliance
1. **GDPR**: Right to delete, data portability
2. **User Consent**: Clear consent flow for email access
3. **Privacy Policy**: Updated to include email parsing

## 🎨 User Experience

### Booking Suggestions
```javascript
const BookingSuggestion = ({ booking, onAccept, onReject }) => (
  <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
    <div className="flex items-start justify-between">
      <div>
        <h4 className="font-medium text-blue-900">New Booking Detected</h4>
        <p className="text-blue-700">{booking.title}</p>
        <p className="text-sm text-blue-600">Found in email from {booking.provider}</p>
      </div>
      <div className="flex space-x-2">
        <button onClick={() => onAccept(booking)} className="bg-blue-600 text-white px-3 py-1 rounded">
          Add to Trip
        </button>
        <button onClick={() => onReject(booking)} className="text-blue-600">
          Dismiss
        </button>
      </div>
    </div>
  </div>
);
```

## 📊 Analytics & Monitoring

### Key Metrics
1. **Detection Rate**: % of bookings automatically detected
2. **Accuracy**: % of correctly parsed booking details
3. **User Adoption**: % of users enabling auto-detection
4. **Processing Time**: Average time to detect and suggest bookings

### Error Handling
```javascript
const bookingLogger = {
  logSuccess: (booking) => console.log(`✅ Booking detected: ${booking.id}`),
  logError: (error, context) => console.error(`❌ Booking error: ${error.message}`, context),
  logSkipped: (reason) => console.log(`⏭️ Booking skipped: ${reason}`)
};
```

## 🚀 Getting Started

### Immediate Actions
1. **Test Current System**: Add some manual bookings to see the UI
2. **Apply for Partner Programs**: Start affiliate applications
3. **Plan Database**: Design booking storage strategy

### Next Phase
1. **Implement Callbacks**: Start with one platform (Booking.com recommended)
2. **Test Integration**: Use sandbox/test environments
3. **User Feedback**: Get feedback on manual system before automating

## 💡 Benefits

### For Users
- ✅ **Zero Effort**: Bookings appear automatically
- ✅ **Complete Picture**: All bookings in one place  
- ✅ **Smart Organization**: Linked to correct trips
- ✅ **Always Updated**: Real-time booking status

### For Business
- 💰 **Increased Revenue**: More affiliate commissions
- 📈 **Higher Engagement**: Users spend more time in app
- 🎯 **Better Data**: Understand user booking patterns
- 🚀 **Competitive Advantage**: Unique feature in market

This system provides a solid foundation for automatic booking detection while maintaining the excellent manual system you have now.