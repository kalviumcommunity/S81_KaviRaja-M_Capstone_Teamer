import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MeetingList = ({ currentUser, meetings, loading, error }) => {
  const now = new Date();
  return (
    <div className="max-w-2xl mx-auto mt-6">
      <h2 className="text-xl font-bold mb-4 text-white">Your Meetings</h2>
      {loading && <div className="text-gray-400">Loading...</div>}
      {error && <div className="text-red-400">{error}</div>}
      {meetings.length === 0 && !loading && <div className="text-gray-400">No meetings found.</div>}
      <div className="space-y-4">
        {meetings.map(meeting => {
          const scheduled = new Date(meeting.scheduledAt);
          // Only show join button to invited users
          const userId = currentUser?._id || currentUser?.id;
          const isInvited = Array.isArray(meeting.participants) && meeting.participants.some(
            p => (typeof p === 'string' ? p : p._id) === userId
          );
          const canJoin =
            isInvited &&
            now >= new Date(scheduled.getTime() - 10 * 60000) &&
            now <= new Date(scheduled.getTime() + 10 * 60000) &&
            meeting.status !== 'ended';
          return (
            <div key={meeting.meetId} className="bg-gray-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-lg font-semibold text-white">{meeting.title || 'Untitled Meeting'}</div>
                <div className="text-gray-400 text-sm mb-1">{scheduled.toLocaleString()}</div>
                <div className="flex -space-x-2 mb-1">
                  {Array.isArray(meeting.participants) && meeting.participants.map((p, i) => (
                    <span key={p._id || p} className="inline-block w-7 h-7 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center border-2 border-gray-900">
                      {p.name ? p.name[0] : (typeof p === 'string' ? p[0] : '?')}
                    </span>
                  ))}
                </div>
              </div>
              {isInvited && (
                <button
                  className={`mt-2 md:mt-0 bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50`}
                  disabled={!canJoin}
                  onClick={() => window.location.href = `/video-call/${meeting.meetId}`}
                >
                  {canJoin ? 'Join' : meeting.status === 'ended' ? 'Ended' : 'Not Open Yet'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MeetingList;
