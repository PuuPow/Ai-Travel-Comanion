const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// Initialize Prisma Client
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000', 
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

// Use modular routes with Google Places integration
const authRoutes = require('./routes/auth');
const itineraryRoutes = require('./routes/itineraries');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/itineraries', itineraryRoutes);
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
    message: 'Travel Planner API - Production Ready',
    version: '2.0.0',
    features: [
      'User Authentication',
      'Itinerary Management', 
      'Reservation Tracking',
      'Smart Packing Lists',
      'AI Travel Suggestions',
      'Data Export/Import'
    ],
    endpoints: [
      '/api/auth',
      '/api/itineraries',
      '/api/reservations',
      '/api/packing',
      '/health'
    ]
  });
});



// Use modular routes instead of inline definitions
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
  console.log(`\n🚀 Travel Planner API - Production Ready`);
  console.log(`   Local: http://localhost:${PORT}`);
  console.log(`   Network: http://192.168.1.95:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Database: ${process.env.DATABASE_URL ? 'External' : 'SQLite (dev)'}`);
  console.log(`   Time: ${new Date().toLocaleString()}\n`);
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
});

module.exports = app;