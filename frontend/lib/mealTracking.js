/**
 * Meal Tracking Utilities
 * Converts restaurant bookings into itinerary meals and manages meal data
 */

/**
 * Convert a restaurant booking into a meal object for itinerary
 */
export const convertBookingToMeal = (booking) => {
  if (booking.type !== 'restaurant') {
    return null;
  }

  // Determine meal type based on time
  const mealType = determineMealType(booking.time);
  
  return {
    type: mealType,
    restaurant: booking.title,
    cuisine: extractCuisineFromNotes(booking.notes) || 'Restaurant',
    location: booking.location || '',
    priceRange: convertCostToPriceRange(booking.cost),
    rating: null, // Would be filled from reviews if available
    time: booking.time,
    date: booking.date,
    reservationConfirmation: booking.confirmationNumber,
    provider: booking.provider,
    notes: booking.notes,
    bookingId: booking.id
  };
};

/**
 * Determine meal type based on time of day
 */
export const determineMealType = (timeString) => {
  if (!timeString) return 'dinner'; // Default to dinner if no time specified
  
  const hour = parseInt(timeString.split(':')[0]);
  
  if (hour >= 5 && hour < 11) {
    return 'breakfast';
  } else if (hour >= 11 && hour < 16) {
    return 'lunch';
  } else {
    return 'dinner';
  }
};

/**
 * Extract cuisine type from booking notes or title
 */
export const extractCuisineFromNotes = (notes) => {
  if (!notes) return null;
  
  const cuisineKeywords = {
    'italian': 'Italian',
    'chinese': 'Chinese', 
    'japanese': 'Japanese',
    'mexican': 'Mexican',
    'french': 'French',
    'indian': 'Indian',
    'thai': 'Thai',
    'mediterranean': 'Mediterranean',
    'american': 'American',
    'seafood': 'Seafood',
    'steakhouse': 'Steakhouse',
    'pizza': 'Pizza',
    'sushi': 'Sushi',
    'bbq': 'BBQ',
    'vegan': 'Vegan',
    'vegetarian': 'Vegetarian',
    'fast food': 'Fast Food',
    'cafe': 'Cafe',
    'bistro': 'Bistro'
  };
  
  const notesLower = notes.toLowerCase();
  
  for (const [keyword, cuisine] of Object.entries(cuisineKeywords)) {
    if (notesLower.includes(keyword)) {
      return cuisine;
    }
  }
  
  return null;
};

/**
 * Convert cost to price range
 */
export const convertCostToPriceRange = (cost) => {
  if (!cost || cost === '') return null;
  
  const costNum = parseFloat(cost);
  
  if (costNum < 15) {
    return '$';
  } else if (costNum < 35) {
    return '$$';
  } else if (costNum < 60) {
    return '$$$';
  } else {
    return '$$$$';
  }
};

/**
 * Add meal to itinerary day
 */
export const addMealToItinerary = async (itineraryId, dayId, meal) => {
  try {
    // In a real app, this would be an API call
    // For now, we'll work with localStorage
    
    // Get current itineraries
    const itinerariesStr = localStorage.getItem('user_itineraries');
    if (!itinerariesStr) return false;
    
    const itineraries = JSON.parse(itinerariesStr);
    const itinerary = itineraries.find(it => it.id === itineraryId);
    
    if (!itinerary || !itinerary.days) return false;
    
    const day = itinerary.days.find(d => d.id === dayId);
    if (!day) return false;
    
    // Initialize meals array if it doesn't exist
    if (!day.meals) {
      day.meals = [];
    }
    
    // Check if meal already exists (prevent duplicates)
    const existingMeal = day.meals.find(m => 
      m.bookingId === meal.bookingId || 
      (m.restaurant === meal.restaurant && m.type === meal.type && m.date === meal.date)
    );
    
    if (!existingMeal) {
      day.meals.push(meal);
      
      // Save back to localStorage
      localStorage.setItem('user_itineraries', JSON.stringify(itineraries));
      return true;
    }
    
    return false; // Meal already exists
  } catch (error) {
    console.error('Error adding meal to itinerary:', error);
    return false;
  }
};

/**
 * Remove meal from itinerary when booking is deleted
 */
export const removeMealFromItinerary = async (bookingId) => {
  try {
    const itinerariesStr = localStorage.getItem('user_itineraries');
    if (!itinerariesStr) return false;
    
    const itineraries = JSON.parse(itinerariesStr);
    let mealRemoved = false;
    
    // Search through all itineraries and days
    itineraries.forEach(itinerary => {
      if (itinerary.days) {
        itinerary.days.forEach(day => {
          if (day.meals) {
            const originalLength = day.meals.length;
            day.meals = day.meals.filter(meal => meal.bookingId !== bookingId);
            if (day.meals.length < originalLength) {
              mealRemoved = true;
            }
          }
        });
      }
    });
    
    if (mealRemoved) {
      localStorage.setItem('user_itineraries', JSON.stringify(itineraries));
    }
    
    return mealRemoved;
  } catch (error) {
    console.error('Error removing meal from itinerary:', error);
    return false;
  }
};

/**
 * Find the best matching day for a meal based on date
 */
export const findBestDayForMeal = (itinerary, mealDate) => {
  if (!itinerary.days || itinerary.days.length === 0) {
    return null;
  }
  
  const targetDate = new Date(mealDate);
  
  // Find exact date match first
  const exactMatch = itinerary.days.find(day => {
    const dayDate = new Date(day.date);
    return dayDate.toDateString() === targetDate.toDateString();
  });
  
  if (exactMatch) {
    return exactMatch;
  }
  
  // Find closest date if no exact match
  const sortedDays = [...itinerary.days].sort((a, b) => {
    const aDiff = Math.abs(new Date(a.date) - targetDate);
    const bDiff = Math.abs(new Date(b.date) - targetDate);
    return aDiff - bDiff;
  });
  
  return sortedDays[0];
};

/**
 * Get meal statistics for an itinerary
 */
export const getMealStatistics = (itinerary) => {
  if (!itinerary.days) {
    return {
      totalMeals: 0,
      mealTypes: { breakfast: 0, lunch: 0, dinner: 0 },
      averageCostPerMeal: 0,
      topCuisines: []
    };
  }
  
  let totalMeals = 0;
  let totalCost = 0;
  const mealTypes = { breakfast: 0, lunch: 0, dinner: 0 };
  const cuisines = {};
  
  itinerary.days.forEach(day => {
    if (day.meals) {
      day.meals.forEach(meal => {
        totalMeals++;
        
        // Count meal types
        if (mealTypes.hasOwnProperty(meal.type)) {
          mealTypes[meal.type]++;
        }
        
        // Count cuisines
        if (meal.cuisine) {
          cuisines[meal.cuisine] = (cuisines[meal.cuisine] || 0) + 1;
        }
        
        // Sum costs (convert price range to approximate cost)
        if (meal.priceRange) {
          const cost = priceRangeToNumber(meal.priceRange);
          totalCost += cost;
        }
      });
    }
  });
  
  const topCuisines = Object.entries(cuisines)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([cuisine, count]) => ({ cuisine, count }));
  
  return {
    totalMeals,
    mealTypes,
    averageCostPerMeal: totalMeals > 0 ? Math.round(totalCost / totalMeals) : 0,
    topCuisines
  };
};

/**
 * Convert price range symbol to approximate number for calculations
 */
const priceRangeToNumber = (priceRange) => {
  switch (priceRange) {
    case '$': return 10;
    case '$$': return 25;
    case '$$$': return 45;
    case '$$$$': return 80;
    default: return 0;
  }
};