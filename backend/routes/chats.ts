import express from 'express';
import db from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all chats for user
router.get('/', authenticateToken, (req: AuthRequest, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM chats WHERE user_id = ? ORDER BY created_at DESC');
    const chats = stmt.all(req.user?.id);
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
});

// Create a new chat
router.post('/', authenticateToken, (req: AuthRequest, res) => {
  try {
    const { title } = req.body;
    const stmt = db.prepare('INSERT INTO chats (user_id, title) VALUES (?, ?)');
    const info = stmt.run(req.user?.id, title || 'New Chat');
    res.status(201).json({ id: info.lastInsertRowid, title: title || 'New Chat' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create chat' });
  }
});

// Get messages for a chat
router.get('/:id/messages', authenticateToken, (req: AuthRequest, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM messages WHERE chat_id = ? ORDER BY created_at ASC');
    const messages = stmt.all(req.params.id);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Save a message
router.post('/:id/messages', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { role, content, model } = req.body;
    const chatId = req.params.id;

    // Verify chat belongs to user
    const chatStmt = db.prepare('SELECT * FROM chats WHERE id = ? AND user_id = ?');
    const chat = chatStmt.get(chatId, req.user?.id);
    if (!chat) return res.status(404).json({ error: 'Chat not found' });

    // Save message
    const insertMsgStmt = db.prepare('INSERT INTO messages (chat_id, role, content, model) VALUES (?, ?, ?, ?)');
    const info = insertMsgStmt.run(chatId, role, content, model || null);

    res.json({ id: info.lastInsertRowid, role, content, model: model || null });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// Delete a chat
router.delete('/:id', authenticateToken, (req: AuthRequest, res) => {
  try {
    const stmt = db.prepare('DELETE FROM chats WHERE id = ? AND user_id = ?');
    stmt.run(req.params.id, req.user?.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete chat' });
  }
});

// Clear all chats
router.delete('/', authenticateToken, (req: AuthRequest, res) => {
  try {
    const stmt = db.prepare('DELETE FROM chats WHERE user_id = ?');
    stmt.run(req.user?.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear chats' });
  }
});

export default router;
