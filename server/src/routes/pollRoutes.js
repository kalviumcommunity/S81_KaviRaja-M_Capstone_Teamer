import express from 'express';
import {
  createPoll,
  getPollsByChat,
  votePoll,
  deletePoll
} from '../controllers/pollController.js';

const router = express.Router();

// Create poll
router.post('/', createPoll);

// Get all polls for a chat
router.get('/:chatId', getPollsByChat);

// Vote on a poll
router.post('/vote', votePoll);

// Delete a poll
router.delete('/:pollId', deletePoll);

export default router;
