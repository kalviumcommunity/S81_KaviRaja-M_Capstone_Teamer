import React, { useState } from 'react';
import axios from 'axios';
import api from '../../../utils/fetchApi';

const CreateMeeting = ({ chat, currentUser, onMeetingCreated, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [duration, setDuration] = useState(30);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const chatId = chat._id || chat.id;
    // Ensure all participant IDs are strings
    const participants = selectedMembers.map(String);
    const body = {
      title,
      description,
      scheduledAt,
      duration,
      participants,
      creator: String(currentUser._id || currentUser.id),
      chatId: String(chatId)
    };
    try {
      const token = localStorage.getItem('token');
      const res = await api.post('/api/meetings', body, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setTitle('');
      setDescription('');
      setScheduledAt('');
      setDuration(30);
      setSelectedMembers([]);
      if (onMeetingCreated) onMeetingCreated(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create meeting');
      console.error('[DEBUG] Meeting creation error:', err);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="font-bold text-blue-700 text-lg mb-2">Schedule a Meeting</div>
      <input className="p-1 border rounded" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />
      <textarea className="p-1 border rounded" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
      <input className="p-1 border rounded" type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} required />
      <input className="p-1 border rounded" type="number" min={5} max={240} value={duration} onChange={e => setDuration(Number(e.target.value))} required placeholder="Duration (min)" />
      <div>
        <div className="font-semibold text-sm mb-1">Select Members</div>
        <div className="flex flex-wrap gap-2">
          {chat.participants.map(p => (
            <label key={p._id || p.id} className="flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                value={p._id || p.id}
                checked={selectedMembers.includes(p._id || p.id)}
                onChange={e => {
                  const id = p._id || p.id;
                  setSelectedMembers(selectedMembers =>
                    e.target.checked
                      ? [...selectedMembers, id]
                      : selectedMembers.filter(m => m !== id)
                  );
                }}
              />
              {p.name || p.username || 'User'}
            </label>
          ))}
        </div>
      </div>
      {error && <div className="text-red-500 text-xs">{error}</div>}
      <div className="flex gap-2 mt-2">
        <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700" disabled={loading}>{loading ? 'Scheduling...' : 'Create Meeting'}</button>
        <button type="button" className="bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400" onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
};

export default CreateMeeting;
