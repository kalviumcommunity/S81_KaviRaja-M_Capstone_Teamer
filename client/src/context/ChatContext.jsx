
import React, { createContext, useContext, useState, useEffect } from "react";
import { useSocket } from "./SocketContext";
import { useAuth } from "./AuthContext";
import api from "../utils/fetchApi";



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
        return {
          ...prev,
          [chatId]: [...(prev[chatId] || []), msg],
        };
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

  const loadMessages = async (chatId) => {
    try {
      const res = await api.get(`/chat/${chatId}/messages`);
      let msgs = res.data.map(m => ({ ...m, chatId: m.chatId || chatId }));
      setMessagesByChat((prev) => ({
        ...prev,
        [chatId]: msgs,
      }));
    } catch (err) {
      // If backend fails, keep showing in-memory state
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