import React from 'react';
import { BarChart2, Clock } from 'lucide-react';

const Poll = ({ poll, onVote, currentUser }) => {
  // Defensive: ensure options and votes are always arrays
  // Defensive: ensure poll, poll.options, poll.members, poll.creator are always defined
  if (!poll || typeof poll !== 'object') return null;
  const options = Array.isArray(poll.options) ? poll.options : [];
  const members = Array.isArray(poll.members) ? poll.members : [];
  let creatorName = 'Unknown';
  if (poll.creator) {
    if (typeof poll.creator === 'string') {
      creatorName = poll.creator;
    } else if (poll.creator.name) {
      creatorName = poll.creator.name;
    } else if (poll.creator.username) {
      creatorName = poll.creator.username;
    }
  }
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
    <div className="bg-gray-800 rounded-xl p-5 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h4 className="font-semibold text-base text-white truncate max-w-[180px]">{poll.question || 'No question'}</h4>
          <span className="inline-block text-xs text-blue-400 font-bold mt-1">{`Created by: ${creatorName}`}</span>
        </div>
        {poll.expiresAt && (
          <div className="flex items-center text-xs text-gray-400">
            <Clock className="w-3 h-3 mr-1" />
            {timeLeft()}
          </div>
        )}
      </div>

      <div className="space-y-2">
        {options.length > 0 ? options.map((option, index) => {
          // Always generate a unique key for each option
          const key = `${option.id || ''}_${option.text || ''}_${index}`;
          return (
            <button
              key={key}
              onClick={() => !hasVoted && onVote && poll.id && onVote(poll.id, index)}
              disabled={hasVoted}
              className={`w-full text-left px-2 py-1.5 rounded-md transition-colors text-sm ${
                hasVoted ? 'bg-gray-700' : 'hover:bg-gray-700'
              }`}
            >
              <div className="flex justify-between items-center mb-0.5">
                <span className="truncate max-w-[120px]">{option.text || 'No text'}</span>
                <span className="ml-2 text-xs text-gray-300">{Array.isArray(option.votes) ? option.votes.length : 0} votes</span>
              </div>

              <div className="relative h-1.5 bg-gray-600 rounded">
                <div
                  className="absolute h-full bg-blue-500 rounded"
                  style={{
                    width: `${(Array.isArray(option.votes) && poll.totalVotes ? (option.votes.length / poll.totalVotes) * 100 : 0)}%`
                  }}
                />
              </div>

              {poll.showVoters && Array.isArray(option.votes) && option.votes.length > 0 && (
                <div className="mt-1 text-xs text-gray-400">
                  Voted: {option.votes
                    .map(vote => members.find(m => m.id === vote)?.name || 'Unknown')
                    .join(', ')}
                </div>
              )}
            </button>
          );
        }) : <div className="text-gray-400 text-xs">No options available</div>}
      </div>

      {!hasVoted && (
        <p className="mt-2 text-xs text-gray-400 text-center">
          Click an option to vote
        </p>
      )}

      <div className="mt-2 text-xs text-gray-400">
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