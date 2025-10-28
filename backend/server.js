// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// DB
const { connectDB } = require('./config/db');

// routes
const ordersRouter = require('./routes/orders');
const paymentsRouter = require('./routes/payments');
const userRouter = require('./routes/users');
const investmentRouter = require('./routes/investments');
const adminRouter = require('./routes/admin');

const app = express();

// Security & Performance middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
app.use('/api/', limiter);

// Security middleware
// Security middleware - inline implementation

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
  allowedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

// Apply security middleware
// Inline security middleware
app.use('/api/', (req, res, next) => {
  // Basic input sanitization
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].replace(/[<>'"]/g, '');
      }
    }
  }
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Handle preflight requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

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
app.use('/api/payments', paymentsRouter);
app.use('/api/pay', paymentsRouter); // Add /api/pay route for frontend compatibility
app.use('/api/users', userRouter);
app.use('/api/investments', investmentRouter);
app.use('/api/admin', adminRouter);

// Add manual returns calculation endpoint
app.post('/api/admin/calculate-returns', async (req, res) => {
  try {
    console.log('🔄 Manual returns calculation triggered via API...');
    
    // Use the automated service for consistency
    await AutomatedReturnsService.triggerManualCalculation();
    
    res.json({ 
      success: true, 
      message: 'Daily returns calculation completed successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in manual returns calculation:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Test environment endpoint
const testEnvRouter = require('./routes/test-env');
app.use('/api/payments', testEnvRouter);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Automated returns service
const AutomatedReturnsService = require('./services/AutomatedReturnsService');

// start server
const port = process.env.PORT || 4000;

async function startServer() {
  try {
    await connectDB();
    
    // Initialize database schema
    await initializeDatabase();
    
    // Start automated daily returns service
    AutomatedReturnsService.startAutomatedReturns();
    
    app.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
      console.log(`📊 Health check: http://localhost:${port}/api/health`);
      console.log(`⏰ Automated returns service active - runs daily at midnight`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

async function initializeDatabase() {
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/fortune_investment'
  });
  
  const client = await pool.connect();
  
  try {
    console.log('🔄 Initializing database schema...');
    
    // Add missing columns to investments table
    const alterQueries = [
      `ALTER TABLE investments ADD COLUMN IF NOT EXISTS current_return DECIMAL(15,2) DEFAULT 0.00`,
      `ALTER TABLE investments ADD COLUMN IF NOT EXISTS current_value DECIMAL(15,2) DEFAULT 0.00`,
      `ALTER TABLE investments ADD COLUMN IF NOT EXISTS progress DECIMAL(5,2) DEFAULT 0.00`,
      `ALTER TABLE investments ADD COLUMN IF NOT EXISTS days_passed INTEGER DEFAULT 0`,
      `ALTER TABLE investments ADD COLUMN IF NOT EXISTS plan_id INTEGER`,
      `ALTER TABLE investments ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active'`,
      `ALTER TABLE investments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()`
    ];
    
    for (const query of alterQueries) {
      try {
        await client.query(query);
      } catch (error) {
        if (error.code !== '42701') { // Ignore 'column already exists' errors
          console.error('Schema update error:', error.message);
        }
      }
    }
    
    // Update existing investments
    await client.query(`
      UPDATE investments 
      SET status = COALESCE(status, 'active'),
          current_value = COALESCE(current_value, amount),
          updated_at = COALESCE(updated_at, NOW())
      WHERE status IS NULL OR current_value IS NULL
    `);
    
    console.log('✅ Database schema initialized');
    
  } catch (error) {
    console.error('❌ Database initialization error:', error);
  } finally {
    client.release();
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
