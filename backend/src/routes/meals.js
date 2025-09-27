const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get AI meal suggestions for a specific day
router.post('/suggestions', authenticateToken, async (req, res) => {
  try {
    const { destination, date, vacationStyle, dietaryRestrictions, budget } = req.body;
    
    console.log('Generating meal suggestions for:', {
      destination,
      date,
      vacationStyle,
      dietaryRestrictions,
      budget
    });

    // For now, we'll create a simple suggestion system
    // In the future, this can be enhanced with OpenAI integration
    const suggestions = generateMealSuggestions(destination, vacationStyle, dietaryRestrictions, budget);
    
    res.json({
      success: true,
      suggestions: suggestions,
      destination,
      date
    });
    
  } catch (error) {
    console.error('Error generating meal suggestions:', error);
    res.status(500).json({ 
      error: 'Failed to generate meal suggestions',
      message: error.message 
    });
  }
});

// Update meal recommendations for a specific day
router.put('/day/:dayId', authenticateToken, async (req, res) => {
  try {
    const { dayId } = req.params;
    const { meals } = req.body;
    const userId = req.user.id;

    // First verify that the day belongs to the user
    const day = await prisma.day.findFirst({
      where: {
        id: dayId,
        itinerary: {
          userId: userId
        }
      }
    });

    if (!day) {
      return res.status(404).json({ error: 'Day not found or access denied' });
    }

    // Update the meals for this day
    const updatedDay = await prisma.day.update({
      where: { id: dayId },
      data: {
        meals: JSON.stringify(meals)
      }
    });

    res.json({
      success: true,
      day: {
        ...updatedDay,
        meals: JSON.parse(updatedDay.meals || '{}')
      }
    });

  } catch (error) {
    console.error('Error updating day meals:', error);
    res.status(500).json({ 
      error: 'Failed to update meals',
      message: error.message 
    });
  }
});

// Simple meal suggestion generator (can be enhanced with AI later)
function generateMealSuggestions(destination, vacationStyle, dietaryRestrictions = [], budget = 'medium') {
  const cuisineTypes = getCuisineByDestination(destination);
  const suggestions = {
    breakfast: [],
    lunch: [],
    dinner: []
  };

  // Generate breakfast suggestions
  suggestions.breakfast = [
    {
      name: `Local ${cuisineTypes[0]} Breakfast`,
      type: 'restaurant',
      description: `Traditional breakfast featuring local ${cuisineTypes[0]} flavors`,
      estimatedCost: budget === 'low' ? '$10-15' : budget === 'high' ? '$25-35' : '$15-25',
      dietaryOptions: getDietaryOptions(dietaryRestrictions)
    },
    {
      name: 'Hotel/Accommodation Breakfast',
      type: 'hotel',
      description: 'Continental or local breakfast at your accommodation',
      estimatedCost: 'Included',
      dietaryOptions: getDietaryOptions(dietaryRestrictions)
    },
    {
      name: 'Café & Pastry Shop',
      type: 'cafe',
      description: 'Local coffee shop with fresh pastries and light breakfast',
      estimatedCost: budget === 'low' ? '$5-10' : budget === 'high' ? '$15-20' : '$8-15',
      dietaryOptions: getDietaryOptions(dietaryRestrictions)
    }
  ];

  // Generate lunch suggestions
  suggestions.lunch = [
    {
      name: `${cuisineTypes[0]} Street Food`,
      type: 'street_food',
      description: `Authentic local street food experience`,
      estimatedCost: budget === 'low' ? '$5-12' : budget === 'high' ? '$15-25' : '$8-18',
      dietaryOptions: getDietaryOptions(dietaryRestrictions)
    },
    {
      name: 'Local Market Food Court',
      type: 'market',
      description: 'Fresh, diverse options from local food vendors',
      estimatedCost: budget === 'low' ? '$8-15' : budget === 'high' ? '$20-30' : '$12-22',
      dietaryOptions: getDietaryOptions(dietaryRestrictions)
    },
    {
      name: `Traditional ${cuisineTypes[0]} Restaurant`,
      type: 'restaurant',
      description: `Mid-range local restaurant specializing in ${cuisineTypes[0]} cuisine`,
      estimatedCost: budget === 'low' ? '$15-25' : budget === 'high' ? '$35-50' : '$20-35',
      dietaryOptions: getDietaryOptions(dietaryRestrictions)
    }
  ];

  // Generate dinner suggestions
  suggestions.dinner = [
    {
      name: 'Fine Dining Experience',
      type: 'fine_dining',
      description: `Upscale restaurant featuring modern ${cuisineTypes[0]} cuisine`,
      estimatedCost: budget === 'low' ? '$30-45' : budget === 'high' ? '$80-120' : '$45-75',
      dietaryOptions: getDietaryOptions(dietaryRestrictions)
    },
    {
      name: 'Local Favorite Restaurant',
      type: 'local_favorite',
      description: 'Highly-rated restaurant popular with locals',
      estimatedCost: budget === 'low' ? '$20-30' : budget === 'high' ? '$50-70' : '$30-45',
      dietaryOptions: getDietaryOptions(dietaryRestrictions)
    },
    {
      name: 'Food & Culture Experience',
      type: 'cultural_dining',
      description: 'Dinner with cultural show or traditional setting',
      estimatedCost: budget === 'low' ? '$25-40' : budget === 'high' ? '$70-100' : '$40-65',
      dietaryOptions: getDietaryOptions(dietaryRestrictions)
    }
  ];

  return suggestions;
}

function getCuisineByDestination(destination) {
  const cuisineMap = {
    // Europe
    'paris': ['French', 'European'],
    'rome': ['Italian', 'Mediterranean'],
    'london': ['British', 'International'],
    'barcelona': ['Spanish', 'Catalonian'],
    'amsterdam': ['Dutch', 'European'],
    
    // Asia
    'tokyo': ['Japanese', 'Asian'],
    'bangkok': ['Thai', 'Asian'],
    'seoul': ['Korean', 'Asian'],
    'singapore': ['Singaporean', 'Asian'],
    'mumbai': ['Indian', 'South Asian'],
    
    // Americas
    'new york': ['American', 'International'],
    'mexico city': ['Mexican', 'Latin American'],
    'lima': ['Peruvian', 'South American'],
    'toronto': ['Canadian', 'International'],
    
    // Default
    'default': ['Local', 'International']
  };
  
  const destKey = destination.toLowerCase();
  return cuisineMap[destKey] || cuisineMap['default'];
}

function getDietaryOptions(restrictions = []) {
  const options = ['Regular'];
  if (restrictions.includes('vegetarian')) options.push('Vegetarian');
  if (restrictions.includes('vegan')) options.push('Vegan');
  if (restrictions.includes('gluten-free')) options.push('Gluten-Free');
  if (restrictions.includes('halal')) options.push('Halal');
  if (restrictions.includes('kosher')) options.push('Kosher');
  return options;
}

module.exports = router;