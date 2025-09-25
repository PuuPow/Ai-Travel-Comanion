const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Prisma Client
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://192.168.1.2:3000',
    'http://192.168.1.58:3000',
    'http://192.168.1.95:3000',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      database: 'connected',
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Travel Planner API - Production Ready with Google Places Integration',
    version: '2.1.0',
    features: [
      'User Authentication',
      'Itinerary Management', 
      'Google Places Integration',
      'Real Restaurant Suggestions',
      'Live Location Data',
      'AI Travel Suggestions'
    ],
    endpoints: [
      '/api/auth',
      '/api/itineraries',
      '/health'
    ]
  });
});

// Use modular routes with Google Places integration
const authRoutes = require('./routes/auth');
const itineraryRoutes = require('./routes/itineraries');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/itineraries', itineraryRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
  
  try {
    await prisma.$disconnect();
    console.log('✅ Database disconnected');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Travel Planner API - With Google Places Integration`);
  console.log(`   Local: http://localhost:${PORT}`);
  console.log(`   Network: http://192.168.1.2:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Database: ${process.env.DATABASE_URL ? 'External' : 'SQLite (dev)'}`);
  console.log(`   Google Places API: ${process.env.GOOGLE_PLACES_API_KEY ? 'Configured' : 'Not configured'}`);
  console.log(`   Time: ${new Date().toLocaleString()}\n`);
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
});

module.exports = app;