import React, { useState, useEffect } from "react";
import { fetchUnreadChats } from "../../utils/unreadApi";
import { CallProvider } from "../../context/CallContext";
import ChatBox from "./ChatBox/ChatBox";
import ChatList from "./ChatList/ChatList";

const Dashboard = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [unreadChats, setUnreadChats] = useState([]);
  const [showUnreadBanner, setShowUnreadBanner] = useState(false);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const token = localStorage.getItem('token');
        const data = await fetchUnreadChats(token);
        setUnreadChats(Array.isArray(data) ? data : []);
        setShowUnreadBanner(Array.isArray(data) && data.length > 0);
      } catch (e) {
        setUnreadChats([]);
        setShowUnreadBanner(false);
      }
    };
    fetchUnread();
  }, []);

  // Helper to get sender names for unread chats, excluding self
  const getUnreadSenderNames = () => {
    if (!unreadChats.length) return '';
    const userId = selectedChat?.participants?.find?.(p => p._id === selectedChat?.id || p._id === selectedChat?._id)?._id;
    return unreadChats.map(c => {
      const sender = c.participants.find(p => !userId || (p._id !== userId));
      return sender?.name || 'Someone';
    }).join(', ');
  };

  return (
    <CallProvider>
      <div className="flex flex-col h-screen w-screen bg-black overflow-hidden">
        {showUnreadBanner && unreadChats.length > 0 && (
          <div className="bg-yellow-500 text-black text-center py-2 font-semibold">
            You have new messages from: {getUnreadSenderNames()}
          </div>
        )}
        <div className="flex flex-1 min-h-0">
          <div className="w-[30vw] min-w-[320px] max-w-[420px] h-full border-r border-gray-800 bg-gray-900 flex flex-col">
            <ChatList
              onSelectChat={setSelectedChat}
              selectedChatId={selectedChat?.id || selectedChat?._id}
            />
          </div>
          <div className="flex-1 h-full bg-gray-900 flex flex-col">
            <ChatBox chat={selectedChat} />
          </div>
        </div>
      </div>
    </CallProvider>
  );
};

export default Dashboard;