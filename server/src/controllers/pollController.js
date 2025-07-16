import { Poll } from '../models/Poll.js';
import mongoose from 'mongoose';

// Create a new poll
export const createPoll = async (req, res) => {
  try {
    // Always store chatId as ObjectId
    const pollData = { ...req.body };
    if (pollData.chatId && typeof pollData.chatId === 'string' && pollData.chatId.length === 24) {
      pollData.chatId = new mongoose.Types.ObjectId(pollData.chatId);
    }
    // Ensure canChangeVote is set (default true if not provided)
    if (typeof pollData.canChangeVote === 'undefined') {
      pollData.canChangeVote = true;
    }
    const poll = new Poll(pollData);
    await poll.save();
    // DEBUG: Log poll as saved in DB
    console.log('[DEBUG] Poll saved in DB:', poll);
    // DEBUG: Print all polls in DB after save
    const allPolls = await Poll.find({});
    console.log('[DEBUG] All polls in DB:', allPolls);
    // Use io from app context for socket emission
    const io = req.app.get('io');
    io?.to(poll.chatId.toString()).emit('polls_updated', { chatId: poll.chatId });
    res.status(201).json(poll);
  } catch (err) {
    console.error('[DEBUG] Poll creation error:', err);
    res.status(400).json({ error: err.message });
  }
};

// Get all polls for a chat (optionally filter expired)
export const getPollsByChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const now = new Date();
    // Always use ObjectId for chatId query
    let chatObjectId = chatId;
    if (typeof chatId === 'string' && chatId.length === 24) {
      try {
        chatObjectId = new mongoose.Types.ObjectId(chatId);
      } catch (e) {
        // fallback to string
      }
    }
    // Extra debug: print all polls in DB and their chatId types
    const allPolls = await Poll.find({});
    console.log('[DEBUG] All polls in DB:', allPolls.map(p => ({ _id: p._id, chatId: p.chatId, chatIdType: typeof p.chatId, expiresAt: p.expiresAt })));
    console.log('[DEBUG] Query chatId:', chatObjectId, 'Type:', typeof chatObjectId);
    const query = {
      chatId: chatObjectId,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: now } }
      ]
    };
    const polls = await Poll.find(query).sort({ createdAt: 1 });
    console.log('[DEBUG] Poll fetch query:', query);
    console.log('[DEBUG] Polls found:', polls);
    res.json(polls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Vote on a poll
export const votePoll = async (req, res) => {
  try {
    const { pollId, optionIdx, userId } = req.body;
    const poll = await Poll.findById(pollId);
    if (!poll) return res.status(404).json({ error: 'Poll not found' });

    // Remove previous vote if canChangeVote
    if (poll.canChangeVote) {
      poll.options.forEach(opt => {
        opt.votes = opt.votes.filter(v => v.toString() !== userId);
      });
    } else {
      // Prevent double voting
      if (poll.options.some(opt => opt.votes.map(String).includes(String(userId)))) {
        return res.status(400).json({ error: 'Already voted' });
      }
    }
    // Add vote
    poll.options[optionIdx].votes.push(new mongoose.Types.ObjectId(userId));
    poll.totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes.length, 0);

    // --- Add voter to poll.members if not present ---
    // Try to get user name from request (frontend should send it, fallback to id)
    let userName = userId;
    if (req.body.userName) {
      userName = req.body.userName;
    } else if (req.user && req.user.name) {
      userName = req.user.name;
    }
    if (!Array.isArray(poll.members)) poll.members = [];
    if (!poll.members.find(m => m.id === userId)) {
      poll.members.push({ id: userId, name: userName });
    }

    await poll.save();
    // Increment performance score for voting
    if (userId) {
      try {
        const { User } = await import('../models/userModel.js');
        await User.updateOne({ _id: userId }, { $inc: { performanceScore: 0.5 } });
      } catch (e) { /* ignore errors for scoring */ }
    }
    // Use io from app context for socket emission
    const io = req.app.get('io');
    io?.to(poll.chatId.toString()).emit('polls_updated', { chatId: poll.chatId });
    res.json(poll);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a poll (by ID)
export const deletePoll = async (req, res) => {
  try {
    const { pollId } = req.params;
    const poll = await Poll.findByIdAndDelete(pollId);
    if (poll) {
      req.io?.to(poll.chatId.toString()).emit('poll_deleted', { pollId });
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Poll not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Poll expiry: delete expired polls and emit socket event
export const deleteExpiredPolls = async (io) => {
  const now = new Date();
  const expired = await Poll.find({ expiresAt: { $lte: now } });
  for (const poll of expired) {
    await Poll.deleteOne({ _id: poll._id });
    io?.to(poll.chatId.toString()).emit('poll_deleted', { pollId: poll._id });
  }
};
