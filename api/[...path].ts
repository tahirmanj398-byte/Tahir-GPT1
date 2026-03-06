import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';

import authRoutes from '../backend/routes/auth';
import chatsRoutes from '../backend/routes/chats';
import imagesRoutes from '../backend/routes/images';
import systemRoutes from '../backend/routes/system';
import aiRoutes from '../backend/routes/ai';

const app = express();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '50mb' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/chats', chatsRoutes);
app.use('/api/images', imagesRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', environment: process.env.NODE_ENV });
});

export default app;
