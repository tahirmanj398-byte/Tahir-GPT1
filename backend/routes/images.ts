import express from 'express';
import db from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get user's generated images
router.get('/', authenticateToken, (req: AuthRequest, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM images WHERE user_id = ? ORDER BY created_at DESC');
    const images = stmt.all(req.user?.id);
    res.json(images);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// Save generated image
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { prompt, imageUrl } = req.body;
    const userId = req.user?.id;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required.' });
    }

    // Save image to DB
    const insertStmt = db.prepare('INSERT INTO images (user_id, prompt, image_url) VALUES (?, ?, ?)');
    const info = insertStmt.run(userId, prompt, imageUrl);

    res.status(201).json({ id: info.lastInsertRowid, imageUrl, prompt });
  } catch (error) {
    console.error('Image save error:', error);
    res.status(500).json({ error: 'Failed to save image' });
  }
});

// Delete a single image
router.delete('/:id', authenticateToken, (req: AuthRequest, res) => {
  try {
    const imageId = parseInt(req.params.id);
    if (isNaN(imageId)) {
      return res.status(400).json({ error: 'Invalid image ID' });
    }
    const stmt = db.prepare('DELETE FROM images WHERE id = ? AND user_id = ?');
    const info = stmt.run(imageId, req.user?.id);
    
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// Clear all images
router.delete('/', authenticateToken, (req: AuthRequest, res) => {
  try {
    const stmt = db.prepare('DELETE FROM images WHERE user_id = ?');
    stmt.run(req.user?.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear images' });
  }
});

export default router;
