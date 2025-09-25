import jwt from 'jsonwebtoken';

// Simple in-memory itinerary store (for demo purposes)
let itineraries = [];

// Middleware to verify JWT token
function verifyToken(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    return decoded.userId;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  const userId = verifyToken(req);
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    // Get all itineraries for the user
    const userItineraries = itineraries.filter(it => it.userId === userId);
    return res.json(userItineraries);
  }

  if (req.method === 'POST') {
    try {
      const { title, description, startDate, endDate, destination, vacationStyle } = req.body;

      // Validation
      if (!title || !startDate || !endDate || !destination) {
        return res.status(400).json({ 
          error: 'Title, start date, end date, and destination are required' 
        });
      }

      // Create new itinerary
      const newItinerary = {
        id: Date.now().toString(),
        title,
        description: description || '',
        startDate,
        endDate,
        destination,
        vacationStyle: vacationStyle || '{}',
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        days: []
      };

      itineraries.push(newItinerary);

      return res.status(201).json(newItinerary);
    } catch (error) {
      console.error('Create itinerary error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}