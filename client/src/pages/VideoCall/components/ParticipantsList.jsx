import React from 'react';
import { X, Mic, MicOff, Video, VideoOff, Crown } from 'lucide-react';

const ParticipantsList = ({ participants, onClose }) => {
  return (
    <div className="w-80 bg-gray-800 border-l border-gray-700">
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h3 className="text-white font-semibold">Participants ({participants.length})</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="overflow-y-auto">
        {participants.map(participant => (
          <div 
            key={participant.id}
            className="flex items-center justify-between p-4 hover:bg-gray-700"
          >
            <div className="flex items-center gap-2">
              <span className="text-white">{participant.name}</span>
              {participant.isHost && (
                <Crown className="w-4 h-4 text-yellow-500" />
              )}
            </div>
            <div className="flex items-center gap-2">
              {participant.isMuted ? (
                <MicOff className="w-4 h-4 text-red-500" />
              ) : (
                <Mic className="w-4 h-4 text-white" />
              )}
              {participant.isCameraOff ? (
                <VideoOff className="w-4 h-4 text-red-500" />
              ) : (
                <Video className="w-4 h-4 text-white" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParticipantsList;