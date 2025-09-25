const express = require('express');
const prisma = require('../prismaClient');
const { generatePackingListSuggestions } = require('../services/llmService');

const router = express.Router();

// GET packing list for itinerary
router.get('/itinerary/:itineraryId', async (req, res) => {
  try {
    const { itineraryId } = req.params;
    
    const packingList = await prisma.packingList.findUnique({
      where: { itineraryId },
      include: {
        itinerary: {
          select: { title: true, destination: true, startDate: true, endDate: true }
        }
      }
    });

    res.json(packingList);
  } catch (error) {
    console.error('Error fetching packing list:', error);
    res.status(500).json({ error: 'Failed to fetch packing list' });
  }
});

// POST create or update packing list
router.post('/itinerary/:itineraryId', async (req, res) => {
  try {
    const { itineraryId } = req.params;
    const { items, userId } = req.body;

    if (!items) {
      return res.status(400).json({ error: 'items is required' });
    }

    // Create or find demo user if no userId provided
    let actualUserId = userId;
    if (!actualUserId) {
      let demoUser = await prisma.user.findFirst({
        where: { email: 'demo@travelplanner.com' }
      });
      if (!demoUser) {
        demoUser = await prisma.user.create({
          data: {
            email: 'demo@travelplanner.com',
            name: 'Demo User'
          }
        });
      }
      actualUserId = demoUser.id;
    }

    // Check if packing list already exists
    const existingList = await prisma.packingList.findUnique({
      where: { itineraryId }
    });

    let packingList;
    if (existingList) {
      // Update existing packing list
      packingList = await prisma.packingList.update({
        where: { itineraryId },
        data: { items: JSON.stringify(items) },
        include: {
          itinerary: {
            select: { title: true, destination: true, startDate: true, endDate: true }
          }
        }
      });
    } else {
      // Create new packing list
      packingList = await prisma.packingList.create({
        data: {
          items: JSON.stringify(items),
          userId: actualUserId,
          itineraryId
        },
        include: {
          itinerary: {
            select: { title: true, destination: true, startDate: true, endDate: true }
          }
        }
      });
    }

    res.json(packingList);
  } catch (error) {
    console.error('Error creating/updating packing list:', error);
    res.status(500).json({ error: 'Failed to create/update packing list' });
  }
});

// PUT update packing list items
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { items } = req.body;

    if (!items) {
      return res.status(400).json({ error: 'items is required' });
    }

    const packingList = await prisma.packingList.update({
      where: { id },
      data: { items },
      include: {
        itinerary: {
          select: { title: true, destination: true, startDate: true, endDate: true }
        }
      }
    });

    res.json(packingList);
  } catch (error) {
    console.error('Error updating packing list:', error);
    res.status(500).json({ error: 'Failed to update packing list' });
  }
});

// DELETE packing list
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.packingList.delete({
      where: { id }
    });

    res.json({ message: 'Packing list deleted successfully' });
  } catch (error) {
    console.error('Error deleting packing list:', error);
    res.status(500).json({ error: 'Failed to delete packing list' });
  }
});

// POST generate AI packing suggestions
router.post('/generate-suggestions/:itineraryId', async (req, res) => {
  try {
    const { itineraryId } = req.params;
    const { preferences } = req.body;

    const itinerary = await prisma.itinerary.findUnique({
      where: { id: itineraryId },
      include: { days: true }
    });

    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }

    const suggestions = await generatePackingListSuggestions(itinerary, preferences);
    
    res.json({ suggestions });
  } catch (error) {
    console.error('Error generating packing suggestions:', error);
    res.status(500).json({ error: 'Failed to generate packing suggestions' });
  }
});

// GET all packing lists for user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const packingLists = await prisma.packingList.findMany({
      where: { userId },
      include: {
        itinerary: {
          select: { id: true, title: true, destination: true, startDate: true, endDate: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(packingLists);
  } catch (error) {
    console.error('Error fetching packing lists:', error);
    res.status(500).json({ error: 'Failed to fetch packing lists' });
  }
});

module.exports = router;