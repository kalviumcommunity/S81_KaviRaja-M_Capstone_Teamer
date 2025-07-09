import React from 'react';
import { BarChart2, Clock } from 'lucide-react';

const Poll = ({ poll, onVote, currentUser }) => {
  // Defensive: ensure options and votes are always arrays
  // Defensive: ensure poll, poll.options, poll.members, poll.creator are always defined
  if (!poll || typeof poll !== 'object') return null;
  const options = Array.isArray(poll.options) ? poll.options : [];
  const members = Array.isArray(poll.members) ? poll.members : [];
  const creatorName = poll.creator && poll.creator.name ? poll.creator.name : 'Unknown';
  const hasVoted = options.some(option => 
    Array.isArray(option.votes) && option.votes.includes(currentUser?.id)
  );

  const timeLeft = () => {
    if (!poll.expiresAt) return null;
    const now = new Date();
    const expiry = new Date(poll.expiresAt);
    if (now > expiry) return 'Expired';
    const diff = expiry - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return `${hours} hours left`;
  };
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-semibold text-lg">{poll.question || 'No question'}</h4>
          <p className="text-sm text-gray-400">Created by {creatorName}</p>
        </div>
        {poll.expiresAt && (
          <div className="flex items-center text-sm text-gray-400">
            <Clock className="w-4 h-4 mr-1" />
            {timeLeft()}
          </div>
        )}
      </div>

      <div className="space-y-3">
        {options.length > 0 ? options.map((option, index) => (
          <button
            key={option.id || option.text || index}
            onClick={() => !hasVoted && onVote && poll.id && onVote(poll.id, index)}
            disabled={hasVoted}
            className={`w-full text-left p-3 rounded-lg transition-colors ${
              hasVoted ? 'bg-gray-700' : 'hover:bg-gray-700'
            }`}
          >
            <div className="flex justify-between mb-1">
              <span>{option.text || 'No text'}</span>
              <span>{Array.isArray(option.votes) ? option.votes.length : 0} votes</span>
            </div>

            <div className="relative h-2 bg-gray-600 rounded">
              <div
                className="absolute h-full bg-blue-500 rounded"
                style={{
                  width: `${(Array.isArray(option.votes) && poll.totalVotes ? (option.votes.length / poll.totalVotes) * 100 : 0)}%`
                }}
              />
            </div>

            {poll.showVoters && Array.isArray(option.votes) && option.votes.length > 0 && (
              <div className="mt-2 text-sm text-gray-400">
                Voted: {option.votes
                  .map(vote => members.find(m => m.id === vote)?.name || 'Unknown')
                  .join(', ')}
              </div>
            )}
          </button>
        )) : <div className="text-gray-400">No options available</div>}
      </div>

      {!hasVoted && (
        <p className="mt-4 text-sm text-gray-400">
          Click an option to cast your vote
        </p>
      )}

      <div className="mt-4 text-sm text-gray-400">
        <p>Total votes: {poll.totalVotes || 0}</p>
        <p>
          Not voted: {members.length > 0 && options.length > 0
            ? members
                .filter(m => !options.some(o => Array.isArray(o.votes) && o.votes.includes(m.id)))
                .map(m => m.name || 'Unknown')
                .join(', ')
            : ''}
        </p>
      </div>
    </div>
  );
}

export default Poll;