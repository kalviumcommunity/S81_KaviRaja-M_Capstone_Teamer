import React, { useState } from 'react';
import axios from 'axios';
import api from '../../../utils/fetchApi';

const JoinMeetingById = ({ onJoin }) => {
  const [meetId, setMeetId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      // Try to join the meeting (will check invitation and time)
      await api.post(`/api/meetings/join/${meetId}`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      onJoin(meetId);
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setError('You are not invited to this meeting or it is not open yet.');
      } else if (err.response && err.response.status === 404) {
        setError('Meeting not found.');
      } else {
        setError('Unable to join meeting.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleJoin} className="flex flex-col gap-2 p-4 bg-gray-900 rounded-lg shadow max-w-xs mx-auto mt-6">
      <label className="text-white font-semibold">Join a Meeting by ID</label>
      <input
        type="text"
        className="p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none"
        placeholder="Enter Meeting ID"
        value={meetId}
        onChange={e => setMeetId(e.target.value)}
        required
      />
      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 font-semibold"
        disabled={loading}
      >
        {loading ? 'Joining...' : 'Join Meet'}
      </button>
      {error && <div className="text-red-400 text-xs mt-1">{error}</div>}
    </form>
  );
};

export default JoinMeetingById;
