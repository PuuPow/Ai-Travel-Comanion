const OpenAI = require('openai');
const { getLocationDataWithFallback } = require('./placesService');

// Initialize OpenAI client only if API key is available
let openai = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== '') {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Mock data for when OpenAI is not available
async function generateMockItinerary(itinerary, preferences = {}) {
  const { destination, startDate, endDate, title } = itinerary;
  const duration = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;
  
  // Get real location data even for mock itineraries
  const locationData = await getLocationDataWithFallback(destination, 15);
  
  // Create completely unique pools using strict deduplication
  const allRestaurants = [...(locationData.restaurants?.all || [])];
  const allActivities = [...(locationData.activities || [])];
  
  // Shuffle arrays first
  shuffleArray(allRestaurants);
  shuffleArray(allActivities);
  
  // Track used items to prevent ANY duplicates
  const usedRestaurants = new Set();
  const usedActivities = new Set();
  const usedRestaurantIds = new Set();
  const usedActivityIds = new Set();
  
  const mockDays = [];
  for (let i = 1; i <= duration; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i - 1);
    
    // Determine number of activities and meals based on vacation style
    const isChillaxed = preferences.vacationStyle?.chillaxed;
    const isBusy = preferences.vacationStyle?.busy;
    const isAdventurous = preferences.vacationStyle?.adventurous;
    
    // Adjust activity count based on vacation style
    let activityCount = 3; // Default
    let mealCount = 2; // Default (lunch + dinner)
    
    if (isChillaxed) {
      activityCount = Math.min(2, allActivities.length); // 1-2 activities for chillaxed
      mealCount = 2; // Keep meals normal
    } else if (isBusy) {
      activityCount = Math.min(6, allActivities.length); // 5-6+ activities for busy
      mealCount = 3; // Add breakfast for busy days
    } else if (isAdventurous) {
      activityCount = Math.min(4, allActivities.length); // 3-4 activities for adventurous
      mealCount = 2;
    }
    
    // Get completely unique restaurants and activities for this day
    const dayRestaurants = getStrictlyUniqueItems(allRestaurants, usedRestaurants, usedRestaurantIds, mealCount);
    const dayActivities = getStrictlyUniqueItems(allActivities, usedActivities, usedActivityIds, activityCount);
    
    const activities = [];
    const meals = [];
    
    const startTime = isChillaxed ? '10:00 AM' : '9:00 AM';
    const activityDuration = isChillaxed ? '3 hours' : isBusy ? '1 hour' : '2 hours';
    
    // Generate activities based on count and style
    const activityTimes = {
      1: [startTime],
      2: [startTime, '2:00 PM'],
      3: [startTime, '1:00 PM', '4:00 PM'],
      4: [startTime, '11:30 AM', '2:00 PM', '4:30 PM'],
      5: [startTime, '10:30 AM', '1:00 PM', '3:00 PM', '5:00 PM'],
      6: [startTime, '10:00 AM', '12:00 PM', '2:00 PM', '4:00 PM', '6:00 PM']
    };
    
    const times = activityTimes[Math.min(activityCount, 6)] || activityTimes[3];
    
    for (let actIdx = 0; actIdx < Math.min(activityCount, dayActivities.length, times.length); actIdx++) {
      const activity = dayActivities[actIdx];
      if (activity) {
        const activityPrefix = isAdventurous ? 'Adventure at' : isChillaxed ? 'Leisurely visit to' : 'Visit';
        activities.push({
          time: times[actIdx],
          activity: activity.name,
          description: `${activityPrefix} ${activity.name}`,
          duration: activityDuration,
          cost: actIdx % 2 === 0 ? 'Medium' : 'Low',
          location: activity.address || `${destination} city center`,
          rating: activity.rating,
          place_id: activity.place_id
        });
      }
    }
    
    // Add fallback activities if needed
    while (activities.length < activityCount && activities.length < times.length) {
      const actIdx = activities.length;
      const fallbackActivities = [
        isAdventurous ? `Outdoor exploration in ${destination}` : isChillaxed ? `Relaxing stroll through ${destination}` : `Explore ${destination} highlights`,
        isAdventurous ? `Adventure sports in ${destination}` : isChillaxed ? `Visit peaceful gardens` : `Cultural site visit`,
        isAdventurous ? `Hiking or active exploration` : isChillaxed ? `Spa or wellness activity` : `Museum visit`,
        isAdventurous ? `Water sports or climbing` : isChillaxed ? `Scenic viewpoint visit` : `Local market exploration`,
        isAdventurous ? `Extreme sports activity` : isChillaxed ? `Yoga or meditation` : `Art gallery visit`,
        isAdventurous ? `Rock climbing or zip-lining` : isChillaxed ? `Beach or lake relaxation` : `Historical tour`
      ];
      
      activities.push({
        time: times[actIdx],
        activity: fallbackActivities[actIdx] || `Activity ${actIdx + 1} in ${destination}`,
        description: `Discover ${destination} at your own pace`,
        duration: activityDuration,
        cost: actIdx % 2 === 0 ? 'Medium' : 'Low',
        location: `${destination} city center`
      });
    }
    
    // Generate meals based on count and style
    const mealTypes = isBusy ? ['breakfast', 'lunch', 'dinner'] : ['lunch', 'dinner'];
    const mealTypesToUse = mealTypes.slice(0, mealCount);
    
    for (let mealIdx = 0; mealIdx < Math.min(mealCount, dayRestaurants.length, mealTypesToUse.length); mealIdx++) {
      const restaurant = dayRestaurants[mealIdx];
      if (restaurant) {
        meals.push({
          type: mealTypesToUse[mealIdx],
          restaurant: restaurant.name,
          cuisine: restaurant.cuisine || 'Local cuisine',
          location: restaurant.address || `${destination} downtown`,
          priceRange: getPriceRange(restaurant.priceLevel),
          rating: restaurant.rating,
          place_id: restaurant.place_id
        });
      }
    }
    
    // Add fallback meals if needed
    while (meals.length < mealCount && meals.length < mealTypesToUse.length) {
      const mealIdx = meals.length;
      const mealType = mealTypesToUse[mealIdx];
      meals.push({
        type: mealType,
        restaurant: `Local ${mealType.charAt(0).toUpperCase() + mealType.slice(1)} Spot`,
        cuisine: 'Local cuisine',
        location: `${destination} downtown`,
        priceRange: '$$'
      });
    }
    
    mockDays.push({
      dayNumber: i,
      date: date.toISOString().split('T')[0],
      activities,
      meals,
      notes: `Enjoy your ${i === 1 ? 'first' : i === duration ? 'last' : ''} day in ${destination}!`
    });
  }
  
  return {
    days: mockDays,
    generalTips: [
      'Check local weather before your trip',
      'Learn basic phrases in the local language',
      'Keep important documents safe',
      'Try local cuisine and specialties'
    ],
    budgetEstimate: {
      low: 50 * duration,
      medium: 100 * duration,
      high: 200 * duration
    },
    locationData,
    hasRealPlaces: locationData.hasRealData,
    mockData: !openai,
    message: !openai ? 'This uses real location data but AI suggestions are limited. Add an OpenAI API key for enhanced AI planning.' : undefined
  };
}

