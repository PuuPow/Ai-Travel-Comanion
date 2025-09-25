const express = require('express');
const prisma = require('../prismaClient');

const router = express.Router();

// GET all reservations for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { itineraryId } = req.query;
    
    const whereClause = { userId };
    if (itineraryId) {
      whereClause.itineraryId = itineraryId;
    }

    const reservations = await prisma.reservation.findMany({
      where: whereClause,
      include: {
        itinerary: {
          select: { id: true, title: true, destination: true }
        }
      },
      orderBy: { date: 'asc' }
    });

    res.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
});

// GET specific reservation by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        itinerary: {
          select: { id: true, title: true, destination: true }
        },
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    res.json(reservation);
  } catch (error) {
    console.error('Error fetching reservation:', error);
    res.status(500).json({ error: 'Failed to fetch reservation' });
  }
});

// POST create new reservation
router.post('/', async (req, res) => {
  try {
    const { 
      type, 
      title, 
      description, 
      date, 
      time, 
      confirmationNumber, 
      cost, 
      location, 
      userId, 
      itineraryId 
    } = req.body;
    
    if (!type || !title || !date || !userId) {
      return res.status(400).json({ 
        error: 'Missing required fields: type, title, date, userId' 
      });
    }

    const reservation = await prisma.reservation.create({
      data: {
        type,
        title,
        description,
        date: new Date(date),
        time,
        confirmationNumber,
        cost: cost ? parseFloat(cost) : null,
        location,
        userId,
        itineraryId: itineraryId || null
      },
      include: {
        itinerary: {
          select: { id: true, title: true, destination: true }
        }
      }
    });

    res.status(201).json(reservation);
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({ error: 'Failed to create reservation' });
  }
});

// PUT update reservation
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      type, 
      title, 
      description, 
      date, 
      time, 
      confirmationNumber, 
      cost, 
      location, 
      itineraryId 
    } = req.body;
    
    const updateData = {};
    if (type) updateData.type = type;
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (date) updateData.date = new Date(date);
    if (time !== undefined) updateData.time = time;
    if (confirmationNumber !== undefined) updateData.confirmationNumber = confirmationNumber;
    if (cost !== undefined) updateData.cost = cost ? parseFloat(cost) : null;
    if (location !== undefined) updateData.location = location;
    if (itineraryId !== undefined) updateData.itineraryId = itineraryId;

    const reservation = await prisma.reservation.update({
      where: { id },
      data: updateData,
      include: {
        itinerary: {
          select: { id: true, title: true, destination: true }
        }
      }
    });

    res.json(reservation);
  } catch (error) {
    console.error('Error updating reservation:', error);
    res.status(500).json({ error: 'Failed to update reservation' });
  }
});

// DELETE reservation
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.reservation.delete({
      where: { id }
    });

    res.json({ message: 'Reservation deleted successfully' });
  } catch (error) {
    console.error('Error deleting reservation:', error);
    res.status(500).json({ error: 'Failed to delete reservation' });
  }
});

// GET reservations by type
router.get('/user/:userId/type/:type', async (req, res) => {
  try {
    const { userId, type } = req.params;
    
    const reservations = await prisma.reservation.findMany({
      where: { 
        userId, 
        type: type.toLowerCase() 
      },
      include: {
        itinerary: {
          select: { id: true, title: true, destination: true }
        }
      },
      orderBy: { date: 'asc' }
    });

    res.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations by type:', error);
    res.status(500).json({ error: 'Failed to fetch reservations by type' });
  }
});

// GET upcoming reservations for user
router.get('/user/:userId/upcoming', async (req, res) => {
  try {
    const { userId } = req.params;
    const now = new Date();
    
    const reservations = await prisma.reservation.findMany({
      where: { 
        userId,
        date: {
          gte: now
        }
      },
      include: {
        itinerary: {
          select: { id: true, title: true, destination: true }
        }
      },
      orderBy: { date: 'asc' },
      take: 10
    });

    res.json(reservations);
  } catch (error) {
    console.error('Error fetching upcoming reservations:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming reservations' });
  }
});

module.exports = router;