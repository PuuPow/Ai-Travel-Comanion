const { Client } = require('@googlemaps/google-maps-services-js');
const NodeCache = require('node-cache');

// Initialize cache (1 hour TTL for API responses)
const cache = new NodeCache({ stdTTL: 3600 });

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in miles
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Filter places by exact distance from center coordinates
 */
function filterByDistance(places, centerCoords, maxDistanceMiles) {
  return places.filter(place => {
    if (!place.coordinates || !place.coordinates.lat || !place.coordinates.lng) {
      return false; // Skip places without coordinates
    }
    
    const distance = calculateDistance(
      centerCoords.lat, 
      centerCoords.lng,
      place.coordinates.lat, 
      place.coordinates.lng
    );
    
    // Add distance to place object for debugging
    place.distanceFromCenter = Math.round(distance * 10) / 10; // Round to 1 decimal
    
    return distance <= maxDistanceMiles;
  });
}

// Initialize Google Maps client
let googleMapsClient = null;

// Function to initialize the client (called when needed)
function getGoogleMapsClient() {
  if (!googleMapsClient && process.env.GOOGLE_PLACES_API_KEY && process.env.GOOGLE_PLACES_API_KEY.trim() !== '') {
    googleMapsClient = new Client({});
  }
  return googleMapsClient;
}

/**
 * Extract multiple city names from a destination string or trip description
 * Handles formats like "Paris, France", "New York to Los Angeles", "Tokyo, Japan and Kyoto"
 */
function extractCitiesFromDestination(destination) {
  // Remove common travel-related words and clean up
  let cleanDestination = destination
    .replace(/\b(trip to|visit|vacation in|tour of|traveling to|flight to|drive to|trip|visiting)\b/gi, '')
    .replace(/[^\w\s,-]/g, '')
    .trim();

  // Split by various separators to find multiple cities
  const separators = /\b(and|then|to|via|through)\b/gi;
  let possibleCities = cleanDestination
    .split(separators)
    .map(part => part.trim())
    .filter(part => part && part.length > 2 && !separators.test(part));

  // Enhanced city name cleaning - remove state/country prefixes from individual cities
  possibleCities = possibleCities.map(city => {
    // Remove leading state names like "Oregon Portland" -> "Portland"
    const statePatterns = /^(Oregon|Washington|California|Texas|New York|Florida|Nevada|Utah|Colorado|Arizona)\s+/i;
    return city.replace(statePatterns, '').trim();
  }).filter(city => city.length > 2);

  // If no separators found, try comma splitting for "City, Country" format
  if (possibleCities.length <= 1) {
    const commaParts = cleanDestination.split(',')
      .map(p => p.trim())
      .filter(p => p && p.length > 2);
    
    if (commaParts.length > 1) {
      // For "City, Country" format, treat as single destination
      possibleCities = [cleanDestination];
    } else {
      possibleCities = commaParts;
    }
  }
  
  // Final cleanup: if we still have generic terms, try to extract proper city names
  if (possibleCities.length === 1 && possibleCities[0].toLowerCase().includes('oregon')) {
    // For generic "Oregon" destinations, default to major cities
    if (possibleCities[0].toLowerCase() === 'oregon') {
      possibleCities = ['Portland, Oregon'];
    } else if (possibleCities[0].toLowerCase().includes('coast')) {
      possibleCities = ['Newport, Oregon'];
    }
  }
  
  // Deduplicate and clean
  const allCities = [...new Set(possibleCities)]
    .filter(city => city && city.length > 2)
    .slice(0, 5); // Limit to 5 cities max for API efficiency

  const primaryCity = allCities[0] || cleanDestination;
  
  return {
    cities: allCities,
    primary: primaryCity,
    full: cleanDestination,
    multiCity: allCities.length > 1
  };
}

/**
 * Extract city names from a destination string (backward compatibility)
 * Handles formats like "Paris, France", "New York City", "Tokyo, Japan"
 */
function extractCityFromDestination(destination) {
  const cityData = extractCitiesFromDestination(destination);
  return {
    primary: cityData.primary,
    full: cityData.full,
    parts: cityData.cities
  };
}

/**
 * Get coordinates for a city using Google Geocoding API
 */
