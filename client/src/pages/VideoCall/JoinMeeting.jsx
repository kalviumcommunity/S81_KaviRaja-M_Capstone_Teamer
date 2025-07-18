import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const JoinMeeting = () => {
  const { meetingId } = useParams();
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const res = await axios.get(`/meetings/id/${meetingId}`);
        setMeeting(res.data);
      } catch {
        setError('Meeting not found or already ended.');
      }
      setLoading(false);
    };
    fetchMeeting();
  }, [meetingId]);

  if (loading) return <div className="p-8 text-center">Loading meeting...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!meeting) return null;

  // Here you would render your video call UI, or redirect to a video call provider
  return (
    <div className="p-8 text-center">
      <h2 className="text-2xl font-bold mb-2">Meeting: {meeting.title}</h2>
      <div className="mb-2">Scheduled: {new Date(meeting.scheduledAt).toLocaleString()}</div>
      <div className="mb-2">Duration: {meeting.duration} min</div>
      <div className="mb-2">Description: {meeting.description}</div>
      <div className="mb-2">Created by: {meeting.creator?.name || meeting.creator?.username || meeting.creator}</div>
      <div className="mb-4">Meeting ID: <span className="font-mono">{meeting.meetId}</span></div>
      <div className="mt-6">
        {/* Replace this with your video call UI */}
        <div className="bg-gray-200 p-6 rounded shadow inline-block">Video Call UI goes here</div>
      </div>
    </div>
  );
};

export default JoinMeeting;
