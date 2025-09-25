const express = require('express');
const prisma = require('../prismaClient');
const { generateItinerarySuggestions, generateSingleDaySuggestions } = require('../services/llmService');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET all itineraries for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const itineraries = await prisma.itinerary.findMany({
      where: {
        userId: req.user.id
      },
      include: {
        days: {
          orderBy: { dayNumber: 'asc' }
        },
        reservations: true,
        packingList: true,
        user: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Parse JSON strings for frontend
    const processedItineraries = itineraries.map(itinerary => ({
      ...itinerary,
      vacationStyle: itinerary.vacationStyle ? JSON.parse(itinerary.vacationStyle) : null,
      days: itinerary.days.map(day => {
        let parsedData = { activities: [], meals: [] };
        if (day.activities) {
          try {
            const parsed = JSON.parse(day.activities);
            // Handle both old format (just activities) and new format (activities + meals)
            if (Array.isArray(parsed)) {
              parsedData.activities = parsed;
            } else if (parsed.activities) {
              parsedData.activities = parsed.activities || [];
              parsedData.meals = parsed.meals || [];
            }
          } catch (e) {
            console.error('Error parsing day activities:', e);
          }
        }
        return {
          ...day,
          activities: parsedData.activities,
          meals: parsedData.meals
        };
      }),
      packingList: itinerary.packingList ? {
        ...itinerary.packingList,
        items: itinerary.packingList.items ? JSON.parse(itinerary.packingList.items) : []
      } : null
    }));

    res.json(processedItineraries);
  } catch (error) {
    console.error('Error fetching itineraries:', error);
    res.status(500).json({ error: 'Failed to fetch itineraries' });
  }
});

// GET specific itinerary by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const itinerary = await prisma.itinerary.findUnique({
      where: { 
        id,
        userId: req.user.id // Ensure user can only access their own itineraries
      },
      include: {
        days: { orderBy: { dayNumber: 'asc' } },
        reservations: { orderBy: { date: 'asc' } },
        packingList: true,
        user: { select: { id: true, name: true, email: true } }
      }
    });

    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }

    // Parse JSON strings for frontend (same logic as list endpoint)
    const processedItinerary = {
      ...itinerary,
      vacationStyle: itinerary.vacationStyle ? JSON.parse(itinerary.vacationStyle) : null,
      days: itinerary.days.map(day => {
        let parsedData = { activities: [], meals: [] };
        if (day.activities) {
          try {
            const parsed = JSON.parse(day.activities);
            // Handle both old format (just activities) and new format (activities + meals)
            if (Array.isArray(parsed)) {
              parsedData.activities = parsed;
            } else if (parsed.activities) {
              parsedData.activities = parsed.activities || [];
              parsedData.meals = parsed.meals || [];
            }
          } catch (e) {
            console.error('Error parsing day activities:', e);
          }
        }
        return {
          ...day,
          activities: parsedData.activities,
          meals: parsedData.meals
        };
      })
    };

    res.json(processedItinerary);
  } catch (error) {
    console.error('Error fetching itinerary:', error);
    res.status(500).json({ error: 'Failed to fetch itinerary' });
  }
});

// POST create new itinerary
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, startDate, endDate, destination, vacationStyle } = req.body;
    
    if (!title || !startDate || !endDate || !destination) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, startDate, endDate, destination' 
      });
    }

    const itinerary = await prisma.itinerary.create({
      data: {
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        destination,
        vacationStyle: vacationStyle ? JSON.stringify(vacationStyle) : null,
        userId: req.user.id
      },
      include: {
        days: {
          orderBy: { dayNumber: 'asc' }
        },
        reservations: true,
        packingList: true,
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // Parse JSON strings for frontend (same logic as other endpoints)
    const processedItinerary = {
      ...itinerary,
      vacationStyle: itinerary.vacationStyle ? JSON.parse(itinerary.vacationStyle) : null,
      days: itinerary.days.map(day => {
        let parsedData = { activities: [], meals: [] };
        if (day.activities) {
          try {
            const parsed = JSON.parse(day.activities);
            // Handle both old format (just activities) and new format (activities + meals)
            if (Array.isArray(parsed)) {
              parsedData.activities = parsed;
            } else if (parsed.activities) {
              parsedData.activities = parsed.activities || [];
              parsedData.meals = parsed.meals || [];
            }
          } catch (e) {
            console.error('Error parsing day activities:', e);
          }
        }
        return {
          ...day,
          activities: parsedData.activities,
          meals: parsedData.meals
        };
      }),
      packingList: itinerary.packingList ? {
        ...itinerary.packingList,
        items: itinerary.packingList.items ? JSON.parse(itinerary.packingList.items) : []
      } : null
    };

    res.status(201).json(processedItinerary);
  } catch (error) {
    console.error('Error creating itinerary:', error);
    res.status(500).json({ error: 'Failed to create itinerary' });
  }
});

