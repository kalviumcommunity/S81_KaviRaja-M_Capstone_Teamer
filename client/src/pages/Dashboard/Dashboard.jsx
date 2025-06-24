import React, { useState } from "react";
import axios from "axios";
import { CallProvider } from "../../context/CallContext";
import ChatBox from "./ChatBox/ChatBox";
import ChatList from "./ChatList/ChatList";

const Dashboard = () => {
  const [selectedChat, setSelectedChat] = useState(null);

  return (
    <CallProvider>
      <div className="flex h-screen w-screen bg-black overflow-hidden">
        <div className="w-[30vw] min-w-[320px] max-w-[420px] h-full border-r border-gray-800 bg-gray-900">
          <ChatList
            onSelectChat={setSelectedChat}
            selectedChatId={selectedChat?.id || selectedChat?._id}
          />
        </div>
        <div className="flex-1 h-full bg-gray-900">
          <ChatBox chat={selectedChat} />
        </div>
      </div>
    </CallProvider>
  );
};

export default Dashboard;