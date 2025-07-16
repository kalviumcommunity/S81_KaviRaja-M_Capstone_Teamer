import express from 'express';
import { sendMessage, getMessages, markMessagesAsRead } from '../controllers/messageController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, sendMessage);
router.get('/:chatId', authMiddleware, getMessages);
router.post('/mark-read/:chatId', authMiddleware, markMessagesAsRead);

export default router;
