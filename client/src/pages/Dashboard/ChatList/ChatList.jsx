import React, { useState, useEffect } from 'react';
import { Search, Plus, Archive } from 'lucide-react';
import ChatItem from './ChatItem';
import api from '../../../utils/fetchApi';
import { useAuth } from '../../../context/AuthContext';
import { useSocket } from '../../../context/SocketContext';
import { useChat } from '../../../context/ChatContext';
import GroupCreateModal from './GroupCreateModal';
import { getBackendURL } from '../../../utils/fetchApi';

const ChatList = ({ onSelectChat, selectedChatId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const { chats, setChats } = useChat(); // Use global chats from context
  const [showGroupModal, setShowGroupModal] = useState(false);
  const { user } = useAuth();
  const socket = useSocket();
  const { getUnreadCount, markChatAsRead } = useChat();

  // Fetch user's chats from backend on mount
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await api.get('/chat/user-chats');
        setChats(res.data);
      } catch {
        setChats([]);
      }
    };
    // Only fetch if not already loaded
    if (!chats || chats.length === 0) fetchChats();
  }, []);

  // After fetching chats, request online users
  useEffect(() => {
    if (!socket || chats.length === 0) return;
    const userIds = Array.from(new Set(chats.flatMap(c => c.participants.map(p => p._id))));
    socket.emit('get_online_users', userIds, (onlineUserIds = []) => {
      setChats(prevChats =>
        prevChats.map(chat => ({
          ...chat,
          participants: chat.participants.map(p => ({
            ...p,
            isOnline: onlineUserIds.includes(p._id),
          })),
        }))
      );
    });
  }, [socket, chats.length]);

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
      // Use correct backend route for user search
      const res = await api.get(`/auth/search?q=${encodeURIComponent(value)}`);
      // Exclude self and users already in chat list
      const chatUserIds = chats.flatMap(c => c.participants.map(p => p._id)).filter(id => id !== user._id);
      setSearchResults(res.data.filter(u => u._id !== user._id && !chatUserIds.includes(u._id)));
    } catch {
      setSearchResults([]);
    }
    setIsSearching(false);
  };

  // Real-time: listen for new chat creation and avatar updates
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
    // WhatsApp-like: update avatar in searchResults if present
    const handleAvatarUpdate = ({ userId, avatar }) => {
      setSearchResults(prev => prev.map(u => u._id === userId ? { ...u, avatar } : u));
    };
    socket.on('chat_created', handleChatCreated);
    socket.on('user_avatar_updated', handleAvatarUpdate);
    return () => {
      socket.off('chat_created', handleChatCreated);
      socket.off('user_avatar_updated', handleAvatarUpdate);
    };
  }, [socket, user, setChats]);

  // Listen for user_status events (online/offline)
  useEffect(() => {
    if (!socket) return;
    const handleUserStatus = ({ userId, status }) => {
      setChats((prevChats) =>
        prevChats.map((chat) => ({
          ...chat,
          participants: chat.participants.map((p) =>
            p._id === userId ? { ...p, isOnline: status === 'online' } : p
          ),
        }))
      );
    };
    socket.on('user_status', handleUserStatus);
    return () => socket.off('user_status', handleUserStatus);
  }, [socket, setChats]);

  // Add new chat to chat list after creating
  const handleSelectUser = async (u) => {
    const res = await api.post('/chat/create', { participantId: u._id });
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

  // Always use the latest chat object for rendering (for real-time avatar updates)
  const getLatestChat = (chatId) => chats.find(c => c._id === chatId);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="p-4 bg-black flex justify-between items-center">
        <h1 className="text-xl font-semibold text-white">Chats</h1>
      </div>
      {/* Search */}
      <div className="px-4 py-2 bg-black flex items-center gap-2">
        <div className="relative flex-1">
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
                  <img
                    src={u.avatar ? `${u.avatar.startsWith('http') ? '' : getBackendURL()}${u.avatar}?t=${u.avatarUpdatedAt || Date.now()}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random`}
                    alt={u.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span>{u.name} <span className="text-gray-400">({u.username})</span></span>
                </li>
              ))}
            </ul>
          )}
          {isSearching && (
            <div className="absolute left-0 right-0 mt-2 bg-gray-900 border border-gray-800 rounded-lg shadow-lg z-50 p-3 text-white">Searching...</div>
          )}
        </div>
        <button
          className="ml-2 p-2 rounded-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center"
          title="Create Group"
          onClick={() => setShowGroupModal(true)}
        >
          <Plus size={20} />
        </button>
      </div>
      {showGroupModal && (
        <GroupCreateModal
          onClose={() => setShowGroupModal(false)}
          onGroupCreated={chat => {
            setChats(prev => [chat, ...prev]);
            setShowGroupModal(false);
            onSelectChat(chat);
          }}
          existingUsers={chats.flatMap(c => c.participants)}
        />
      )}
  // Chat list
  <div className="flex-1 min-h-0 overflow-y-auto bg-black">
    {filteredChats.length > 0 ? (
      filteredChats.map(chat => {
        const latestChat = getLatestChat(chat._id) || chat;
        const other = latestChat.participants.find(p => p._id !== user._id);
        const unreadCount = getUnreadCount(latestChat._id);
        return (
          <div key={latestChat._id} onClick={() => {
            setSearchTerm('');
            onSelectChat(latestChat);
            markChatAsRead(latestChat._id);
          }}>
            <ChatItem
              chat={{
                ...latestChat,
                name: other?.name || other?.username,
                avatar: other?.avatar,
                avatarUpdatedAt: other?.avatarUpdatedAt,
                isOnline: other?.isOnline,
                lastSeen: other?.lastSeen,
                unreadCount,
              }}
              isSelected={latestChat._id === selectedChatId}
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