// Helper function to shuffle array in place (Fisher-Yates shuffle)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Strictly unique item selection - NO duplicates allowed
function getStrictlyUniqueItems(array, usedNames, usedIds, count) {
  if (array.length === 0) return [];
  
  const items = [];
  for (const item of array) {
    if (items.length >= count) break;
    
    // Check for duplicates by name, ID, and place_id
    const itemName = item.name || item.restaurant || item.activity;
    const itemId = item.place_id || item.id || itemName;
    
    if (!usedNames.has(itemName) && !usedIds.has(itemId)) {
      items.push(item);
      usedNames.add(itemName);
      usedIds.add(itemId);
      
      // Also add similar variations to prevent near-duplicates
      if (item.address) usedNames.add(item.address);
    }
  }
  
  return items;
}

// Helper function to get random items from array (fallback)
function getRandomItems(array, count) {
  const shuffled = [...array];
  shuffleArray(shuffled);
  return shuffled.slice(0, count);
}

// Helper function to convert price level to price range
function getPriceRange(priceLevel) {
  switch(priceLevel) {
    case 1: return '$';
    case 2: return '$$';
    case 3: return '$$$';
    case 4: return '$$$$';
    default: return '$$';
  }
}

// Helper function to create location context for AI
function createLocationContext(locationData) {
  if (!locationData || !locationData.hasRealData) {
    return 'No specific location data available. Please suggest generic activities and restaurants.';
  }
  
  let context = `\n\nREAL LOCATION DATA FOR ${locationData.cityInfo?.primary?.toUpperCase() || 'DESTINATION'}:\n\n`;
  
  // Add restaurant information
  if (locationData.restaurants?.all?.length > 0) {
    context += 'REAL RESTAURANTS TO INCLUDE:\n';
    locationData.restaurants.all.slice(0, 8).forEach((restaurant, i) => {
      context += `${i + 1}. ${restaurant.name} - ${restaurant.cuisine} (${getPriceRange(restaurant.priceLevel)}, Rating: ${restaurant.rating}/5)\n`;
      context += `   Address: ${restaurant.address}\n`;
    });
    context += '\n';
  }
  
  // Add activity information
  if (locationData.activities?.length > 0) {
    context += 'REAL ATTRACTIONS/ACTIVITIES TO INCLUDE:\n';
    locationData.activities.slice(0, 10).forEach((activity, i) => {
      context += `${i + 1}. ${activity.name} (Rating: ${activity.rating}/5)\n`;
      context += `   Address: ${activity.address}\n`;
      context += `   Types: ${activity.types.join(', ')}\n`;
    });
    context += '\n';
  }
  
  context += 'IMPORTANT: Please use these EXACT restaurant and attraction names in your itinerary suggestions. Include their addresses when available.';
  
  return context;
}

/**
 * Generate itinerary suggestions based on destination and preferences
 */
async function generateItinerarySuggestions(itinerary, preferences = {}) {
  try {
    // If OpenAI is not configured, return mock data
    if (!openai) {
      console.log('OpenAI API not configured, returning mock data');
      return await generateMockItinerary(itinerary, preferences);
    }
    
    const { destination, startDate, endDate, title } = itinerary;
    const duration = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;
    
    // Get real location data to enhance AI suggestions
    console.log(`Fetching location data for ${destination}...`);
    const locationData = await getLocationDataWithFallback(destination, 15);
    
    // Create context about real places for the AI
    const realPlacesContext = createLocationContext(locationData);
    
    // Create vacation style context
    let vacationStyleContext = '';
    let activityCountGuidance = '';
    if (preferences.vacationStyle) {
      const styles = preferences.vacationStyle;
      if (styles.chillaxed) {
        vacationStyleContext += '🏖️ CHILLAXED VACATION: Focus on relaxing activities, leisurely meals, spa experiences, scenic views, and downtime. Avoid rushed schedules.\n';
        activityCountGuidance += 'ACTIVITY COUNT: Provide 1-2 activities per day maximum. Focus on quality over quantity with longer durations.\n';
      }
      if (styles.adventurous) {
        vacationStyleContext += '🏔️ ADVENTUROUS VACATION: Include hiking, outdoor activities, adventure sports, exploration, and active experiences.\n';
        activityCountGuidance += 'ACTIVITY COUNT: Provide 3-4 activities per day. Mix of active adventures and exploration.\n';
      }
      if (styles.busy) {
        vacationStyleContext += '🏃 BUSY VACATION: Pack the schedule with multiple activities, sightseeing, cultural experiences, and efficient time usage.\n';
        activityCountGuidance += 'ACTIVITY COUNT: Provide 5-6+ activities per day. Pack the schedule efficiently with varied experiences. Include breakfast recommendations.\n';
      }
    } else {
      activityCountGuidance = 'ACTIVITY COUNT: Provide 3 activities per day as default.\n';
    }
    
    const prompt = `Create a detailed ${duration}-day travel itinerary for ${destination}.

Trip Details:
- Trip Title: ${title}
- Destination: ${destination}
- Duration: ${duration} days
- Start Date: ${new Date(startDate).toDateString()}
- End Date: ${new Date(endDate).toDateString()}

${vacationStyleContext}
${activityCountGuidance}

Other Preferences: ${JSON.stringify(preferences, null, 2)}

${realPlacesContext}

IMPORTANT REQUIREMENTS:
- NEVER repeat the same restaurant or activity across multiple days
- Each day should feature completely unique restaurants and attractions
- Distribute the real locations evenly across all days
- If there aren't enough real locations, supplement with unique fictional ones

Please provide:
1. Daily activities and attractions to visit (PRIORITIZE the real locations listed above, NO DUPLICATES)
2. Recommended restaurants for each day (USE the exact restaurant names from the list above, NO DUPLICATES)
3. Transportation suggestions
4. Time estimates for each activity
5. Budget-friendly and premium options when applicable

Format the response as a JSON object with this structure:
{
  "days": [
    {
      "dayNumber": 1,
      "date": "YYYY-MM-DD",
      "activities": [
        {
          "time": "9:00 AM",
          "activity": "Activity name",
          "description": "Brief description",
          "duration": "2 hours",
          "cost": "Low/Medium/High",
          "location": "Address or area"
        }
      ],
      "meals": [
        {
          "type": "breakfast/lunch/dinner",
          "restaurant": "Restaurant name",
          "cuisine": "Cuisine type",
          "location": "Address",
          "priceRange": "$/$$/$$$"
        }
      ],
      "notes": "Additional tips for the day"
    }
  ],
  "generalTips": ["Tip 1", "Tip 2"],
  "budgetEstimate": {
    "low": 100,
    "medium": 200,
    "high": 300
  }
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a knowledgeable travel planner who creates detailed, practical itineraries. Always respond with valid JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content;
    
    try {
      const parsedResponse = JSON.parse(response);
      
      // Enhance the response with location data
      return {
        ...parsedResponse,
        locationData,
        hasRealPlaces: locationData.hasRealData,
        radiusCovered: locationData.multiCity ? 
          `${locationData.radiusMiles || 15} miles around each city` : 
          `${locationData.radiusMiles || 15} miles`,
        totalRestaurants: locationData.restaurants?.all?.length || 0,
        totalActivities: locationData.activities?.length || 0,
        citiesCovered: locationData.summary?.citiesCovered || locationData.cityInfo?.primary
      };
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      return {
        error: 'Failed to generate suggestions',
        rawResponse: response,
        locationData
      };
    }

  } catch (error) {
    console.error('Error generating itinerary suggestions:', error);
    throw new Error('Failed to generate itinerary suggestions');
  }
}

/**
 * Generate packing list suggestions based on itinerary details
 */
async function generatePackingListSuggestions(itinerary, preferences = {}) {
  try {
    const { destination, startDate, endDate } = itinerary;
    const duration = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;
    
    // Determine season based on dates (simplified)
    const startMonth = new Date(startDate).getMonth();
    let season = 'spring';
    if (startMonth >= 5 && startMonth <= 7) season = 'summer';
    else if (startMonth >= 8 && startMonth <= 10) season = 'fall';
    else if (startMonth >= 11 || startMonth <= 1) season = 'winter';

    const prompt = `Create a comprehensive packing list for a ${duration}-day trip to ${destination} during ${season}.

Trip Details:
- Destination: ${destination}
- Duration: ${duration} days
- Season: ${season}
- Start Date: ${new Date(startDate).toDateString()}
- End Date: ${new Date(endDate).toDateString()}

Preferences: ${JSON.stringify(preferences, null, 2)}

Please provide a categorized packing list with the following structure:
{
  "categories": [
    {
      "name": "Clothing",
      "items": [
        {
          "item": "Item name",
          "quantity": 3,
          "essential": true,
          "notes": "Optional notes about the item"
        }
      ]
    },
    {
      "name": "Electronics",
      "items": [...]
    },
    {
      "name": "Personal Care",
      "items": [...]
    },
    {
      "name": "Documents",
      "items": [...]
    },
    {
      "name": "Miscellaneous",
      "items": [...]
    }
  ],
  "weatherConsiderations": ["Consideration 1", "Consideration 2"],
  "destinationSpecific": ["Specific item 1", "Specific item 2"],
  "tips": ["Packing tip 1", "Packing tip 2"]
}

Consider the destination's climate, culture, and common activities. Mark items as essential or optional.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a seasoned traveler who creates practical, destination-specific packing lists. Always respond with valid JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content;
    
    try {
      return JSON.parse(response);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      return {
        error: 'Failed to generate packing suggestions',
        rawResponse: response
      };
    }

  } catch (error) {
    console.error('Error generating packing list suggestions:', error);
    throw new Error('Failed to generate packing list suggestions');
  }
}

