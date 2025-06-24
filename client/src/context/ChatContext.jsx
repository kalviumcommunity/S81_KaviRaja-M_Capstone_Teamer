import React, { createContext, useContext, useState, useEffect } from "react";
import { useSocket } from "./SocketContext";
import { useAuth } from "./AuthContext";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const socket = useSocket();
  const { user } = useAuth();

  // Emit user_join after socket connects
  useEffect(() => {
    if (socket && user?._id) {
      socket.emit("user_join", user._id);
    }
  }, [socket, user]);

  // Listen for new_message events
  useEffect(() => {
    if (!socket) return;
    const handleNewMessage = (payload) => {
      // Extract the message object from the payload
      const msg = payload.message || payload;
      setMessages((prev) => [...prev, msg]);
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

  return (
    <ChatContext.Provider value={{ messages, setMessages, sendMessage, socket }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);