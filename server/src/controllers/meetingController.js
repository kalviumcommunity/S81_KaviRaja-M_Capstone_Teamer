import Meeting from '../models/Meeting.js';
import mongoose from 'mongoose';
import crypto from 'crypto';

// Generate a unique Meet ID
function generateMeetId() {
  return crypto.randomBytes(6).toString('hex');
}

// Create a new meeting
export const createMeeting = async (req, res) => {
  try {
    const { title, participants, scheduledAt, description, duration, chatId } = req.body;
    const creator = req.user?._id || req.body.creator;
    // Validate chatId
    if (!chatId || !mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ error: 'Invalid or missing chatId' });
    }
    // Validate participants
    if (!Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({ error: 'Participants are required' });
    }
    for (const p of participants) {
      if (!mongoose.Types.ObjectId.isValid(p)) {
        return res.status(400).json({ error: `Invalid participant ID: ${p}` });
      }
    }
    // Validate scheduledAt
    if (!scheduledAt || isNaN(Date.parse(scheduledAt))) {
      return res.status(400).json({ error: 'Invalid or missing scheduledAt' });
    }
    if (!creator || !mongoose.Types.ObjectId.isValid(creator)) {
      return res.status(400).json({ error: 'Invalid or missing creator' });
    }
    console.log('[DEBUG] Create Meeting:', { title, participants, scheduledAt, creator, chatId });
    if (!creator || !participants || !scheduledAt || !chatId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    // Use imported crypto directly
    const meetId = crypto.randomBytes(6).toString('hex');
    // Ensure all IDs are strings for consistency
    const allParticipants = [String(creator), ...participants.filter(p => String(p) !== String(creator)).map(String)];
    const meeting = new Meeting({
      meetId,
      title,
      creator: String(creator),
      participants: allParticipants,
      scheduledAt: new Date(scheduledAt),
      description,
      duration,
      chatId: String(chatId),
      status: 'scheduled',
    });
    await meeting.save();
    console.log('[DEBUG] Meeting saved:', { _id: meeting._id, chatId: meeting.chatId, participants: meeting.participants });
    // Emit socket event to all invited users (real-time update)
    try {
      const io = req.app.get('io');
      if (io && meeting.participants && Array.isArray(meeting.participants)) {
        meeting.participants.forEach((userId) => {
          const idStr = userId._id?.toString?.() || userId.toString();
          io.to(idStr).emit('meeting_created', meeting);
        });
      }
    } catch (e) {
      console.error('[DEBUG] Socket emit error (meeting_created):', e);
    }
    res.status(201).json(meeting);
  } catch (err) {
    console.error('[DEBUG] Meeting creation error:', err);
    res.status(400).json({ error: err.message });
  }
};

// Get meetings for a user
export const getMeetingsForUser = async (req, res) => {
  try {
    const userId = String(req.user?._id || req.params.userId);
    if (!userId) return res.status(400).json({ error: 'Missing userId' });
    const meetings = await Meeting.find({ participants: userId })
      .populate('creator', 'name username')
      .populate('participants', 'name username')
      .sort({ scheduledAt: 1 })
      .lean();
    res.json(meetings);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get meetings for a chat
export const getMeetingsForChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const meetings = await Meeting.find({ chatId: String(chatId) })
      .populate('creator', 'name username')
      .populate('participants', 'name username')
      .lean();
    res.json(meetings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch meetings' });
  }
};

// Join meeting (validate time and participant)
export const joinMeeting = async (req, res) => {
  try {
    const { meetId } = req.params;
    const userId = req.user?._id || req.body.userId;
    const meeting = await Meeting.findOne({ meetId });
    console.log('[JOIN DEBUG] meetId:', meetId);
    console.log('[JOIN DEBUG] userId:', userId);
    console.log('[JOIN DEBUG] meeting:', meeting);
    if (!meeting) {
      console.log('[JOIN DEBUG] Meeting not found');
      return res.status(404).json({ error: 'Meeting not found' });
    }
    const participantIds = meeting.participants.map(p => String(p));
    console.log('[JOIN DEBUG] participantIds:', participantIds);
    if (!participantIds.includes(String(userId))) {
      console.log('[JOIN DEBUG] Not invited:', userId, 'not in', participantIds);
      return res.status(403).json({ error: 'Not invited' });
    }
    const now = new Date();
    const scheduled = new Date(meeting.scheduledAt);
    if (now < new Date(scheduled.getTime() - 10 * 60000) || now > new Date(scheduled.getTime() + 10 * 60000)) {
      console.log('[JOIN DEBUG] Meeting not open yet:', now, scheduled);
      return res.status(403).json({ error: 'Meeting not open yet' });
    }
    meeting.status = 'active';
    await meeting.save();
    // Increment performance score for joining a meeting
    if (userId) {
      try {
        const { User } = await import('../models/userModel.js');
        await User.updateOne({ _id: userId }, { $inc: { performanceScore: 0.5 } });
      } catch (e) { /* ignore errors for scoring */ }
    }
    // Re-fetch with populated fields for response
    const populatedMeeting = await Meeting.findById(meeting._id)
      .populate('creator', 'name username')
      .populate('participants', 'name username')
      .lean();
    console.log('[JOIN DEBUG] Join success');
    res.json({ success: true, meeting: populatedMeeting });
  } catch (err) {
    console.log('[JOIN DEBUG] Error:', err);
    res.status(400).json({ error: err.message });
  }
};

// End meeting
export const endMeeting = async (req, res) => {
  try {
    const { meetId } = req.params;
    const meeting = await Meeting.findOne({ meetId });
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    meeting.status = 'ended';
    meeting.endedAt = new Date();
    await meeting.save();
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get meeting by meetId
export const getMeetingById = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const meeting = await Meeting.findOne({ meetId: meetingId })
      .populate('creator', 'name username')
      .populate('participants', 'name username')
      .lean();
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    res.json(meeting);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch meeting' });
  }
};
