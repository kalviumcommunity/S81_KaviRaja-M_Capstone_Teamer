import React, { useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

const GroupCreateModal = ({ onClose, onGroupCreated, existingUsers }) => {
  const [groupName, setGroupName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (!value.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await axios.get(`/api/users/search?q=${encodeURIComponent(value)}`, { withCredentials: true });
      setSearchResults(res.data.filter(u => !selectedUsers.some(su => su._id === u._id)));
    } catch {
      setSearchResults([]);
    }
  };

  const handleAddUser = (user) => {
    setSelectedUsers(prev => [...prev, user]);
    setSearchResults(prev => prev.filter(u => u._id !== user._id));
  };

  const handleRemoveUser = (user) => {
    setSelectedUsers(prev => prev.filter(u => u._id !== user._id));
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) {
      setError('Group name and at least one member required.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await axios.post('/api/chat/create-group', {
        name: groupName,
        memberIds: selectedUsers.map(u => u._id),
      }, { withCredentials: true });
      onGroupCreated(res.data);
    } catch (err) {
      setError('Failed to create group.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white"><X size={20} /></button>
        <h2 className="text-xl text-white mb-4">Create Group</h2>
        <input
          type="text"
          className="w-full mb-3 px-3 py-2 rounded bg-gray-800 text-white focus:outline-none"
          placeholder="Group name"
          value={groupName}
          onChange={e => setGroupName(e.target.value)}
        />
        <input
          type="text"
          className="w-full mb-2 px-3 py-2 rounded bg-gray-800 text-white focus:outline-none"
          placeholder="Search users to add"
          value={searchTerm}
          onChange={handleSearch}
        />
        {searchResults.length > 0 && (
          <ul className="mb-2 max-h-32 overflow-y-auto bg-gray-800 rounded">
            {searchResults.map(u => (
              <li key={u._id} className="p-2 flex items-center gap-2 hover:bg-gray-700 cursor-pointer" onClick={() => handleAddUser(u)}>
                <img src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random`} alt={u.name} className="w-6 h-6 rounded-full" />
                <span className="text-white">{u.name} <span className="text-gray-400">({u.username})</span></span>
              </li>
            ))}
          </ul>
        )}
        {selectedUsers.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {selectedUsers.map(u => (
              <span key={u._id} className="bg-green-700 text-white px-2 py-1 rounded flex items-center gap-1">
                {u.name}
                <button onClick={() => handleRemoveUser(u)} className="ml-1 text-xs">×</button>
              </span>
            ))}
          </div>
        )}
        {error && <div className="text-red-400 mb-2">{error}</div>}
        <button
          className="w-full py-2 rounded bg-green-600 hover:bg-green-700 text-white font-semibold mt-2"
          onClick={handleCreateGroup}
          disabled={isLoading}
        >
          {isLoading ? 'Creating...' : 'Create Group'}
        </button>
      </div>
    </div>
  );
};

export default GroupCreateModal;
