import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../../../utils/fetchApi';

const MeetingCreate = ({ currentUser, onMeetingCreated, chatId }) => {
  const [users, setUsers] = useState([]);
  const [title, setTitle] = useState('');
  const [participants, setParticipants] = useState([]);
  const [scheduledAt, setScheduledAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/users')
      .then(res => setUsers(res.data))
      .catch(() => setUsers([]));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (!chatId) {
      setError('Chat is required to schedule a meeting.');
      setLoading(false);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await api.post('/meetings', {
        title,
        participants: participants.map(String),
        scheduledAt,
        creator: String(currentUser?._id || currentUser?.id),
        chatId: String(chatId)
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setTitle('');
      setParticipants([]);
      setScheduledAt('');
      if (onMeetingCreated) onMeetingCreated(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create meeting');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-4 rounded-xl max-w-md mx-auto mt-4">
      <h2 className="text-lg font-bold mb-2 text-white">Create Meeting</h2>
      <input
        className="w-full mb-2 p-2 rounded"
        type="text"
        placeholder="Title (optional)"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <label className="block text-gray-300 mb-1">Participants</label>
      <select
        className="w-full mb-2 p-2 rounded"
        multiple
        value={participants}
        onChange={e => setParticipants(Array.from(e.target.selectedOptions, o => o.value))}
      >
        {users.filter(u => u._id !== (currentUser?._id || currentUser?.id)).map(u => (
          <option key={u._id} value={u._id}>{u.name || u.username}</option>
        ))}
      </select>
      <label className="block text-gray-300 mb-1">Date & Time</label>
      <input
        className="w-full mb-2 p-2 rounded"
        type="datetime-local"
        value={scheduledAt}
        onChange={e => setScheduledAt(e.target.value)}
        required
      />
      {error && <div className="text-red-400 mb-2">{error}</div>}
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        type="submit"
        disabled={loading || !chatId}
      >
        {loading ? 'Creating...' : 'Create Meeting'}
      </button>
    </form>
  );
};

export default MeetingCreate;
