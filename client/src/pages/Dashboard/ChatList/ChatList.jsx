import React, { useState } from 'react';
import { Search, Plus, Archive } from 'lucide-react';
import ChatItem from './ChatItem';
import { activeChats, archivedChats } from './dummyData';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

const ChatList = ({ onSelectChat, selectedChatId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const { user } = useAuth();

  const filterChats = (chats) => {
    return chats.filter(
      chat => 
        chat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (chat.lastMessage && chat.lastMessage.text.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const pinnedChats = activeChats.filter(chat => chat.isPinned);
  const unpinnedChats = activeChats.filter(chat => !chat.isPinned);
  const filteredPinnedChats = filterChats(pinnedChats);
  const filteredUnpinnedChats = filterChats(unpinnedChats);
  const filteredArchivedChats = filterChats(archivedChats);
  
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
      const chatUserIds = [...activeChats, ...archivedChats].map(c => c._id || c.id);
      setSearchResults(res.data.filter(u => u._id !== user._id && !chatUserIds.includes(u._id)));
    } catch {
      setSearchResults([]);
    }
    setIsSearching(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 bg-black flex justify-between items-center">
        <h1 className="text-xl font-semibold text-white">Chats</h1>
        <button className="w-9 h-9 rounded-full bg-gray-800 text-white flex items-center justify-center hover:bg-gray-700 transition-colors">
          <Plus size={20} />
        </button>
      </div>
      {/* Search */}
      <div className="px-4 py-2 bg-black">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="bg-gray-800 w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-700 text-white placeholder-gray-400"
            placeholder="Search or start new chat"
            value={searchTerm}
            onChange={handleSearch}
          />
          {/* Show search results dropdown */}
          {searchTerm && searchResults.length > 0 && (
            <ul className="absolute left-0 right-0 mt-2 bg-gray-900 border border-gray-800 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
              {searchResults.map(u => (
                <li
                  key={u._id}
                  className="p-3 hover:bg-gray-800 cursor-pointer text-white flex items-center gap-2"
                  onClick={async () => {
                    // Create or open chat with this user
                    const res = await axios.post('/api/chat/create', { participantId: u._id }, { withCredentials: true });
                    onSelectChat(res.data);
                    setSearchTerm('');
                    setSearchResults([]);
                  }}
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

      {/* Archived chats button */}
      <button
        className="flex items-center px-4 py-3 hover:bg-gray-900 transition-colors bg-black text-white"
        onClick={() => setShowArchived(!showArchived)}
      >
        <Archive size={20} className="text-gray-400 mr-3" />
        <span className="text-gray-300">Archived</span>
        {archivedChats.length > 0 && (
          <span className="ml-auto text-gray-400">{archivedChats.length}</span>
        )}
      </button>
      
      {/* Chat lists */}
      <div className="flex-1 overflow-y-auto bg-black">
        {showArchived ? (
          // Archived chats
          filteredArchivedChats.length > 0 ? (
            filteredArchivedChats.map(chat => (
              <ChatItem
                key={chat.id}
                chat={chat}
                isSelected={chat.id === selectedChatId}
                onClick={() => onSelectChat(chat)}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              No archived chats found
            </div>
          )
        ) : (
          // Active chats
          <>
            {/* Pinned chats */}
            {filteredPinnedChats.length > 0 && (
              <div className="sticky top-0 bg-gray-900 px-4 py-1">
                <span className="text-xs font-medium text-gray-400">PINNED</span>
              </div>
            )}
            {filteredPinnedChats.map(chat => (
              <ChatItem
                key={chat.id}
                chat={chat}
                isSelected={chat.id === selectedChatId}
                onClick={() => onSelectChat(chat)}
              />
            ))}
            
            {/* Regular chats */}
            {filteredPinnedChats.length > 0 && filteredUnpinnedChats.length > 0 && (
              <div className="sticky top-0 bg-gray-900 px-4 py-1">
                <span className="text-xs font-medium text-gray-400">CHATS</span>
              </div>
            )}
            {filteredUnpinnedChats.map(chat => (
              <ChatItem
                key={chat.id}
                chat={chat}
                isSelected={chat.id === selectedChatId}
                onClick={() => onSelectChat(chat)}
              />
            ))}
            
            {/* No results */}
            {filteredPinnedChats.length === 0 && filteredUnpinnedChats.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                No chats found
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChatList;