// Get all chats with unread messages for a user
export const getUnreadChats = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ message: 'Error fetching unread chats', error: error.message });
  }
};
import { Chat } from '../models/Chat.js';
import { User } from '../models/userModel.js';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';

const storage = multer.memoryStorage();
export const upload = multer({ storage });

export const createChat = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ message: "Error creating chat", error: error.message });
  }
};

export const getUserChats = async (req, res) => {
  try {
    const userId = req.user._id;
    const chats = await Chat.find({ participants: userId })
      .populate('participants', 'username name email')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: "Error fetching chats", error: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { chatId, content } = req.body;
    const userId = req.user._id;

    // Defensive: ensure chat exists
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Defensive: ensure content is not empty
    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ message: 'Message content required' });
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
  } catch (error) {
    console.error('sendMessage error:', error);
    res.status(500).json({ message: "Error sending message", error: error.message });
  }
};

export const searchUsers = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ message: "Error searching users", error: error.message });
  }
};

export const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findById(chatId).populate('messages.sender', 'username name');
    if (!chat) return res.status(404).json([]);
    // Return messages as array, with sender info populated
    res.json(chat.messages || []);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages', error: error.message });
  }
};

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const { chatId } = req.body;
    const userId = req.user._id;
    console.log('Uploading file:', {
      name: req.file.originalname,
      type: req.file.mimetype,
      size: req.file.size
    });
    cloudinary.uploader.upload_stream({ resource_type: 'auto' }, async (err, result) => {
      if (err) {
        console.error('Cloudinary upload error:', err);
        return res.status(500).json({ message: 'Cloudinary upload error', error: err.message, details: err });
      }
      console.log('Cloudinary upload result:', result);
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
    }).end(req.file.buffer);
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ message: 'File upload error', error: error.message, details: error });
  }
};

// Create a group chat
export const createGroupChat = async (req, res) => {
  try {
    const { name, memberIds } = req.body;
    const userId = req.user._id;
    if (!name || !memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({ message: 'Group name and at least one member required.' });
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
  } catch (error) {
    res.status(500).json({ message: 'Error creating group', error: error.message });
  }
};