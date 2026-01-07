import Meeting from '../models/Meeting.js';
import mongoose from 'mongoose';
import crypto from 'crypto';
import asyncHandler from '../utils/asyncHandler.js';

// Create a new meeting
export const createMeeting = asyncHandler(async (req, res) => {
  const { title, participants, scheduledAt, description, duration, chatId } = req.body;
  const creator = req.user?._id || req.body.creator;

  // Validate chatId
  if (!chatId || !mongoose.Types.ObjectId.isValid(chatId)) {
    res.status(400);
    throw new Error('Invalid or missing chatId');
  }
  // Validate participants
  if (!Array.isArray(participants) || participants.length === 0) {
    res.status(400);
    throw new Error('Participants are required');
  }
  for (const p of participants) {
    if (!mongoose.Types.ObjectId.isValid(p)) {
      res.status(400);
      throw new Error(`Invalid participant ID: ${p}`);
    }
  }

  // Validate scheduledAt
  if (!scheduledAt || isNaN(Date.parse(scheduledAt))) {
    res.status(400);
    throw new Error('Invalid or missing scheduledAt');
  }
  if (!creator || !mongoose.Types.ObjectId.isValid(creator)) {
    res.status(400);
    throw new Error('Invalid or missing creator');
  }

  const meetId = crypto.randomBytes(6).toString('hex');
  // Ensure all IDs are strings for consistency
  const allParticipants = [String(creator), ...participants.filter(p => String(p) !== String(creator)).map(String)];

  const meeting = await Meeting.create({
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
});

// Get meetings for a user
export const getMeetingsForUser = asyncHandler(async (req, res) => {
  const userId = String(req.user?._id || req.params.userId);
  if (!userId) {
    res.status(400);
    throw new Error('Missing userId');
  }
  const meetings = await Meeting.find({ participants: userId })
    .populate('creator', 'name username')
    .populate('participants', 'name username')
    .sort({ scheduledAt: 1 })
    .lean();
  res.json(meetings);
});

// Get meetings for a chat
export const getMeetingsForChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const meetings = await Meeting.find({ chatId: String(chatId) })
    .populate('creator', 'name username')
    .populate('participants', 'name username')
    .lean();
  res.json(meetings);
});

// Join meeting (validate time and participant)
export const joinMeeting = asyncHandler(async (req, res) => {
  const { meetId } = req.params;
  const userId = req.user?._id || req.body.userId;
  const meeting = await Meeting.findOne({ meetId });

  if (!meeting) {
    res.status(404);
    throw new Error('Meeting not found');
  }
  const participantIds = meeting.participants.map(p => String(p));

  if (!participantIds.includes(String(userId))) {
    res.status(403);
    throw new Error('Not invited');
  }

  const now = new Date();
  const scheduled = new Date(meeting.scheduledAt);
  if (now < new Date(scheduled.getTime() - 10 * 60000) || now > new Date(scheduled.getTime() + 10 * 60000)) {
    res.status(403);
    throw new Error('Meeting not open yet');
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

  res.json({ success: true, meeting: populatedMeeting });
});

// End meeting
export const endMeeting = asyncHandler(async (req, res) => {
  const { meetId } = req.params;
  const meeting = await Meeting.findOne({ meetId });
  if (!meeting) {
    res.status(404);
    throw new Error('Meeting not found');
  }
  meeting.status = 'ended';
  meeting.endedAt = new Date();
  await meeting.save();
  res.json({ success: true });
});

// Get meeting by meetId
export const getMeetingById = asyncHandler(async (req, res) => {
  const { meetingId } = req.params;
  const meeting = await Meeting.findOne({ meetId: meetingId })
    .populate('creator', 'name username')
    .populate('participants', 'name username')
    .lean();
  if (!meeting) {
    res.status(404);
    throw new Error('Meeting not found');
  }
  res.json(meeting);
});
