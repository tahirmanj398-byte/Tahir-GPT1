import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createServer as createViteServer } from 'vite';
import path from 'path';

import authRoutes from './backend/routes/auth';
import chatsRoutes from './backend/routes/chats';
import imagesRoutes from './backend/routes/images';
import systemRoutes from './backend/routes/system';
import aiRoutes from './backend/routes/ai';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

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

  // Serve static files in production or use Vite middleware in development
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.error('Vite initialization failed:', e);
    }
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch(console.error);