async function getCityCoordinates(cityName) {
  const client = getGoogleMapsClient();
  if (!client) {
    return null;
  }

  const cacheKey = `coordinates_${cityName.toLowerCase()}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const response = await client.geocode({
      params: {
        address: cityName,
        key: process.env.GOOGLE_PLACES_API_KEY,
      },
    });

    if (response.data.results.length > 0) {
      const result = response.data.results[0];
      const coordinates = {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        formatted_address: result.formatted_address,
        place_id: result.place_id
      };
      
      cache.set(cacheKey, coordinates);
      return coordinates;
    }
    
    return null;
  } catch (error) {
    console.error('Error geocoding city:', error);
    return null;
  }
}

/**
 * Search for restaurants near a location
 */
async function findRestaurants(coordinates, radius = 25000, cuisine = '', priceLevel = null) {
  const client = getGoogleMapsClient();
  if (!client || !coordinates) {
    return [];
  }

  const cacheKey = `restaurants_${coordinates.lat}_${coordinates.lng}_${radius}_${cuisine}_${priceLevel}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    let query = 'restaurant';
    if (cuisine) {
      query += ` ${cuisine}`;
    }

    const searchParams = {
      params: {
        query: query,
        location: `${coordinates.lat},${coordinates.lng}`,
        radius: radius,
        key: process.env.GOOGLE_PLACES_API_KEY,
        type: 'restaurant'
      }
    };

    // Add price level filter if specified
    if (priceLevel !== null) {
      searchParams.params.minprice = priceLevel;
      searchParams.params.maxprice = priceLevel;
    }

    const response = await client.textSearch(searchParams);
    
    let restaurants = response.data.results.map(place => ({
      name: place.name,
      address: place.formatted_address,
      rating: place.rating,
      priceLevel: place.price_level,
      cuisine: place.types.filter(type => 
        !['establishment', 'point_of_interest', 'food', 'restaurant'].includes(type)
      ).join(', '),
      photos: place.photos ? place.photos.slice(0, 1) : [],
      place_id: place.place_id,
      coordinates: {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng
      }
    }));
    
    // Filter by exact distance (Google's radius is just a suggestion)
    const maxDistanceMiles = radius / 1609.34; // Convert meters back to miles
    restaurants = filterByDistance(restaurants, coordinates, maxDistanceMiles);
    
    // Limit to top 10 results after distance filtering
    restaurants = restaurants.slice(0, 10);

    cache.set(cacheKey, restaurants);
    return restaurants;
  } catch (error) {
    console.error('Error finding restaurants:', error);
    return [];
  }
}

/**
 * Search for activities and attractions near a location
 */
