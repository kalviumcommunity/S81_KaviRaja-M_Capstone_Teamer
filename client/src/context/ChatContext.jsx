import React, { createContext, useContext, useState, useEffect } from "react";
import { useSocket } from "./SocketContext";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const socket = useSocket();

  // Example: Listen for messages
  useEffect(() => {
    if (!socket) return;
    const handleMessage = (msg) => setMessages((prev) => [...prev, msg]);
    socket.on("message", handleMessage);
    return () => socket.off("message", handleMessage);
  }, [socket]);

  // Optionally, show nothing until socket is ready
  if (!socket) return null;

  return (
    <ChatContext.Provider value={{ messages, setMessages, socket }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);