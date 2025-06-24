import { Chat } from '../models/Chat.js';
import { User } from '../models/userModel.js';

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

    const newMessage = {
      sender: userId,
      content,
      timestamp: new Date(),
      readBy: [userId]
    };

    const chat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: { messages: newMessage },
        $set: { lastMessage: newMessage }
      },
      { new: true }
    )
    .populate('participants', 'username name email')
    .populate('messages.sender', 'username name');

    // Emit socket event for real-time updates
    req.app.get('io').to(chatId).emit('new_message', {
      chat,
      message: newMessage
    });

    res.json(chat);
  } catch (error) {
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