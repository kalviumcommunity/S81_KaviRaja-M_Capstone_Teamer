import React from 'react';
import { Check, CheckCheck, Pin } from 'lucide-react';

const ChatItem = ({ chat, isSelected, onClick }) => {
  const {
    avatar,
    name,
    lastMessage,
    timestamp,
    unreadCount,
    isGroup,
    isTyping,
    isPinned,
    memberCount,
    lastSeen,
    isOnline
  } = chat;
  
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div 
      className={`flex items-center p-3 cursor-pointer hover:bg-gray-900 transition-colors duration-200 ${
        isSelected ? 'bg-gray-900' : 'bg-black'
      }`}
      onClick={onClick}
    >
      {/* Avatar */}
      <div className="relative">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
          <img 
            src={avatar} 
            alt={name} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
            }}
          />
        </div>
        {isOnline && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-gray-200 rounded-full border-2 border-black" />
        )}
        {isGroup && (
          <div className="absolute bottom-0 right-0 w-5 h-5 bg-gray-800 rounded-full border-2 border-black flex items-center justify-center">
            <span className="text-[8px] font-bold text-white">{memberCount}</span>
          </div>
        )}
      </div>
      
      {/* Chat details */}
      <div className="ml-3 flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-1">
            {isPinned && <Pin size={14} className="text-gray-400" />}
            <h3 className="font-medium text-white truncate">{name}</h3>
          </div>
          <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
            {lastMessage && formatTime(timestamp)}
          </span>
        </div>
        
        <div className="flex justify-between items-center mt-1">
          <div className="flex items-center space-x-1 min-w-0">
            {isTyping ? (
              <div className="text-gray-300 font-medium flex items-center">
                <span className="animate-pulse">typing</span>
                <span className="animate-[bounce_1.4s_infinite] delay-100">.</span>
                <span className="animate-[bounce_1.4s_infinite] delay-200">.</span>
                <span className="animate-[bounce_1.4s_infinite] delay-300">.</span>
              </div>
            ) : (
              <p className="text-sm text-gray-400 truncate">
                {lastMessage ? (
                  <>
                    {isGroup && <span className="font-medium">{lastMessage.sender}: </span>}
                    {lastMessage.text}
                  </>
                ) : (
                  <span className="italic text-gray-500">No messages yet</span>
                )}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-1 ml-2">
            {lastMessage && !unreadCount && (
              <div className="flex items-center">
                {lastMessage.status === 'read' ? (
                  <CheckCheck size={16} className="text-gray-400" />
                ) : lastMessage.status === 'delivered' ? (
                  <CheckCheck size={16} className="text-gray-500" />
                ) : lastMessage.status === 'sent' ? (
                  <Check size={16} className="text-gray-500" />
                ) : null}
              </div>
            )}
            
            {unreadCount > 0 && (
              <div className="bg-gray-700 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </div>
            )}
          </div>
        </div>
        
        {/* Last seen / Online status */}
        {!isGroup && !isTyping && !unreadCount && lastSeen && (
          <p className="text-xs text-gray-500 mt-0.5">
            {lastSeen === 'online' ? 'online' : `last seen ${lastSeen}`}
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatItem;