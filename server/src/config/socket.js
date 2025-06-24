import { Server } from 'socket.io';

const configureSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"], // Added 5174
      credentials: true,
    },
  });

  const onlineUsers = new Map(); // userId -> socket.id

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Handle user joining
    socket.on('user_join', async (userId) => {
      const idStr = userId?.toString?.() || userId;
      onlineUsers.set(idStr, socket.id);
      socket.userId = idStr;
      io.emit('user_status', { userId: idStr, status: 'online' });

      // Fetch all chat IDs for this user and join rooms
      try {
        const { Chat } = await import('../models/Chat.js'); // FIXED
        const chats = await Chat.find({ participants: idStr }, '_id');
        chats.forEach(chat => {
          const roomId = chat._id.toString();
          socket.join(roomId);
          console.log(`User ${idStr} joined room ${roomId}`); // <-- LOG
        });
      } catch (err) {
        console.error('Error joining chat rooms:', err);
      }
    });

    // Handle private messages (deprecated, use sendMessage)
    socket.on('private_message', ({ content, to, from, chatId }) => {
      const recipientSocket = onlineUsers.get(to);
      if (recipientSocket) {
        io.to(recipientSocket).emit('private_message', {
          content,
          from,
          chatId,
          timestamp: new Date()
        });
      }
    });

    // Handle typing status
    socket.on('typing', ({ chatId, userId }) => {
      socket.to(chatId).emit('typing_status', { chatId, userId, isTyping: true });
    });
    socket.on('stop_typing', ({ chatId, userId }) => {
      socket.to(chatId).emit('typing_status', { chatId, userId, isTyping: false });
    });

    // Real-time chat creation event
    socket.on('chat_created', (chat) => {
      chat.participants.forEach((user) => {
        const userId = user._id?.toString?.() || user.toString();
        const recipientSocket = onlineUsers.get(userId);
        if (recipientSocket) {
          io.to(recipientSocket).emit('chat_created', chat);
        }
      });
    });

    // Real-time message sending event
    socket.on('sendMessage', async (data) => {
      try {
        const { chatId, content, senderId } = data;
        const chatIdStr = chatId?.toString?.() || chatId;
        const senderIdStr = senderId?.toString?.() || senderId;
        // Find chat and participants
        const { Chat } = await import('../models/Chat.js'); // FIXED
        const chat = await Chat.findById(chatIdStr).populate('participants', '_id');
        if (!chat) return;
        // Emit to the chat room
        console.log(`Emitting new_message to room ${chatIdStr} from sender ${senderIdStr}`); // <-- LOG
        io.to(chatIdStr).emit('new_message', {
          chat: { _id: chatIdStr },
          message: { ...data, chatId: chatIdStr, senderId: senderIdStr }
        });
      } catch (err) {
        console.error('Socket sendMessage error:', err);
      }
    });

    // Join chat room on demand (optional, for new chats)
    socket.on('join_chat', (chatId) => {
      if (chatId) {
        socket.join(chatId.toString());
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      const disconnectedUser = socket.userId;
      if (disconnectedUser) {
        onlineUsers.delete(disconnectedUser);
        io.emit('user_status', {
          userId: disconnectedUser,
          status: 'offline'
        });
      }
    });
  });

  return io;
};

export default configureSocket;