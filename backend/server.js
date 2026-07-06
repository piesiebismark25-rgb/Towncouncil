import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { seedDatabase } from './models/dbFactory.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables using absolute path
const envConfig = dotenv.config({ path: path.resolve(__dirname, '.env') });
console.log('Dotenv Load Result:', envConfig);

// Connect to Database
connectDB().then(() => {
  // Seed Database after connection attempts resolve
  seedDatabase();
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve uploaded static files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/admin', adminRoutes);

// Base health check API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Town Council Management API is running',
    timestamp: new Date(),
    dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected/mock',
  });
});

// 404 Not Found Middleware
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: `Not Found - ${req.originalUrl}`,
  });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

