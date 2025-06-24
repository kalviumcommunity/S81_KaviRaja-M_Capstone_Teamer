import express from 'express';
import { createChat, getUserChats, sendMessage, getChatMessages } from '../controllers/chatController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.post('/create', createChat);
router.get('/user-chats', getUserChats);
router.post('/send-message', sendMessage);
router.get('/:chatId/messages', getChatMessages);

export default router;