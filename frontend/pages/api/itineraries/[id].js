import jwt from 'jsonwebtoken';

// Simple in-memory itinerary store (shared with index.js)
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
  const { id } = req.query;
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    // Get specific itinerary
    const itinerary = itineraries.find(it => it.id === id && it.userId === userId);
    
    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }
    
    return res.json(itinerary);
  }

  if (req.method === 'PUT') {
    try {
      const { title, description, startDate, endDate, destination, vacationStyle, days } = req.body;
      
      const itineraryIndex = itineraries.findIndex(it => it.id === id && it.userId === userId);
      
      if (itineraryIndex === -1) {
        return res.status(404).json({ error: 'Itinerary not found' });
      }

      // Update itinerary
      itineraries[itineraryIndex] = {
        ...itineraries[itineraryIndex],
        title: title || itineraries[itineraryIndex].title,
        description: description !== undefined ? description : itineraries[itineraryIndex].description,
        startDate: startDate || itineraries[itineraryIndex].startDate,
        endDate: endDate || itineraries[itineraryIndex].endDate,
        destination: destination || itineraries[itineraryIndex].destination,
        vacationStyle: vacationStyle || itineraries[itineraryIndex].vacationStyle,
        days: days || itineraries[itineraryIndex].days,
        updatedAt: new Date().toISOString()
      };

      return res.json(itineraries[itineraryIndex]);
    } catch (error) {
      console.error('Update itinerary error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'DELETE') {
    const itineraryIndex = itineraries.findIndex(it => it.id === id && it.userId === userId);
    
    if (itineraryIndex === -1) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }

    itineraries.splice(itineraryIndex, 1);
    return res.json({ message: 'Itinerary deleted successfully' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}