// PUT update itinerary
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, startDate, endDate, destination } = req.body;
    
    const itinerary = await prisma.itinerary.update({
      where: { 
        id,
        userId: req.user.id // Ensure user can only update their own itineraries
      },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(destination && { destination })
      },
      include: {
        days: { orderBy: { dayNumber: 'asc' } },
        reservations: true,
        packingList: true
      }
    });

    res.json(itinerary);
  } catch (error) {
    console.error('Error updating itinerary:', error);
    res.status(500).json({ error: 'Failed to update itinerary' });
  }
});

// DELETE itinerary
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.itinerary.delete({
      where: { 
        id,
        userId: req.user.id // Ensure user can only delete their own itineraries
      }
    });

    res.json({ message: 'Itinerary deleted successfully' });
  } catch (error) {
    console.error('Error deleting itinerary:', error);
    res.status(500).json({ error: 'Failed to delete itinerary' });
  }
});

// POST generate AI suggestions for itinerary
router.post('/:id/generate-suggestions', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { preferences } = req.body;

    const itinerary = await prisma.itinerary.findUnique({
      where: { 
        id,
        userId: req.user.id // Ensure user can only generate suggestions for their own itineraries
      },
      include: { days: true }
    });

    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }

    // Combine request preferences with stored vacation style
    const combinedPreferences = {
      ...preferences,
      vacationStyle: itinerary.vacationStyle ? JSON.parse(itinerary.vacationStyle) : preferences.vacationStyle
    };
    
    const suggestions = await generateItinerarySuggestions(itinerary, combinedPreferences);
    
    // Save the generated days to the database if they exist
    if (suggestions.days && !suggestions.error) {
      // Delete existing days first
      await prisma.day.deleteMany({
        where: { itineraryId: id }
      });
      
      // Create new days with JSON.stringify for activities and meals
      for (const dayData of suggestions.days) {
        await prisma.day.create({
          data: {
            itineraryId: id,
            date: new Date(dayData.date),
            dayNumber: dayData.dayNumber,
            activities: JSON.stringify({
              activities: dayData.activities || [],
              meals: dayData.meals || []
            }),
            notes: dayData.notes || ''
          }
        });
      }
    }
    
    // Add additional response data for frontend
    const response = {
      ...suggestions,
      daysCreated: suggestions.days ? suggestions.days.length : 0,
      success: true
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error generating suggestions:', error);
    res.status(500).json({ error: 'Failed to generate suggestions' });
  }
});

// POST generate AI suggestions for a single day
router.post('/:id/days/:dayId/generate-suggestions', authenticateToken, async (req, res) => {
  try {
    const { id, dayId } = req.params;
    const { preferences } = req.body;

    // Get the itinerary and ALL days to avoid duplicates
    const itinerary = await prisma.itinerary.findUnique({
      where: { 
        id,
        userId: req.user.id
      },
      include: { 
        days: {
          orderBy: { dayNumber: 'asc' }
        }
      }
    });

    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }

    const day = itinerary.days.find(d => d.id === dayId);
    if (!day) {
      return res.status(404).json({ error: 'Day not found' });
    }
    
    // Get all other days to avoid duplicates
    const existingDays = itinerary.days.filter(d => d.id !== dayId);

    // Combine request preferences with stored vacation style
    const combinedPreferences = {
      ...preferences,
      vacationStyle: itinerary.vacationStyle ? JSON.parse(itinerary.vacationStyle) : preferences.vacationStyle
    };
    
    // Generate single day suggestions with existing days to avoid duplicates
    const suggestions = await generateSingleDaySuggestions(itinerary, day, combinedPreferences, existingDays);
    
    // Update the specific day with new suggestions
    if (suggestions.activities || suggestions.meals) {
      await prisma.day.update({
        where: { id: dayId },
        data: {
          activities: JSON.stringify({
            activities: suggestions.activities || [],
            meals: suggestions.meals || []
          }),
          notes: suggestions.notes || day.notes
        }
      });
    }
    
    res.json({
      success: true,
      activities: suggestions.activities || [],
      meals: suggestions.meals || [],
      notes: suggestions.notes || '',
      message: 'Single day suggestions generated successfully'
    });
  } catch (error) {
    console.error('Error generating single day suggestions:', error);
    res.status(500).json({ error: 'Failed to generate day suggestions' });
  }
});

module.exports = router;
