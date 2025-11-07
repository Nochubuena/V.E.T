import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/database';
import authRoutes from './routes/auth';
import dogsRoutes from './routes/dogs';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// CORS Configuration
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // In development, allow all origins
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // List of allowed origins for production
    const allowedOrigins = [
      'http://localhost:19006',
      'http://localhost:3000',
      'http://localhost:8080',
      'https://v-e-t.vercel.app',
      'https://v-e-t-1.onrender.com',
      process.env.FRONTEND_URL,
    ].filter(Boolean) as string[];
    
    // Check if origin is in allowed list
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      return origin === allowedOrigin || origin.startsWith(allowedOrigin);
    });
    
    // Also allow any *.vercel.app and *.onrender.com domains
    const isVercelDomain = origin.endsWith('.vercel.app');
    const isRenderDomain = origin.endsWith('.onrender.com');
    
    if (isAllowed || isVercelDomain || isRenderDomain) {
      callback(null, true);
    } else {
      console.log(`⚠️ CORS blocked origin: ${origin}`);
      console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
// Increase body size limit to 50MB for image uploads (base64 encoded images can be large)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware (for debugging)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin || 'none'}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dogs', dogsRoutes);

// Root health check for Render (simple, fast response)
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'V.E.T API is running'
  });
});

// Health check (with DB connection status)
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ 
    status: 'OK', 
    message: 'V.E.T API is running',
    database: dbStatus
  });
});

// Start server immediately (don't wait for DB)
// Bind to 0.0.0.0 for Render deployment (allows external connections)
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API endpoints available at /api`);
  
  // Connect to MongoDB in the background (non-blocking)
  connectDB().catch((error) => {
    console.error('❌ MongoDB connection failed:', error);
    console.error('⚠️ Server is running but database is not connected');
    // Don't exit - let server continue running
  });
});

// Handle server errors
server.on('error', (error: any) => {
  console.error('❌ Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`⚠️ Port ${PORT} is already in use`);
    process.exit(1);
  }
});