async function findActivities(coordinates, radius = 25000, activityType = '') {
  const client = getGoogleMapsClient();
  if (!client || !coordinates) {
    return [];
  }

  const cacheKey = `activities_${coordinates.lat}_${coordinates.lng}_${radius}_${activityType}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    let query = activityType || 'tourist attraction things to do';
    
    const response = await client.textSearch({
      params: {
        query: query,
        location: `${coordinates.lat},${coordinates.lng}`,
        radius: radius,
        key: process.env.GOOGLE_PLACES_API_KEY,
        type: 'tourist_attraction'
      }
    });

    let activities = response.data.results.map(place => ({
      name: place.name,
      address: place.formatted_address,
      rating: place.rating,
      types: place.types.filter(type => 
        !['establishment', 'point_of_interest'].includes(type)
      ),
      photos: place.photos ? place.photos.slice(0, 1) : [],
      place_id: place.place_id,
      coordinates: {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng
      }
    }));
    
    // Filter by exact distance (Google's radius is just a suggestion)
    const maxDistanceMiles = radius / 1609.34; // Convert meters back to miles
    activities = filterByDistance(activities, coordinates, maxDistanceMiles);
    
    // Limit to top 15 results after distance filtering
    activities = activities.slice(0, 15);

    cache.set(cacheKey, activities);
    return activities;
  } catch (error) {
    console.error('Error finding activities:', error);
    return [];
  }
}

/**
 * Get location data for multiple cities with targeted radius
 */
async function getMultiCityLocationData(destination, radiusMiles = 15) {
  const cityData = extractCitiesFromDestination(destination);
  const radiusMeters = radiusMiles * 1609.34; // Convert miles to meters
  
  console.log(`Extracting location data for cities: ${cityData.cities.join(', ')}`);
  
  const cityResults = [];
  const allRestaurants = [];
  const allActivities = [];
  const allFineRestaurants = [];
  const allCasualRestaurants = [];
  
  // Process each city
  for (const cityName of cityData.cities) {
    console.log(`Getting coordinates for: ${cityName}`);
    const coordinates = await getCityCoordinates(cityName);
    
    if (!coordinates) {
      console.log(`Could not geocode: ${cityName}`);
      continue;
    }
    
    console.log(`Fetching places within ${radiusMiles} miles of ${cityName}`);
    
    // Fetch different types of data in parallel for this city
    const [restaurants, activities, fineRestaurants, casualRestaurants] = await Promise.all([
      findRestaurants(coordinates, radiusMeters),
      findActivities(coordinates, radiusMeters),
      findRestaurants(coordinates, radiusMeters, '', 3), // Higher-end restaurants
      findRestaurants(coordinates, radiusMeters, '', 1)  // Budget-friendly restaurants
    ]);
    
    cityResults.push({
      cityName,
      coordinates,
      restaurants: {
        all: restaurants,
        fine: fineRestaurants,
        casual: casualRestaurants
      },
      activities,
      radiusMiles,
      count: {
        restaurants: restaurants.length,
        activities: activities.length
      }
    });
    
    // Accumulate all results
    allRestaurants.push(...restaurants);
    allActivities.push(...activities);
    allFineRestaurants.push(...fineRestaurants);
    allCasualRestaurants.push(...casualRestaurants);
  }
  
  if (cityResults.length === 0) {
    return {
      hasRealData: false,
      cityInfo: cityData,
      error: 'Could not geocode any cities from destination'
    };
  }
  
  // Deduplicate results based on place_id
  const deduplicateByPlaceId = (items) => {
    const seen = new Set();
    return items.filter(item => {
      if (!item.place_id) return true; // Keep items without place_id
      if (seen.has(item.place_id)) return false;
      seen.add(item.place_id);
      return true;
    });
  };
  
  const uniqueRestaurants = deduplicateByPlaceId(allRestaurants);
  const uniqueActivities = deduplicateByPlaceId(allActivities);
  const uniqueFineRestaurants = deduplicateByPlaceId(allFineRestaurants);
  const uniqueCasualRestaurants = deduplicateByPlaceId(allCasualRestaurants);
  
  return {
    hasRealData: true,
    cityInfo: cityData,
    multiCity: cityData.multiCity,
    cityResults,
    restaurants: {
      all: uniqueRestaurants,
      fine: uniqueFineRestaurants,
      casual: uniqueCasualRestaurants
    },
    activities: uniqueActivities,
    radiusMiles,
    radiusMeters,
    totalCitiesProcessed: cityResults.length,
    summary: {
      totalRestaurants: uniqueRestaurants.length,
      totalActivities: uniqueActivities.length,
      citiesCovered: cityResults.map(r => r.cityName).join(', ')
    }
  };
}

/**
 * Get comprehensive location data for a destination (legacy function for backward compatibility)
 */
async function getLocationData(destination, radiusMiles = 15) {
  // Use the new multi-city function but format result to match legacy expectations
  const result = await getMultiCityLocationData(destination, radiusMiles);
  
  if (!result.hasRealData) {
    return result;
  }
  
  // Format to match legacy structure
  return {
    hasRealData: true,
    cityInfo: {
      primary: result.cityInfo.primary,
      full: result.cityInfo.full,
      parts: result.cityInfo.cities
    },
    coordinates: result.cityResults[0]?.coordinates, // Primary city coordinates
    restaurants: result.restaurants,
    activities: result.activities,
    radiusMiles: result.radiusMiles,
    radiusMeters: result.radiusMeters,
    multiCity: result.multiCity,
    summary: result.summary
  };
}

/**
 * Generate mock data when Places API is not available
 */
function generateMockLocationData(destination) {
  const cityInfo = extractCityFromDestination(destination);
  
  return {
    hasRealData: false,
    cityInfo,
    mockData: true,
    message: 'Add a Google Places API key for real restaurant and activity suggestions.',
    restaurants: {
      all: [
        {
          name: 'Local Favorite Restaurant',
          address: `Downtown ${cityInfo.primary}`,
          rating: 4.2,
          priceLevel: 2,
          cuisine: 'Local cuisine'
        },
        {
          name: 'Cozy Cafe',
          address: `City Center, ${cityInfo.primary}`,
          rating: 4.0,
          priceLevel: 1,
          cuisine: 'Coffee, Breakfast'
        }
      ],
      fine: [
        {
          name: 'Fine Dining Restaurant',
          address: `Upscale District, ${cityInfo.primary}`,
          rating: 4.5,
          priceLevel: 3,
          cuisine: 'International'
        }
      ],
      casual: [
        {
          name: 'Popular Local Eatery',
          address: `Tourist Area, ${cityInfo.primary}`,
          rating: 4.1,
          priceLevel: 1,
          cuisine: 'Local street food'
        }
      ]
    },
    activities: [
      {
        name: `${cityInfo.primary} Main Attraction`,
        address: `Historic District, ${cityInfo.primary}`,
        rating: 4.3,
        types: ['tourist_attraction', 'museum']
      },
      {
        name: `${cityInfo.primary} Walking Tour`,
        address: `City Center, ${cityInfo.primary}`,
        rating: 4.4,
        types: ['tourist_attraction', 'tour']
      }
    ]
  };
}

/**
 * Main function to get location data with fallback to mock data
 */
async function getLocationDataWithFallback(destination, radiusMiles = 15) {
  try {
    const client = getGoogleMapsClient();
    if (!client) {
      console.log('Google Places API not configured, returning mock location data');
      return generateMockLocationData(destination);
    }
    
    console.log(`Fetching location data with ${radiusMiles}-mile radius per city`);
    return await getLocationData(destination, radiusMiles);
  } catch (error) {
    console.error('Error fetching location data:', error);
    return generateMockLocationData(destination);
  }
}

module.exports = {
  getLocationDataWithFallback,
  getMultiCityLocationData,
  getCityCoordinates,
  findRestaurants,
  findActivities,
  extractCityFromDestination,
  extractCitiesFromDestination
};
