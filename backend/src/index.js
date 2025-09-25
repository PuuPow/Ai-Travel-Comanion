const express = require('express');
const cors = require('cors');
require('dotenv').config();

// const authRouter = require('./routes/auth');
// const itinerariesRouter = require('./routes/itineraries');
// const packingRouter = require('./routes/packing');
// const reservationsRouter = require('./routes/reservations');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
// app.use('/api/auth', authRouter);
// app.use('/api/itineraries', itinerariesRouter);
// app.use('/api/packing', packingRouter);
// app.use('/api/reservations', reservationsRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Default route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Travel Planner API',
    version: '1.0.0',
    endpoints: [
      '/api/auth',
      '/api/itineraries',
      '/api/packing', 
      '/api/reservations',
      '/health'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Travel Planner API running on http://0.0.0.0:${PORT}`);
  console.log(`Local access: http://localhost:${PORT}`);
  console.log(`Network access: http://192.168.1.95:${PORT}`);
});
