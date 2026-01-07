import Message from '../models/Message.js';
import asyncHandler from '../utils/asyncHandler.js';

// Send a message
export const sendMessage = asyncHandler(async (req, res) => {
  const { chatId, content } = req.body;
  const sender = req.user._id;
  const message = new Message({ chatId, sender, content, readBy: [sender] });
  await message.save();
  // Optionally emit via socket.io here
  res.status(201).json(message);
});

// Get all messages for a chat
export const getMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const messages = await Message.find({ chatId }).sort({ timestamp: 1 });
  res.json(messages);
});

// Mark all messages as read for a user in a chat
export const markMessagesAsRead = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user._id;
  await Message.updateMany(
    { chatId, readBy: { $ne: userId } },
    { $addToSet: { readBy: userId } }
  );
  res.json({ ok: true });
});
