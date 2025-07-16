import express from 'express';

import protect from '../middleware/authMiddleware.js';
import {
  createMeeting,
  getMeetingsForUser,
  joinMeeting,
  endMeeting,
  getMeetingsForChat,
  getMeetingById
} from '../controllers/meetingController.js';

const router = express.Router();


// Create a meeting
router.post('/', protect, createMeeting);
// Get meetings for a user
router.get('/user/:userId', protect, getMeetingsForUser);
// Join a meeting
router.post('/join/:meetId', protect, joinMeeting);
// End a meeting
router.post('/end/:meetId', protect, endMeeting);
// Get meetings for a chat
router.get('/chat/:chatId', protect, getMeetingsForChat);
// Get meeting by meetId
router.get('/id/:meetingId', protect, getMeetingById);

export default router;
