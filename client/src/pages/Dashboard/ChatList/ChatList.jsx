import React, { useState, useEffect } from 'react';
import { Search, Plus, Archive } from 'lucide-react';
import ChatItem from './ChatItem';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { useSocket } from '../../../context/SocketContext';

const ChatList = ({ onSelectChat, selectedChatId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [chats, setChats] = useState([]); // Real chat list from backend
  const { user } = useAuth();
  const socket = useSocket();

  // Fetch user's chats from backend on mount
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await axios.get('/api/chat/user-chats', { withCredentials: true });
        setChats(res.data);
      } catch {
        setChats([]);
      }
    };
    fetchChats();
  }, []);

  // Search users from backend
  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.trim().length === 0) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    try {
      const res = await axios.get(`/api/users/search?q=${encodeURIComponent(value)}`, { withCredentials: true });
      // Exclude self and users already in chat list
      const chatUserIds = chats.flatMap(c => c.participants.map(p => p._id)).filter(id => id !== user._id);
      setSearchResults(res.data.filter(u => u._id !== user._id && !chatUserIds.includes(u._id)));
    } catch {
      setSearchResults([]);
    }
    setIsSearching(false);
  };

  // Real-time: listen for new chat creation
  useEffect(() => {
    if (!socket) return;
    const handleChatCreated = (chat) => {
      // Only add chat if current user is a participant
      if (chat.participants.some(p => p._id === user._id)) {
        setChats((prev) => {
          const exists = prev.find(c => c._id === chat._id);
          return exists ? prev : [chat, ...prev];
        });
      }
    };
    socket.on('chat_created', handleChatCreated);
    return () => socket.off('chat_created', handleChatCreated);
  }, [socket, user]);

  // Add new chat to chat list after creating
  const handleSelectUser = async (u) => {
    const res = await axios.post('/api/chat/create', { participantId: u._id }, { withCredentials: true });
    // Emit socket event for real-time chat creation
    if (socket) {
      socket.emit('chat_created', res.data);
    }
    setChats((prev) => {
      const exists = prev.find(c => c._id === res.data._id);
      return exists ? prev : [res.data, ...prev];
    });
    onSelectChat(res.data);
    setSearchTerm('');
    setSearchResults([]);
  };

  // Filter chats by search term (for chat list, not user search)
  const filteredChats = chats.filter(chat => {
    const other = chat.participants.find(p => p._id !== user._id);
    return (
      other?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      other?.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 bg-black flex justify-between items-center">
        <h1 className="text-xl font-semibold text-white">Chats</h1>
      </div>
      {/* Search */}
      <div className="px-4 py-2 bg-black">
        <div className="relative">
          <input
            type="text"
            className="bg-gray-800 w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-700 text-white placeholder-gray-400"
            placeholder="Search users or chats"
            value={searchTerm}
            onChange={handleSearch}
          />
          {/* Show user search results dropdown */}
          {searchTerm && searchResults.length > 0 && (
            <ul className="absolute left-0 right-0 mt-2 bg-gray-900 border border-gray-800 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
              {searchResults.map(u => (
                <li
                  key={u._id}
                  className="p-3 hover:bg-gray-800 cursor-pointer text-white flex items-center gap-2"
                  onClick={() => handleSelectUser(u)}
                >
                  <img src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random`} alt={u.name} className="w-8 h-8 rounded-full mr-2" />
                  <span>{u.name} <span className="text-gray-400">({u.username})</span></span>
                </li>
              ))}
            </ul>
          )}
          {isSearching && (
            <div className="absolute left-0 right-0 mt-2 bg-gray-900 border border-gray-800 rounded-lg shadow-lg z-50 p-3 text-white">Searching...</div>
          )}
        </div>
      </div>
      {/* Chat list */}
      <div className="flex-1 overflow-y-auto bg-black">
        {filteredChats.length > 0 ? (
          filteredChats.map(chat => {
            const other = chat.participants.find(p => p._id !== user._id);
            return (
              <div key={chat._id} onClick={() => onSelectChat(chat)}>
                <ChatItem
                  chat={{
                    ...chat,
                    name: other?.name || other?.username,
                    avatar: other?.avatar,
                    isOnline: other?.isOnline,
                    lastSeen: other?.lastSeen,
                  }}
                  isSelected={chat._id === selectedChatId}
                  onClick={() => onSelectChat(chat)}
                />
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-400">No chats found</div>
        )}
      </div>
    </div>
  );
};

export default ChatList;