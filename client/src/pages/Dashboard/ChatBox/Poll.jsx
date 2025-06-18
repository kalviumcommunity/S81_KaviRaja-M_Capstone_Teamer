import React from 'react';
import { BarChart2, Clock } from 'lucide-react';

const Poll = ({ poll, onVote, currentUser }) => {
  const hasVoted = poll.options.some(option => 
    option.votes.includes(currentUser.id)
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
          <h4 className="font-semibold text-lg">{poll.question}</h4>
          <p className="text-sm text-gray-400">Created by {poll.creator.name}</p>
        </div>
        {poll.expiresAt && (
          <div className="flex items-center text-sm text-gray-400">
            <Clock className="w-4 h-4 mr-1" />
            {timeLeft()}
          </div>
        )}
      </div>

      <div className="space-y-3">
        {poll.options.map((option, index) => (
          <button
            key={index}
            onClick={() => !hasVoted && onVote(poll.id, index)}
            disabled={hasVoted}
            className={`w-full text-left p-3 rounded-lg transition-colors ${
              hasVoted ? 'bg-gray-700' : 'hover:bg-gray-700'
            }`}
          >
            <div className="flex justify-between mb-1">
              <span>{option.text}</span>
              <span>{option.votes.length} votes</span>
            </div>

            <div className="relative h-2 bg-gray-600 rounded">
              <div
                className="absolute h-full bg-blue-500 rounded"
                style={{
                  width: `${(option.votes.length / poll.totalVotes) * 100}%`
                }}
              />
            </div>

            {poll.showVoters && (
              <div className="mt-2 text-sm text-gray-400">
                Voted: {option.votes.map(vote => 
                  poll.members.find(m => m.id === vote)?.name
                ).join(', ')}
              </div>
            )}
          </button>
        ))}
      </div>

      {!hasVoted && (
        <p className="mt-4 text-sm text-gray-400">
          Click an option to cast your vote
        </p>
      )}

      <div className="mt-4 text-sm text-gray-400">
        <p>Total votes: {poll.totalVotes}</p>
        <p>
          Not voted: {poll.members
            .filter(m => !poll.options
              .some(o => o.votes.includes(m.id)))
            .map(m => m.name)
            .join(', ')}
        </p>
      </div>
    </div>
  );
};

export default Poll;