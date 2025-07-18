import { useSocket } from '../../../context/SocketContext';
  const socket = useSocket();
  // Listen for real-time meeting_created events
  useEffect(() => {
    if (!socket || !user) return;
    const handler = (meeting) => {
      console.log('[DEBUG] meeting_created event received:', meeting);
      // Always re-fetch meetings from backend for consistency
      fetchMeetings();
    };
    socket.on('meeting_created', handler);
    return () => {
      socket.off('meeting_created', handler);
    };
  }, [socket, user]);
import React, { useState, useEffect } from 'react';
import MeetingCreate from './MeetingCreate';
import MeetingList from './MeetingList';
import { useAuth } from '../../../context/AuthContext';
import { useSocket } from '../../../context/SocketContext';

const MeetingsPage = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // TODO: Replace with actual chat selection logic if needed
  const [chatId, setChatId] = useState(null); // Set this from context or selection

  // Fetch meetings for the user
  const fetchMeetings = async () => {
    if (!user?._id && !user?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/meetings/user/${user._id || user.id}`);
      const data = await res.json();
      setMeetings(data);
      setError('');
    } catch (e) {
      setError('Failed to load meetings');
    }
    setLoading(false);
  };

  // Initial fetch
  React.useEffect(() => {
    fetchMeetings();
    // eslint-disable-next-line
  }, [user]);

  // When a meeting is created, update the list immediately
  const handleMeetingCreated = (newMeeting) => {
    setMeetings(prev => [newMeeting, ...prev]);
  };


  return (
    <div className="p-4">
      {/* If chatId is not set, show a message or a chat selector */}
      {!chatId ? (
        <div className="text-red-400 mb-4">Please select a chat to schedule a meeting.</div>
      ) : (
        <MeetingCreate currentUser={user} onMeetingCreated={handleMeetingCreated} chatId={chatId} />
      )}
      <MeetingList currentUser={user} meetings={meetings} loading={loading} error={error} />
    </div>
  );
};

export default MeetingsPage;
