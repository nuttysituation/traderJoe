import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { createServer } from 'https';
import { createServer as createHttpServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { SecureVersion } from 'tls';

import { connectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiterMiddleware } from './middleware/rateLimiter';
import { securityHeaders, corsConfig, rateLimitConfig } from './middleware/securityHeaders';
import { sanitizeInput, validateRequestSize } from './middleware/validation';

// Routes
import stockRoutes from './routes/stocks';
import investorRoutes from './routes/investors';
import tradeRoutes from './routes/trades';
import analysisRoutes from './routes/analysis';
import dashboardRoutes from './routes/dashboard';

// Services
import { startDataCollection } from './services/dataCollection';
import { startWebSocketServer } from './services/websocket';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const HTTPS_PORT = process.env.HTTPS_PORT || 8766;
const isDevelopment = process.env.NODE_ENV !== 'production';

// SSL Configuration (only in production or if certificates exist)
let sslOptions = null;
let useHttps = false;

if (!isDevelopment) {
  try {
    sslOptions = {
      key: fs.readFileSync(path.join(__dirname, '../ssl/server.key')),
      cert: fs.readFileSync(path.join(__dirname, '../ssl/server.crt')),
      minVersion: 'TLSv1.3' as SecureVersion,
      maxVersion: 'TLSv1.3' as SecureVersion,
      ciphers: 'TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:TLS_AES_128_GCM_SHA256',
      honorCipherOrder: true,
      requestCert: false
    };
    useHttps = true;
  } catch (error) {
    logger.warn('SSL certificates not found, falling back to HTTP');
    useHttps = false;
  }
}

// Enhanced Helmet configuration
app.use(helmet({
  contentSecurityPolicy: false, // We'll handle CSP manually
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Security headers
app.use(securityHeaders);

// CORS configuration
app.use(cors(corsConfig));

// Compression
app.use(compression());

// Request logging (more detailed in development)
if (isDevelopment) {
  app.use(morgan('combined'));
} else {
  app.use(morgan('combined', {
    skip: (req, res) => (res as any).statusCode < 400,
    stream: {
      write: (message: string) => logger.info(message.trim())
    }
  }));
}

// Request size limiting
app.use(validateRequestSize('10mb'));

// Body parsing with limits
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf.toString());
    } catch (e) {
      (res as any).status(400).json({ success: false, error: 'Invalid JSON' });
      throw new Error('Invalid JSON');
    }
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb',
  parameterLimit: 100
}));

// Input sanitization
app.use(sanitizeInput);

// Rate limiting
app.use(rateLimiterMiddleware);

// Health check (no rate limiting)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API Routes with validation
app.use('/api/stocks', stockRoutes);
app.use('/api/investors', investorRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Error handling (must be last)
app.use(errorHandler);

// Create server (HTTP or HTTPS)
const server = useHttps && sslOptions 
  ? createServer(sslOptions, app)
  : createHttpServer(app);

// WebSocket setup with security
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || (isDevelopment ? 'http://localhost:3000' : 'https://localhost:3000'),
    methods: ['GET', 'POST'],
    credentials: true
  },
  allowEIO3: false, // Disable older Socket.IO versions
  transports: ['websocket', 'polling']
});

// Initialize WebSocket
startWebSocketServer(io);

// Start server
async function startServer() {
  try {
    // Connect to database
    await connectDatabase();
    logger.info('Database connected successfully');

    // Connect to Redis
    await connectRedis();
    logger.info('Redis connected successfully');

    // Start data collection (only in development or if explicitly enabled)
    if (isDevelopment || process.env.DATA_COLLECTION_ENABLED === 'true') {
      startDataCollection();
    }

    // Start server
    const serverPort = useHttps ? HTTPS_PORT : PORT;
    const protocol = useHttps ? 'HTTPS' : 'HTTP';
    
    server.listen(serverPort, () => {
      logger.info(`${protocol} Server running on port ${serverPort}`);
      logger.info(`Server accessible at: ${useHttps ? 'https' : 'http'}://localhost:${serverPort}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      
      if (isDevelopment) {
        logger.info('Development mode - security features may be relaxed');
      } else {
        logger.info('Production mode - all security features enabled');
      }
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

startServer(); 