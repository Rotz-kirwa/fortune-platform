// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// DB
const { connectDB } = require('./config/db');

// routes
const ordersRouter = require('./routes/orders');
const paymentsRouter = require('./routes/payments');
const userRouter = require('./routes/users');
const investmentRouter = require('./routes/investments');

const app = express();

// middleware
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://127.0.0.1:3000',
    'https://fortune-platform-two.vercel.app',
    'https://fortune-platform-git-main-eliuds-projects-ebf8c589.vercel.app',
    'https://fortune-platform-1.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    ok: true, 
    time: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// app routes
app.use('/api/orders', ordersRouter);
app.use('/api/pay', paymentsRouter);
app.use('/api/users', userRouter);
app.use('/api/investments', investmentRouter);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// start server
const port = process.env.PORT || 4000;

async function startServer() {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
      console.log(`📊 Health check: http://localhost:${port}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
