import express from 'express';
import db from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.get('/health', (req, res) => {
  try {
    // Check DB connection
    db.prepare('SELECT 1').get();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

router.post('/deploy', authenticateToken, async (req: AuthRequest, res) => {
  const { html, name } = req.body;
  const token = process.env.VERCEL_TOKEN;
  
  if (!token) {
    return res.status(400).json({ error: 'VERCEL_TOKEN is not configured. Please set it in environment variables.' });
  }

  try {
    const response = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name || 'tahir-gpt-site',
        files: [
          {
            file: 'index.html',
            data: html,
          },
        ],
        projectSettings: {
          framework: null,
        },
      }),
    });

    const data = await response.json() as any;
    if (!response.ok) {
      throw new Error(data.error?.message || 'Vercel deployment failed');
    }

    res.json({ url: `https://${data.url}` });
  } catch (error: any) {
    console.error('Deployment error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/maintenance/sync-db', (req, res) => {
  try {
    // Ensure all tables exist and columns are correct
    // This is already handled in db.ts, but we can add more checks here
    
    // Example: Check for orphaned messages
    const orphanedMessages = db.prepare('SELECT COUNT(*) as count FROM messages WHERE chat_id NOT IN (SELECT id FROM chats)').get() as any;
    if (orphanedMessages.count > 0) {
      db.prepare('DELETE FROM messages WHERE chat_id NOT IN (SELECT id FROM chats)').run();
    }

    res.json({
      message: 'Database sync completed',
      orphanedMessagesRemoved: orphanedMessages.count
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
