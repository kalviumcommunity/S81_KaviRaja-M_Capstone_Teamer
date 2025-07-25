import express from 'express';
import { createChat, getUserChats, sendMessage, getChatMessages, upload, uploadFile, createGroupChat, getUnreadChats } from '../controllers/chatController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.post('/create', createChat);
router.post('/create-group', createGroupChat);
router.get('/user-chats', getUserChats);
router.get('/unread-chats', getUnreadChats);
router.post('/send-message', sendMessage);
router.get('/:chatId/messages', getChatMessages);
router.post('/upload-file', upload.single('file'), uploadFile);

export default router;