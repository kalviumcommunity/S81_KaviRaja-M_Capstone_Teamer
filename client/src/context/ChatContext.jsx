
import React, { createContext, useContext, useState, useEffect } from "react";
import { useSocket } from "./SocketContext";
import { useAuth } from "./AuthContext";
import axios from "axios";



// Helper to update avatar in all messages
function updateAvatarInMessages(messagesByChat, userId, avatar, avatarUpdatedAt) {
  const updated = {};
  for (const chatId in messagesByChat) {
    updated[chatId] = (messagesByChat[chatId] || []).map(msg => {
      if (msg.senderId === userId) {
        return { ...msg, avatar, avatarUpdatedAt };
      }
      return msg;
    });
  }
  return updated;
}

// Helper to update avatar in all chat participants
function updateAvatarInChats(chats, userId, avatar, avatarUpdatedAt) {
  return chats.map(chat => ({
    ...chat,
    participants: chat.participants.map(p =>
      p._id === userId ? { ...p, avatar, avatarUpdatedAt } : p
    )
  }));
}

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  // Store all messages by chatId
  const [messagesByChat, setMessagesByChat] = useState({});
  // Store all chats globally for real-time updates
  const [chats, setChats] = useState([]);
  const socket = useSocket();
  const { user, setUser } = useAuth();
  // Listen for avatar updates from other users (WhatsApp-like)
  useEffect(() => {
    if (!socket) return;
    const handleAvatarUpdate = async ({ userId, avatar, avatarUpdatedAt }) => {
      // If it's me, update my context user
      if (user && user._id === userId) {
        setUser(prev => ({ ...prev, avatar, avatarUpdatedAt }));
      }
      // Update avatar in all chat participants
      setChats(prev => updateAvatarInChats(prev, userId, avatar, avatarUpdatedAt));
      // Update avatar in all chat messages
      setMessagesByChat(prev => updateAvatarInMessages(prev, userId, avatar, avatarUpdatedAt));
      // Force refetch all chats to ensure state is up to date everywhere
      try {
        const res = await axios.get('/api/chat/user-chats');
        setChats(res.data);
      } catch {}
    };
    socket.on('user_avatar_updated', handleAvatarUpdate);
    return () => socket.off('user_avatar_updated', handleAvatarUpdate);
  }, [socket, user, setUser]);

  // Track last read message index per chat in localStorage
  const getLastReadIndex = (chatId) => {
    const key = `lastRead_${chatId}_${user?._id}`;
    const idx = localStorage.getItem(key);
    return idx ? parseInt(idx, 10) : -1;
  };

  const setLastReadIndex = (chatId, idx) => {
    const key = `lastRead_${chatId}_${user?._id}`;
    localStorage.setItem(key, idx);
  };

  // Mark all messages as read for a chat (call this when opening a chat)
  const markChatAsRead = (chatId) => {
    const msgs = messagesByChat[chatId] || [];
    if (msgs.length > 0) {
      setLastReadIndex(chatId, msgs.length - 1);
    }
  };

  // Get unread count for a chat
  const getUnreadCount = (chatId) => {
    const msgs = messagesByChat[chatId] || [];
    const lastRead = getLastReadIndex(chatId);
    return msgs.length - (lastRead + 1);
  };

  // On mount, hydrate messagesByChat from localStorage for all chats
  useEffect(() => {
    const allMessages = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('messages_')) {
        const chatId = key.replace('messages_', '');
        try {
          allMessages[chatId] = JSON.parse(localStorage.getItem(key));
        } catch (e) {
          allMessages[chatId] = [];
        }
      }
    }
    if (Object.keys(allMessages).length > 0) {
      setMessagesByChat(allMessages);
    }
  }, []);
  // Emit user_join after socket connects
  useEffect(() => {
    if (socket && user?._id) {
      socket.emit("user_join", user._id);
    }
  }, [socket, user]);

  // Listen for new_message events and persist per-chat
  useEffect(() => {
    if (!socket) return;
    const handleNewMessage = (payload) => {
      let msg = payload.message || payload;
      if (!msg.chatId && payload.chat && payload.chat._id) {
        msg.chatId = payload.chat._id;
      }
      setMessagesByChat((prev) => {
        const chatId = msg.chatId;
        const updated = {
          ...prev,
          [chatId]: [...(prev[chatId] || []), msg],
        };
        // Persist to localStorage for this chat
        localStorage.setItem(`messages_${chatId}`, JSON.stringify(updated[chatId]));
        return updated;
      });
    };
    socket.on("new_message", handleNewMessage);
    return () => socket.off("new_message", handleNewMessage);
  }, [socket]);

  // Provide a sendMessage function
  const sendMessage = (chatId, content) => {
    if (socket && user?._id) {
      socket.emit("sendMessage", {
        chatId,
        content,
        senderId: user._id,
        timestamp: new Date().toISOString(),
      });
    }
  };

  // Load messages for a chat: show cached instantly, then fetch fresh
  const loadMessages = async (chatId, token) => {
    // Show cached messages instantly
    const cached = localStorage.getItem(`messages_${chatId}`);
    console.log('[ChatContext] loadMessages: cached for', chatId, cached);
    setMessagesByChat((prev) => ({
      ...prev,
      [chatId]: cached ? JSON.parse(cached) : [],
    }));
    // Then fetch fresh from backend
    try {
      const res = await axios.get(`/api/chat/${chatId}/messages`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      let msgs = res.data.map(m => ({ ...m, chatId: m.chatId || chatId }));
      console.log('[ChatContext] loadMessages: backend for', chatId, msgs);
      // Only update cache if backend returns messages
      if (Array.isArray(msgs) && msgs.length > 0) {
        setMessagesByChat((prev) => ({
          ...prev,
          [chatId]: msgs,
        }));
        localStorage.setItem(`messages_${chatId}`, JSON.stringify(msgs));
        console.log('[ChatContext] loadMessages: cache updated for', chatId, msgs);
      } else {
        console.log('[ChatContext] loadMessages: backend empty, cache NOT overwritten for', chatId);
      }
    } catch (err) {
      // If backend fails, keep showing cached
    }
  };

  // No need for lastChatId logic; each chat loads its own cache

  // Helper: get messages for a specific chat
  const getMessages = (chatId) => messagesByChat[chatId] || [];

  return (
    <ChatContext.Provider
      value={{
        getMessages,
        sendMessage,
        socket,
        loadMessages,
        messagesByChat, // for advanced use
        getUnreadCount,
        markChatAsRead,
        chats,
        setChats,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);