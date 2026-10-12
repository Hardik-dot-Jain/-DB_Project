const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { testConnection, closeDbPool } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { requireAuth } = require('./middleware/authMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const healthRoutes = require('./routes/healthRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reportsRoutes = require('./routes/reportsRoutes');
const agentRoutes = require('./routes/agentRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const clientRoutes = require('./routes/clientRoutes');
const showingRoutes = require('./routes/showingRoutes');
const offerRoutes = require('./routes/offerRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging in development
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[${req.method}] ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Public API Routes
app.use('/api/auth', authRoutes);
app.use('/api/health', healthRoutes);

// Protected API Routes (Requires valid JWT token)
app.use('/api/dashboard', requireAuth, dashboardRoutes);
app.use('/api/reports', requireAuth, reportsRoutes);
app.use('/api/agents', requireAuth, agentRoutes);
app.use('/api/categories', requireAuth, categoryRoutes);
app.use('/api/properties', requireAuth, propertyRoutes);
app.use('/api/clients', requireAuth, clientRoutes);
app.use('/api/showings', requireAuth, showingRoutes);
app.use('/api/offers', requireAuth, offerRoutes);
app.use('/api/transactions', requireAuth, transactionRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    service: 'EstateFlow Real Estate Sales Management System API',
    version: '1.0.0',
    documentation: '/api/health',
    endpoints: [
      '/api/health',
      '/api/health/db',
      '/api/dashboard',
      '/api/reports',
      '/api/agents',
      '/api/categories',
      '/api/properties',
      '/api/clients',
      '/api/showings',
      '/api/offers',
      '/api/transactions'
    ]
  });
});

// 404 Route handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Centralized error handler
app.use(errorHandler);

// Start Server and check DB connection
const server = app.listen(PORT, async () => {
  console.log('========================================================');
  console.log(`  ESTATEFLOW BACKEND SERVER RUNNING ON PORT ${PORT}      `);
  console.log(`  API Base URL: http://localhost:${PORT}/api            `);
  console.log('========================================================');

  try {
    const dbStatus = await testConnection();
    if (dbStatus.connected) {
      console.log(`[Oracle DB Status] CONNECTED (${dbStatus.mode})`);
      console.log(`[Target Schema]   ${dbStatus.schema}`);
      console.log(`[Connect String]  ${dbStatus.connectString}`);
    } else {
      console.warn('[Oracle DB Status] WARNING: Database connection failed.');
      console.warn(`[Details]         ${dbStatus.error}`);
      console.warn('Backend is running, but database calls will fail until credentials in backend/.env are configured.');
    }
  } catch (err) {
    console.warn('[Oracle DB Status] Initialization check error:', err.message);
  }
});

// Graceful shutdown
async function gracefulShutdown(signal) {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    await closeDbPool();
    console.log('Server and Oracle DB connections closed. Exiting process.');
    process.exit(0);
  });
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

module.exports = app;
