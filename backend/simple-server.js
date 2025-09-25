const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// In-memory storage for demo purposes
let demoUsers = {};
let demoItineraries = [];
let itineraryIdCounter = 1;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://192.168.1.95:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple test route
app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  console.log('Root route requested');
  res.json({ 
    message: 'Travel Planner API - Simple Version',
    version: '1.0.0',
    status: 'running'
  });
});

// Basic auth routes without database for testing
app.post('/api/auth/register', (req, res) => {
  console.log('Register request:', req.body);
  
  const userId = 'user-' + Date.now();
  const user = {
    id: userId,
    email: req.body.email,
    name: req.body.name || 'User',
    createdAt: new Date().toISOString()
  };
  
  // Store user in memory
  demoUsers[userId] = user;
  
  res.status(201).json({
    message: 'User created successfully (demo)',
    token: `demo-token-${userId}`,
    user: user
  });
});

app.post('/api/auth/login', (req, res) => {
  console.log('Login request:', req.body);
  
  // Find existing user or create demo user
  let user = Object.values(demoUsers).find(u => u.email === req.body.email);
  if (!user) {
    const userId = 'user-' + Date.now();
    user = {
      id: userId,
      email: req.body.email,
      name: 'Demo User',
      createdAt: new Date().toISOString()
    };
    demoUsers[userId] = user;
  }
  
  res.json({
    message: 'Login successful (demo)',
    token: `demo-token-${user.id}`,
    user: user
  });
});

// Helper function to extract user ID from token
function getUserIdFromToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer demo-token-')) {
    return authHeader.replace('Bearer demo-token-', '');
  }
  return 'user-default'; // Fallback for demo
}

// Basic itinerary routes
app.get('/api/itineraries', (req, res) => {
  console.log('Get itineraries request');
  
  const userId = getUserIdFromToken(req);
  console.log('Getting itineraries for user:', userId);
  
  // Filter itineraries for the current user
  const userItineraries = demoItineraries.filter(itinerary => itinerary.userId === userId);
  
  console.log('Found itineraries:', userItineraries.length);
  res.json(userItineraries);
});

app.post('/api/itineraries', (req, res) => {
  console.log('Create itinerary request:', req.body);
  
  const userId = getUserIdFromToken(req);
  const itineraryId = 'itinerary-' + itineraryIdCounter++;
  
  const newItinerary = {
    id: itineraryId,
    title: req.body.title,
    description: req.body.description || '',
    destination: req.body.destination,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: userId,
    user: demoUsers[userId] || { id: userId, name: 'Demo User' },
    days: [],
    reservations: [],
    packingList: null
  };
  
  // Store in memory
  demoItineraries.push(newItinerary);
  
  console.log('Created itinerary:', newItinerary.id, 'for user:', userId);
  console.log('Total itineraries:', demoItineraries.length);
  
  res.status(201).json(newItinerary);
});

// Get individual itinerary
app.get('/api/itineraries/:id', (req, res) => {
  console.log('Get individual itinerary request:', req.params.id);
  
  const userId = getUserIdFromToken(req);
  const itineraryId = req.params.id;
  
  // Find itinerary that belongs to this user
  const itinerary = demoItineraries.find(it => it.id === itineraryId && it.userId === userId);
  
  if (!itinerary) {
    console.log('Itinerary not found:', itineraryId, 'for user:', userId);
    return res.status(404).json({ error: 'Itinerary not found' });
  }
  
  console.log('Found itinerary:', itinerary.title);
  res.json(itinerary);
});

// Generate AI suggestions for itinerary (demo mode)
app.post('/api/itineraries/:id/generate-suggestions', (req, res) => {
  console.log('Generate suggestions request:', req.params.id);
  
  const userId = getUserIdFromToken(req);
  const itineraryId = req.params.id;
  
  // Find itinerary that belongs to this user
  const itinerary = demoItineraries.find(it => it.id === itineraryId && it.userId === userId);
  
  if (!itinerary) {
    return res.status(404).json({ error: 'Itinerary not found' });
  }
  
  // Generate demo suggestions
  const startDate = new Date(itinerary.startDate);
  const endDate = new Date(itinerary.endDate);
  const dayCount = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
  
  const demoActivities = [
    { name: 'Visit Local Museum', description: 'Explore the cultural heritage', time: '10:00 AM', location: 'Downtown' },
    { name: 'Lunch at Local Restaurant', description: 'Try authentic local cuisine', time: '12:30 PM', location: 'City Center' },
    { name: 'Walking Tour', description: 'Discover hidden gems', time: '2:00 PM', location: 'Historic District' },
    { name: 'Sunset Viewpoint', description: 'Perfect photo opportunity', time: '6:00 PM', location: 'Hill Top' },
    { name: 'Shopping District', description: 'Browse local markets', time: '3:30 PM', location: 'Market Square' },
    { name: 'Coffee Break', description: 'Relax at a cozy cafe', time: '4:00 PM', location: 'Arts Quarter' }
  ];
  
  // Generate days with activities
  const generatedDays = [];
  for (let i = 0; i < dayCount; i++) {
    const dayDate = new Date(startDate);
    dayDate.setDate(startDate.getDate() + i);
    
    const dayActivities = demoActivities.slice(i % 3, (i % 3) + 3); // Rotate activities
    
    generatedDays.push({
      id: `day-${itineraryId}-${i + 1}`,
      date: dayDate.toISOString().split('T')[0],
      dayNumber: i + 1,
      activities: dayActivities,
      notes: `Demo day ${i + 1} activities for ${itinerary.destination}`
    });
  }
  
  // Update itinerary with generated days
  itinerary.days = generatedDays;
  itinerary.updatedAt = new Date().toISOString();
  
  console.log('Generated', generatedDays.length, 'days of suggestions');
  
  res.json({
    message: 'Demo suggestions generated successfully',
    mockData: true,
    days: generatedDays
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  console.log('404:', req.originalUrl);
  res.status(404).json({ error: 'Route not found' });
});

// Start server with error handling
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Simple Travel Planner API running on:`);
  console.log(`   Local: http://localhost:${PORT}`);
  console.log(`   Network: http://192.168.1.95:${PORT}`);
  console.log(`   Time: ${new Date().toLocaleString()}`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

// Keep alive
setInterval(() => {
  console.log(`[${new Date().toLocaleTimeString()}] Server heartbeat - still running`);
}, 30000);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT. Gracefully shutting down...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM. Gracefully shutting down...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

console.log('Simple server script loaded successfully');