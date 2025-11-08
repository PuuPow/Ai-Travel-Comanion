const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();

// Initialize Prisma Client for serverless
let prisma;

// Singleton pattern for Prisma client in serverless environment
const getPrismaClient = () => {
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });
  }
  return prisma;
};

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://192.168.1.2:3000',
    'http://192.168.1.95:3000',
    process.env.FRONTEND_URL,
    // Add Vercel frontend domains
    /^https:\/\/.*\.vercel\.app$/,
    /^https:\/\/travel-planner.*\.vercel\.app$/
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
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      database: 'not-tested',
      environment: process.env.NODE_ENV || 'production',
      deployment: 'vercel-serverless'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      timestamp: new Date().toISOString(),
      error: error.message,
      deployment: 'vercel-serverless'
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Travel Planner API - Production Ready with Google Places Integration (Vercel Serverless)',
    version: '2.1.0',
    deployment: 'vercel-serverless',
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
const authRoutes = require('../src/routes/auth');
const itineraryRoutes = require('../src/routes/itineraries');
const mealsRoutes = require('../src/routes/meals');
const shareRoutes = require('../src/routes/share');
const paymentRoutes = require('../src/routes/payments');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/itineraries', itineraryRoutes);
app.use('/api/meals', mealsRoutes);
app.use('/api/share', shareRoutes);
app.use('/api/payments', paymentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    deployment: 'vercel-serverless'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found', 
    deployment: 'vercel-serverless'
  });
});

// Export for Vercel serverless function
module.exports = app;