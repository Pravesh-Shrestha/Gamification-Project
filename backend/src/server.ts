import express from 'express';
import type { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import connectDB from './database/connection';
import studentRoutes from './routes/studentRoutes';
import masterRoutes from './routes/masterRoutes';
import adminRoutes from './routes/adminRoutes';
import authRoutes from './routes/authRoutes';
import { analyticsRoutes } from './routes/analyticsRoutes';
import { errorHandler, requestLogger } from './middleware/errorHandler';

dotenv.config();

const app: Express = express();
const httpServer = createServer(app);
// Allow multiple frontend origins for local dev (comma-separated env var)
const rawOrigins = process.env.CLIENT_URLS || process.env.CLIENT_URL || 'http://localhost:3000';
const allowedOrigins = rawOrigins.split(',').map((s) => s.trim()).filter(Boolean);
if (!allowedOrigins.includes('http://localhost:3001')) {
  allowedOrigins.push('http://localhost:3001');
}

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: (origin, callback) => {
      // allow non-browser (e.g., server) requests
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Origin not allowed'));
    },
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.BACKEND_PORT || 5001;

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Origin not allowed'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  })
);
app.use(express.json());
app.use(requestLogger);

// Initialize Database
const initializeApp = async () => {
  try {
    await connectDB();
    console.log('✓ Application initialized successfully');
  } catch (error) {
    console.error('✗ Failed to initialize application:', error);
    // In development allow the server to run without DB for demo/testing
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.warn('Continuing without database connection (development mode)');
    }
  }
};

// Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'Backend is running',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development',
  });
});

app.use('/api/students', studentRoutes);
app.use('/api/master', masterRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Socket.io connection
io.on('connection', (socket) => {
  console.log(`✓ User connected: ${socket.id}`);

  socket.on('student:join', (data) => {
    console.log(`Student ${data.studentId} joined`);
    socket.emit('student:welcome', { message: 'Connected to gamification engine' });
  });

  socket.on('disconnect', () => {
    console.log(`✗ User disconnected: ${socket.id}`);
  });
});

// Start Server with port-retry to avoid EADDRINUSE on rapid restarts
const attemptListen = (startPort: number, maxAttempts = 5): Promise<number> => {
  let port = startPort;
  return new Promise((resolve, reject) => {
    const tryPort = () => {
      httpServer.once('error', (err: any) => {
        if (err && err.code === 'EADDRINUSE') {
          console.warn(`Port ${port} in use, trying ${port + 1}`);
          port += 1;
          if (port - startPort >= maxAttempts) {
            return reject(err);
          }
          setTimeout(tryPort, 200);
        } else {
          return reject(err);
        }
      });

      httpServer.once('listening', () => {
        // remove the temporary listeners
        httpServer.removeAllListeners('error');
        httpServer.removeAllListeners('listening');
        resolve(port);
      });

      httpServer.listen(port);
    };

    tryPort();
  });
};

const startServer = async () => {
  await initializeApp();

  try {
    const boundPort = await attemptListen(Number(PORT));
    console.log(`\n🚀 Server running on http://localhost:${boundPort}`);
    console.log(`📊 API health check: http://localhost:${boundPort}/api/health\n`);
  } catch (error: any) {
    console.error('Failed to bind server port:', error);
    process.exit(1);
  }
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

export { app, io };
