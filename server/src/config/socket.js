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

    // Real-time message sending event (now saves to DB)
    socket.on('sendMessage', async (data) => {
      try {
        const { chatId, content, senderId } = data;
        const chatIdStr = chatId?.toString?.() || chatId;
        const senderIdStr = senderId?.toString?.() || senderId;
        // Find chat
        const { Chat } = await import('../models/Chat.js');
        const chat = await Chat.findById(chatIdStr);
        if (!chat) return;
        // Defensive: ensure content is not empty
        if (!content || typeof content !== 'string' || !content.trim()) return;
        // Create new message object
        const newMessage = {
          sender: senderIdStr,
          content,
          timestamp: new Date(),
          readBy: [senderIdStr],
          chatId: chatIdStr,
        };
        // Save message to chat
        chat.messages.push(newMessage);
        chat.lastMessage = newMessage;
        await chat.save();
        // Populate sender for frontend display
        const populatedChat = await Chat.findById(chatIdStr)
          .populate('participants', 'username name email')
          .populate('messages.sender', 'username name');
        const savedMessage = populatedChat.messages[populatedChat.messages.length - 1];
        // Emit to the chat room
        io.to(chatIdStr).emit('new_message', {
          chat: { _id: chatIdStr },
          message: savedMessage
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

    // --- Voice Call Signaling ---
    socket.on('call_user', ({ toUserId, fromUserId, offer }) => {
      const recipientSocket = onlineUsers.get(toUserId);
      if (recipientSocket) {
        io.to(recipientSocket).emit('incoming_call', { fromUserId, offer });
      }
    });

    socket.on('answer_call', ({ toUserId, answer, fromUserId }) => {
      const recipientSocket = onlineUsers.get(toUserId);
      if (recipientSocket) {
        io.to(recipientSocket).emit('call_answered', { answer, fromUserId });
      }
    });

    socket.on('call_connected', ({ toUserId }) => {
      const recipientSocket = onlineUsers.get(toUserId);
      if (recipientSocket) {
        io.to(recipientSocket).emit('call_connected');
      }
    });

    socket.on('ice_candidate', ({ toUserId, candidate }) => {
      const recipientSocket = onlineUsers.get(toUserId);
      if (recipientSocket) {
        io.to(recipientSocket).emit('ice_candidate', { candidate });
      }
    });

    socket.on('end_call', ({ toUserId }) => {
      const recipientSocket = onlineUsers.get(toUserId);
      if (recipientSocket) {
        io.to(recipientSocket).emit('call_ended');
      }
    });

    // Real-time poll, task, and schedule events
    socket.on('new_poll', (payload) => {
      if (payload && payload.chatId) {
        io.to(payload.chatId.toString()).emit('new_poll', payload);
      }
    });
    socket.on('new_task', (payload) => {
      if (payload && payload.chatId) {
        io.to(payload.chatId.toString()).emit('new_task', payload);
      }
    });
    socket.on('new_schedule', (payload) => {
      if (payload && payload.chatId) {
        io.to(payload.chatId.toString()).emit('new_schedule', payload);
      }
    });

    // Real-time task completion and approval events
    socket.on('task_completed', ({ taskId, chatId }) => {
      if (chatId && taskId) {
        io.to(chatId.toString()).emit('task_completed', { taskId });
      }
    });
    socket.on('task_approved', ({ taskId, chatId }) => {
      if (chatId && taskId) {
        io.to(chatId.toString()).emit('task_approved', { taskId });
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