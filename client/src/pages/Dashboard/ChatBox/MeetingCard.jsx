import React from 'react';

const MeetingCard = ({ meeting, currentUser, onJoin, alignRight }) => {
  const userId = String(currentUser?._id || currentUser?.id);
  const isInvited = Array.isArray(meeting.participants) && meeting.participants.some(
    p => String(typeof p === 'string' ? p : p._id) === userId
  );
  const creatorId = meeting.creator?._id || meeting.creator?.id || meeting.creator;
  const creatorName = meeting.creator?.name || meeting.creator?.username || meeting.creator || 'Unknown';
  return (
    <div className={`flex ${alignRight ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[70%] rounded-2xl px-6 py-4 shadow-xl border-2 ${alignRight ? 'bg-gradient-to-r from-blue-700 to-blue-500 text-white ml-auto border-blue-400' : 'bg-gradient-to-r from-gray-900 to-gray-700 text-gray-100 mr-auto border-gray-600'}`}
        style={{ borderTopRightRadius: alignRight ? 0 : 18, borderTopLeftRadius: !alignRight ? 0 : 18 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-block bg-blue-600 text-white rounded-full px-3 py-1 text-xs font-bold shadow">Meet</span>
          <span className="font-bold text-lg truncate tracking-wide">{meeting.title || 'Meeting'}</span>
        </div>
        <div className="flex items-center gap-2 text-xs opacity-90 mb-2">
          <span className="font-mono bg-gray-800/60 px-2 py-0.5 rounded text-blue-200">{new Date(meeting.scheduledAt).toLocaleString()}</span>
          <span className="mx-1">•</span>
          <span className="bg-blue-900/60 px-2 py-0.5 rounded text-blue-200">{meeting.duration || 30} min</span>
        </div>
        <div className="text-sm mb-2 italic opacity-95 bg-gray-700/40 px-3 py-1 rounded">{meeting.description || 'No description'}</div>
        <div className="flex items-center justify-between text-xs opacity-90 mb-2">
          <span>By: <span className="font-semibold text-blue-200">{creatorName}</span></span>
          <span>ID: <span className="font-mono text-blue-300">{meeting.meetId}</span></span>
        </div>
        {isInvited ? (
          <button
            className="mt-3 bg-gradient-to-r from-green-500 to-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:from-green-600 hover:to-blue-700 text-sm font-bold transition border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            onClick={() => onJoin(meeting)}
          >
            <span role="img" aria-label="video" className="mr-1">🎥</span> Join Now
          </button>
        ) : (
          <div className="text-xs text-blue-200 mt-3 italic">Not invited? Join with Meeting ID above.</div>
        )}
      </div>
    </div>
  );
};

export default MeetingCard;
