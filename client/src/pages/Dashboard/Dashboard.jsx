import React, { useState } from "react";
import axios from "axios";
import { CallProvider } from "../../context/CallContext";
import ChatBox from "./ChatBox/ChatBox";
import ChatList from "./ChatList/ChatList";

const Dashboard = () => {
  const [selectedChat, setSelectedChat] = useState(null);

  return (
    <CallProvider>
      <div className="flex h-full">
        <div className="w-1/3 border-r">
          <ChatList
            onSelectChat={setSelectedChat}
            selectedChatId={selectedChat?.id || selectedChat?._id}
          />
        </div>
        <div className="flex-1">
          <ChatBox chat={selectedChat} />
        </div>
      </div>
    </CallProvider>
  );
};

export default Dashboard;