/**
 * Generate destination information and tips
 */
async function generateDestinationInfo(destination) {
  try {
    const prompt = `Provide comprehensive travel information for ${destination}.

Include:
1. Best time to visit
2. Local customs and etiquette
3. Currency and tipping practices
4. Transportation options
5. Must-see attractions
6. Local cuisine highlights
7. Safety tips
8. Language and communication
9. Weather patterns
10. Budget considerations

Format as JSON with clear categories.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a travel expert providing detailed, accurate destination information. Always respond with valid JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.5,
    });

    const response = completion.choices[0].message.content;
    
    try {
      return JSON.parse(response);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      return {
        error: 'Failed to generate destination info',
        rawResponse: response
      };
    }

  } catch (error) {
    console.error('Error generating destination info:', error);
    throw new Error('Failed to generate destination information');
  }
}

/**
 * Generate AI suggestions for a single day
 */
async function generateSingleDaySuggestions(itinerary, day, preferences = {}, existingDays = []) {
  try {
    const { destination } = itinerary;
    
    // Get real location data for the destination
    const locationData = await getLocationDataWithFallback(destination, 15);
    
    // If OpenAI is not configured, return mock data for single day
    if (!openai) {
      console.log('OpenAI API not configured, returning mock single day data');
      return await generateMockSingleDay(destination, day, locationData, preferences);
    }
    
    // Create vacation style context
    let vacationStyleContext = '';
    let singleDayActivityCount = '';
    if (preferences.vacationStyle) {
      const styles = preferences.vacationStyle;
      if (styles.chillaxed) {
        vacationStyleContext += '🏖️ CHILLAXED APPROACH: Focus on relaxing activities and leisurely pace.\n';
        singleDayActivityCount += 'Provide 1-2 activities maximum for a relaxed day.\n';
      }
      if (styles.adventurous) {
        vacationStyleContext += '🏔️ ADVENTUROUS APPROACH: Include active, outdoor, and exciting activities.\n';
        singleDayActivityCount += 'Provide 3-4 activities for an adventurous day.\n';
      }
      if (styles.busy) {
        vacationStyleContext += '🏃 BUSY APPROACH: Pack multiple activities efficiently into the day.\n';
        singleDayActivityCount += 'Provide 5-6 activities for a packed, efficient day. Include breakfast if needed.\n';
      }
    } else {
      singleDayActivityCount = 'Provide 2-3 activities as default.\n';
    }
    
    // Create context about real places for the AI
    const realPlacesContext = createLocationContext(locationData);
    
    const dayDate = new Date(day.date).toDateString();
    
    const prompt = `Generate activities and dining suggestions for a single day in ${destination}.

Day Details:
- Date: ${dayDate}
- Day ${day.dayNumber} of the trip
- Location: ${destination}

${vacationStyleContext}
${singleDayActivityCount}

${realPlacesContext}

IMPORTANT REQUIREMENTS:
- Follow the activity count guidance above for this specific day
- Include lunch and dinner recommendations
- Use REAL locations from the provided list when possible
- Ensure NO duplicates with existing itinerary days
- Create a balanced daily schedule

Preferences: ${JSON.stringify(preferences, null, 2)}

Format the response as a JSON object:
{
  "activities": [
    {
      "time": "9:00 AM",
      "activity": "Activity name",
      "description": "Brief description",
      "duration": "2 hours",
      "cost": "Low/Medium/High",
      "location": "Address or area"
    }
  ],
  "meals": [
    {
      "type": "lunch",
      "restaurant": "Restaurant name",
      "cuisine": "Cuisine type",
      "location": "Address",
      "priceRange": "$/$$/$$$"
    }
  ],
  "notes": "Tips for this specific day"
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a travel planner creating suggestions for a single day. Always respond with valid JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content;
    
    try {
      const parsedResponse = JSON.parse(response);
      return {
        ...parsedResponse,
        hasRealPlaces: locationData.hasRealData
      };
    } catch (parseError) {
      console.error('Failed to parse OpenAI single day response:', parseError);
      return {
        error: 'Failed to generate day suggestions',
        rawResponse: response
      };
    }

  } catch (error) {
    console.error('Error generating single day suggestions:', error);
    throw new Error('Failed to generate single day suggestions');
  }
}

/**
 * Generate mock single day suggestions when OpenAI is not available
 */
async function generateMockSingleDay(destination, day, locationData, preferences = {}) {
  // Adjust based on vacation style
  const isChillaxed = preferences.vacationStyle?.chillaxed;
  const isAdventurous = preferences.vacationStyle?.adventurous;
  const isBusy = preferences.vacationStyle?.busy;
  
  // Determine activity and meal counts
  let activityCount = 3; // Default
  let mealCount = 2; // Default
  
  if (isChillaxed) {
    activityCount = 2;
    mealCount = 2;
  } else if (isBusy) {
    activityCount = 6;
    mealCount = 3; // Include breakfast
  } else if (isAdventurous) {
    activityCount = 4;
    mealCount = 2;
  }
  
  // Get unique items for this day
  const availableRestaurants = [...(locationData.restaurants?.all || [])];
  const availableActivities = [...(locationData.activities || [])];
  
  shuffleArray(availableRestaurants);
  shuffleArray(availableActivities);
  
  const dayRestaurants = availableRestaurants.slice(0, mealCount);
  const dayActivities = availableActivities.slice(0, activityCount);
  
  const activities = [];
  const meals = [];
  
  const startTime = isChillaxed ? '10:00 AM' : '9:00 AM';
  const activityDuration = isChillaxed ? '3 hours' : isBusy ? '1 hour' : '2 hours';
  
  // Generate activities based on count
  const activityTimes = {
    1: [startTime],
    2: [startTime, '2:00 PM'],
    3: [startTime, '1:00 PM', '4:00 PM'],
    4: [startTime, '11:30 AM', '2:00 PM', '4:30 PM'],
    5: [startTime, '10:30 AM', '1:00 PM', '3:00 PM', '5:00 PM'],
    6: [startTime, '10:00 AM', '12:00 PM', '2:00 PM', '4:00 PM', '6:00 PM']
  };
  
  const times = activityTimes[Math.min(activityCount, 6)] || activityTimes[3];
  
  for (let actIdx = 0; actIdx < Math.min(activityCount, dayActivities.length, times.length); actIdx++) {
    const activity = dayActivities[actIdx];
    if (activity) {
      const prefix = isAdventurous ? 'Adventure at' : isChillaxed ? 'Leisurely visit to' : 'Explore';
      activities.push({
        time: times[actIdx],
        activity: activity.name,
        description: `${prefix} ${activity.name}`,
        duration: activityDuration,
        cost: actIdx % 2 === 0 ? 'Medium' : 'Low',
        location: activity.address || `${destination} area`,
        rating: activity.rating
      });
    }
  }
  
  // Add fallback activities if needed
  while (activities.length < activityCount && activities.length < times.length) {
    const actIdx = activities.length;
    const fallbackActivities = [
      isAdventurous ? `Outdoor exploration in ${destination}` : isChillaxed ? `Relaxing stroll through ${destination}` : `Explore ${destination} highlights`,
      isAdventurous ? `Adventure sports in ${destination}` : isChillaxed ? `Visit peaceful gardens` : `Cultural site visit`,
      isAdventurous ? `Hiking or active exploration` : isChillaxed ? `Spa or wellness activity` : `Museum visit`,
      isAdventurous ? `Water sports or climbing` : isChillaxed ? `Scenic viewpoint visit` : `Local market exploration`,
      isAdventurous ? `Extreme sports activity` : isChillaxed ? `Yoga or meditation` : `Art gallery visit`,
      isAdventurous ? `Rock climbing or zip-lining` : isChillaxed ? `Beach or lake relaxation` : `Historical tour`
    ];
    
    activities.push({
      time: times[actIdx],
      activity: fallbackActivities[actIdx] || `Activity ${actIdx + 1} in ${destination}`,
      description: `Discover ${destination} at your own pace`,
      duration: activityDuration,
      cost: actIdx % 2 === 0 ? 'Medium' : 'Low',
      location: `${destination} area`
    });
  }
  
  // Generate meals based on count and style
  const mealTypes = isBusy ? ['breakfast', 'lunch', 'dinner'] : ['lunch', 'dinner'];
  const mealTypesToUse = mealTypes.slice(0, mealCount);
  
  for (let mealIdx = 0; mealIdx < Math.min(mealCount, dayRestaurants.length, mealTypesToUse.length); mealIdx++) {
    const restaurant = dayRestaurants[mealIdx];
    if (restaurant) {
      meals.push({
        type: mealTypesToUse[mealIdx],
        restaurant: restaurant.name,
        cuisine: restaurant.cuisine || 'Local cuisine',
        location: restaurant.address || `${destination} downtown`,
        priceRange: getPriceRange(restaurant.priceLevel),
        rating: restaurant.rating
      });
    }
  }
  
  // Add fallback meals if needed
  while (meals.length < mealCount && meals.length < mealTypesToUse.length) {
    const mealIdx = meals.length;
    const mealType = mealTypesToUse[mealIdx];
    meals.push({
      type: mealType,
      restaurant: `Local ${mealType.charAt(0).toUpperCase() + mealType.slice(1)} Spot`,
      cuisine: 'Local cuisine',
      location: `${destination} downtown`,
      priceRange: '$$'
    });
  }
  
  const styleNote = isChillaxed ? 'Take your time and enjoy a relaxed pace.' :
                   isAdventurous ? 'Great day for active exploration!' :
                   isBusy ? 'Packed day with efficient scheduling.' :
                   'Enjoy discovering this destination!';
  
  return {
    activities,
    meals,
    notes: `Day ${day.dayNumber} in ${destination}. ${styleNote}`,
    hasRealPlaces: locationData.hasRealData
  };
}

module.exports = {
  generateItinerarySuggestions,
  generatePackingListSuggestions,
  generateDestinationInfo,
  generateSingleDaySuggestions
};
