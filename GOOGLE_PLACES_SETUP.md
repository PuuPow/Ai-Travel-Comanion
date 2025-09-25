# Google Places API Integration Setup

## Overview
Your Travel Planner now supports real location data integration using Google Places API! This enhancement provides:

- **Real Restaurant Suggestions**: Actual restaurant names, addresses, ratings, and price levels
- **Live Activity Data**: Real tourist attractions, museums, and points of interest
- **75-mile Radius Coverage**: Suggestions from a wide area around your destination
- **Cached Responses**: Efficient API usage with 1-hour caching
- **Fallback Support**: Works with or without API key (mock data when unavailable)

## Features Added

### Backend Enhancements
- ✅ Google Places API integration (`placesService.js`)
- ✅ City geocoding and coordinate extraction
- ✅ Restaurant search with cuisine and price filtering
- ✅ Activity and attraction discovery
- ✅ Response caching with 1-hour TTL
- ✅ Enhanced AI prompts with real location data

### Frontend Improvements
- ✅ Rating displays with star icons
- ✅ Address information with map markers
- ✅ Meal recommendations with cuisine types
- ✅ Price range indicators ($ to $$$$)
- ✅ Duration and cost estimates
- ✅ Data source indicators

## Setting Up Google Places API (Optional but Recommended)

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable billing for the project

### Step 2: Enable APIs
Enable these APIs in your Google Cloud project:
- **Places API** (New)
- **Geocoding API**
- **Places API (legacy)** (if needed)

### Step 3: Create API Key
1. Go to **APIs & Credentials** → **Credentials**
2. Click **Create Credentials** → **API Key**
3. Copy your API key
4. Click **Restrict Key** (recommended for security)

### Step 4: Configure Restrictions (Recommended)
**Application Restrictions:**
- Select "HTTP referrers" or "IP addresses" based on your deployment
- Add your domain(s): `http://localhost:3000`, `your-domain.com`

**API Restrictions:**
- Select "Restrict key"
- Choose: Places API, Geocoding API

### Step 5: Add to Environment
Add to your backend `.env` file:
```env
GOOGLE_PLACES_API_KEY=your-api-key-here
```

## Usage Examples

### Without API Key (Mock Data)
```javascript
// Returns mock restaurants and activities
const locationData = await getLocationDataWithFallback("Paris, France");
console.log(locationData.mockData); // true
```

### With API Key (Real Data)
```javascript
// Returns real Google Places data
const locationData = await getLocationDataWithFallback("Paris, France", 75);
console.log(locationData.hasRealData); // true
console.log(locationData.restaurants.all.length); // e.g., 10 real restaurants
console.log(locationData.activities.length); // e.g., 15 real attractions
```

## Cost Considerations

### Google Places API Pricing (as of 2024)
- **Text Search**: $32 per 1,000 requests
- **Geocoding**: $5 per 1,000 requests
- **Places Details**: $17 per 1,000 requests

### Cost Optimization
- ✅ **Caching**: 1-hour cache reduces API calls
- ✅ **Limited Results**: Max 10 restaurants, 15 activities per query
- ✅ **Radius Filtering**: Focused search area
- ✅ **Fallback Support**: Graceful degradation without API

### Estimated Usage
For a typical 5-day trip itinerary:
- 1 geocoding call (city lookup)
- 3-4 Places searches (restaurants, activities, fine dining)
- **Total**: ~4 API calls = ~$0.15 per itinerary

Monthly estimate for 100 itineraries: ~$15

## Testing

### Test with Mock Data (No API Key)
```bash
# Remove or comment out the API key
# GOOGLE_PLACES_API_KEY=

# Restart backend
npm run dev
```

### Test with Real Data
```bash
# Add your API key
GOOGLE_PLACES_API_KEY=your-actual-api-key-here

# Restart backend
npm run dev
```

### Verify Integration
1. Create a new itinerary with destination "New York City"
2. Generate AI suggestions
3. Check for:
   - Real restaurant names with ratings
   - Actual addresses
   - Price ranges ($ to $$$$)
   - Activity ratings and types

## Troubleshooting

### Common Issues

**"Route not found" or API errors:**
- Verify API key is correctly added to `.env`
- Check API key restrictions in Google Cloud Console
- Ensure Places API and Geocoding API are enabled

**Mock data still showing:**
- Restart the backend server after adding API key
- Check console logs for API initialization messages
- Verify `.env` file has no extra spaces around the key

**Rate limiting:**
- Google Places has daily quotas and rate limits
- Monitor usage in Google Cloud Console
- Consider implementing additional caching if needed

### Debug Mode
Enable debug logging in the backend:
```javascript
console.log('Google Places API configured:', !!googleMapsClient);
```

## Security Best Practices

1. **Restrict API Key**: Always use application and API restrictions
2. **Environment Variables**: Never commit API keys to version control
3. **Monitor Usage**: Set up billing alerts in Google Cloud
4. **Rotate Keys**: Periodically rotate API keys for security

## Future Enhancements

Potential improvements for the location data integration:
- Photo integration from Google Places
- Business hours and contact information
- User reviews and ratings
- Distance calculations between activities
- Route optimization for daily plans
- Integration with Google Maps for directions

The system is designed to be extensible - you can easily add more Google Places features or integrate other location APIs alongside the existing implementation.