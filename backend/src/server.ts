import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import connectDB from './database/connection.js';

dotenv.config();

const app: Express = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Database
const initializeApp = async () => {
  try {
    await connectDB();
    console.log('✓ Application initialized successfully');
  } catch (error) {
    console.error('✗ Failed to initialize application:', error);
    process.exit(1);
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

// Start Server
const startServer = async () => {
  await initializeApp();

  httpServer.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 API health check: http://localhost:${PORT}/api/health\n`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

export { app, io };
