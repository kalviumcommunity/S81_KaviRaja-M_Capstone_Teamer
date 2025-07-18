import { Server } from 'socket.io';
import { User } from '../models/userModel.js';

const configureSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "https://teamerwork.netlify.app",
        "https://s81-kaviraja-m-capstone-teamer-2.onrender.com"
      ],
      credentials: true,
    },
  });

  const onlineUsers = new Map(); // userId -> socket.id
  // Also join a room for each userId for targeted events (like meetings)

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    socket.on('error', (err) => {
      console.error('[Socket.IO] Socket error:', err);
    });
    socket.on('connect_error', (err) => {
      console.error('[Socket.IO] Connect error:', err);
    });

    // Handle user joining
    socket.on('user_join', async (userId) => {
      const idStr = userId?.toString?.() || userId;
      onlineUsers.set(idStr, socket.id);
      socket.userId = idStr;
      socket.join(idStr); // Join a room named by userId for targeted events
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
    // 1:1 Voice Call: call_user -> incoming_call, answer_call -> call_answered, end_call -> call_ended
    socket.on('call_user', ({ toUserId, fromUserId, offer }) => {
      const recipientSocket = onlineUsers.get(toUserId?.toString?.() || toUserId);
      if (recipientSocket) {
        io.to(recipientSocket).emit('incoming_call', { fromUserId, offer });
      }
    });
    socket.on('answer_call', ({ toUserId, answer, fromUserId }) => {
      const recipientSocket = onlineUsers.get(toUserId?.toString?.() || toUserId);
      if (recipientSocket) {
        io.to(recipientSocket).emit('call_answered', { answer, fromUserId });
      }
      // Also notify both users that the call is connected
      const callerSocket = onlineUsers.get(fromUserId?.toString?.() || fromUserId);
      if (callerSocket) {
        io.to(callerSocket).emit('call_connected');
      }
      if (recipientSocket) {
        io.to(recipientSocket).emit('call_connected');
      }
    });
    socket.on('end_call', ({ toUserId, fromUserId }) => {
      const recipientSocket = onlineUsers.get(toUserId?.toString?.() || toUserId);
      const senderSocket = onlineUsers.get(fromUserId?.toString?.() || fromUserId);
      if (recipientSocket) {
        io.to(recipientSocket).emit('call_ended');
      }
      if (senderSocket) {
        io.to(senderSocket).emit('call_ended');
      }
    });
    socket.on('ice_candidate', ({ toUserId, candidate }) => {
      const recipientSocket = onlineUsers.get(toUserId?.toString?.() || toUserId);
      if (recipientSocket) {
        io.to(recipientSocket).emit('ice_candidate', { candidate });
      }
    });

    // --- 1:1 Video Call Signaling (WhatsApp-like) --- 
    socket.on('video-call-request', ({ toUserId, fromUserId, fromUserName, callId }) => {
      const recipientSocket = onlineUsers.get(toUserId);
      if (recipientSocket) {
        io.to(recipientSocket).emit('video-call-request', { fromUserId, fromUserName, callId });
      }
    });

    socket.on('video-call-response', ({ toUserId, fromUserId, accepted, callId }) => {
      const recipientSocket = onlineUsers.get(toUserId);
      if (recipientSocket) {
        io.to(recipientSocket).emit('video-call-response', { accepted, fromUserId, callId });
      }
    });

    socket.on('video-call-cancel', ({ toUserId, fromUserId, callId }) => {
      const recipientSocket = onlineUsers.get(toUserId);
      if (recipientSocket) {
        io.to(recipientSocket).emit('video-call-cancel', { fromUserId, callId });
      }
    });

    // --- Google Meet–like Group Video Call Signaling ---
    // User joins a video call room (meeting)
    socket.on('join-call', ({ callId, userId, name }) => {
      socket.join(callId);
      socket.callId = callId;
      socket.userId = userId; // <-- Fix: track userId on socket
      // Get current room size and user IDs
      const room = io.sockets.adapter.rooms.get(callId);
      const roomSize = room ? room.size : 0;
      const userIds = [];
      if (room) {
        for (const sid of room) {
          const s = io.sockets.sockets.get(sid);
          if (s && s.userId) userIds.push(s.userId);
        }
      }
      // Notify the joining user of the current room size and user IDs
      socket.emit('call-room-info', { callId, roomSize, userIds });
      // Notify all others in the room about the new participant
      socket.to(callId).emit('user-joined', { userId, name });
    });

    // User leaves a video call room
    socket.on('leave-call', ({ callId, userId }) => {
      socket.leave(callId);
      socket.to(callId).emit('user-left', { userId });
    });

    // WebRTC signaling: offer/answer/ice
    socket.on('signal', ({ callId, to, from, data }) => {
      // Relay the signal directly to the intended peer using their socket ID
      const recipientSocket = onlineUsers.get(to);
      if (recipientSocket) {
        io.to(recipientSocket).emit('signal', { to, from, data });
      }
    });

    // In-meeting chat relay
    socket.on('call-chat-message', ({ callId, sender, text }) => {
      // Add server timestamp
      const timestamp = new Date().toISOString();
      io.to(callId).emit('call-chat-message', { sender, text, timestamp });
    });

    // Real-time poll, task, and schedule events
    // Polls: use REST API and DB only. Socket only notifies clients to re-fetch.
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

    // Handle request for user names (for video call display)
    socket.on('request-user-names', async ({ userIds }) => {
      try {
        // Query the user database for these IDs
        const users = await User.find({ _id: { $in: userIds } }, 'name');
        const names = {};
        users.forEach(u => { names[u._id.toString()] = u.name; });
        socket.emit('user-names', { names });
      } catch (err) {
        console.error('Error fetching user names:', err);
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