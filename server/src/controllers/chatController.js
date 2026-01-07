import { Chat } from '../models/Chat.js';
import { User } from '../models/userModel.js';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import asyncHandler from '../utils/asyncHandler.js';

const storage = multer.memoryStorage();
export const upload = multer({ storage });

// Get all chats with unread messages for a user
export const getUnreadChats = asyncHandler(async (req, res) => {
  const userId = req.user._id.toString();
  const chats = await Chat.find({
    participants: userId,
    messages: { $elemMatch: { readBy: { $ne: userId } } }
  })
    .populate('participants', 'username name email')
    .populate('lastMessage.sender', 'username name');
  // For each chat, count unread messages
  const result = chats.map(chat => {
    const unreadCount = chat.messages.filter(m => !m.readBy.map(id => id.toString()).includes(userId)).length;
    return {
      chatId: chat._id,
      unreadCount,
      lastMessage: chat.lastMessage,
      participants: chat.participants
    };
  });
  res.json(result);
});

export const createChat = asyncHandler(async (req, res) => {
  const { participantId } = req.body;
  const userId = req.user._id;

  // Check if chat already exists
  const existingChat = await Chat.findOne({
    isGroupChat: false,
    participants: {
      $all: [userId, participantId],
      $size: 2
    }
  });

  if (existingChat) {
    return res.json(existingChat);
  }

  const newChat = await Chat.create({
    participants: [userId, participantId],
    isGroupChat: false
  });

  const populatedChat = await Chat.findById(newChat._id)
    .populate('participants', 'username name email');

  res.status(201).json(populatedChat);
});

export const getUserChats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const chats = await Chat.find({ participants: userId })
    .populate('participants', 'username name email')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });

  res.json(chats);
});

export const sendMessage = asyncHandler(async (req, res) => {
  const { chatId, content } = req.body;
  const userId = req.user._id;

  // Defensive: ensure chat exists
  const chat = await Chat.findById(chatId);
  if (!chat) {
    res.status(404);
    throw new Error('Chat not found');
  }

  // Defensive: ensure content is not empty
  if (!content || typeof content !== 'string' || !content.trim()) {
    res.status(400);
    throw new Error('Message content required');
  }

  // Create new message object
  const newMessage = {
    sender: userId,
    content,
    timestamp: new Date(),
    readBy: [userId],
    chatId,
  };

  // Save message to chat
  chat.messages.push(newMessage);
  chat.lastMessage = newMessage;
  await chat.save();

  // Populate sender for frontend display
  const populatedChat = await Chat.findById(chatId)
    .populate('participants', 'username name email')
    .populate('messages.sender', 'username name');
  const savedMessage = populatedChat.messages[populatedChat.messages.length - 1];

  // Emit socket event for real-time updates
  req.app.get('io').to(chatId).emit('new_message', {
    chat: populatedChat,
    message: savedMessage
  });

  res.json({ chat: populatedChat, message: savedMessage });
});

export const searchUsers = asyncHandler(async (req, res) => {
  const query = req.query.q;
  if (!query) return res.json([]);
  const users = await User.find({
    $or: [
      { username: { $regex: query, $options: 'i' } },
      { name: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } }
    ]
  }).select('-password');
  res.json(users);
});

export const getChatMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const chat = await Chat.findById(chatId).populate('messages.sender', 'username name');
  if (!chat) return res.status(404).json([]);
  // Return messages as array, with sender info populated
  res.json(chat.messages || []);
});

export const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }
  const { chatId } = req.body;
  const userId = req.user._id;

  // Use a promise wrapper for cloudinary upload stream
  const uploadToCloudinary = () => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ resource_type: 'auto' }, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
      stream.end(req.file.buffer);
    });
  };

  const result = await uploadToCloudinary();

  const newMessage = {
    sender: userId,
    content: result.secure_url,
    fileName: req.file.originalname,
    fileType: req.file.mimetype,
    isFile: true,
    timestamp: new Date(),
    readBy: [userId],
    chatId,
  };

  const chat = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { messages: newMessage },
      $set: { lastMessage: newMessage },
    },
    { new: true }
  ).populate('participants', 'username name email');

  const savedMessage = chat.messages[chat.messages.length - 1];
  req.app.get('io').to(chatId).emit('new_message', { chat, message: savedMessage });
  res.json({ url: result.secure_url, chat, message: savedMessage });
});

// Create a group chat
export const createGroupChat = asyncHandler(async (req, res) => {
  const { name, memberIds } = req.body;
  const userId = req.user._id;
  if (!name || !memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
    res.status(400);
    throw new Error('Group name and at least one member required.');
  }
  // Add the creator as admin and participant
  const allMembers = Array.from(new Set([userId.toString(), ...memberIds.map(id => id.toString())]));
  const newGroup = await Chat.create({
    participants: allMembers,
    isGroupChat: true,
    groupName: name,
    groupAdmin: userId
  });
  const populatedGroup = await Chat.findById(newGroup._id)
    .populate('participants', 'username name email')
    .populate('groupAdmin', 'username name email');
  res.status(201).json(populatedGroup);

  // After group creation, emit chat_created to all group members if socket is available
  try {
    const io = req.app.get('io');
    if (io && populatedGroup && populatedGroup.participants) {
      populatedGroup.participants.forEach((user) => {
        const userId = user._id?.toString?.() || user.toString();
        io.to(userId).emit('chat_created', populatedGroup);
      });
    }
  } catch (e) { /* ignore socket errors */ }
});