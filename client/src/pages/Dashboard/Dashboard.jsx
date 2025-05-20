import React, { useState } from 'react';
import ChatList from './ChatList/ChatList';
import ChatBox from './ChatBox/ChatBox';
import { MessageCircle } from 'lucide-react';

const Dashboard = () => {
  const [selectedChat, setSelectedChat] = useState(null);

  return (
    <div className="flex h-screen bg-black">
      {/* Left sidebar - Chat list */}
      <div className="w-80 min-w-[320px] bg-black border-r border-gray-800">
        <ChatList onSelectChat={setSelectedChat} selectedChatId={selectedChat?.id} />
      </div>

      {/* Main content - Chat box */}
      <div className="flex-1 bg-gray-900">
        {selectedChat ? (
          <ChatBox chat={selectedChat} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mb-6">
              <MessageCircle size={40} className="text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">Welcome to TeamChat</h2>
            <p className="text-gray-400">Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;