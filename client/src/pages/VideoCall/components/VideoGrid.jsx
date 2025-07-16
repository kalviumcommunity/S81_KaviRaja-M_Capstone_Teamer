import React, { useRef, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff } from 'lucide-react';

const VideoGrid = ({ participants, localUser }) => {
  const videoRefs = useRef({});
  const currentUserId = localUser?.id;

  const getGridColumns = () => {
    const count = participants.length;
    if (count <= 1) return 'grid-cols-1';
    if (count <= 4) return 'grid-cols-2';
    if (count <= 9) return 'grid-cols-3';
    return 'grid-cols-4';
  };

  useEffect(() => {
    participants.forEach(participant => {
      if (participant.stream && videoRefs.current[participant.id]) {
        videoRefs.current[participant.id].srcObject = participant.stream;
      }
    });
  }, [participants]);

  const renderVideoTile = (participant) => {
    const isLocal = participant.id === currentUserId;
    return (
      <div
        key={participant.id}
        className={`relative aspect-video bg-gray-800 rounded-lg overflow-hidden ${
          participant.isScreenSharing ? 'col-span-2 row-span-2' : ''
        } ${participant.isSpeaking ? 'ring-2 ring-blue-500' : ''}`}
      >
        {participant.isCameraOff ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center">
              <span className="text-2xl text-white">
                {participant.name[0]?.toUpperCase()}
              </span>
            </div>
          </div>
        ) : (
          <video
            ref={el => videoRefs.current[participant.id] = el}
            autoPlay
            playsInline
            muted={isLocal}
            className="w-full h-full object-cover"
          />
        )}

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-white text-sm">
                {participant.name}
              </span>
              {participant.isHost && (
                <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded">
                  Host
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {participant.isMuted && (
                <MicOff className="w-4 h-4 text-red-500" />
              )}
              {participant.isCameraOff && (
                <VideoOff className="w-4 h-4 text-red-500" />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`grid ${getGridColumns()} gap-4 p-4 h-full`}>
      {participants.map(renderVideoTile)}
    </div>
  );
};

export default VideoGrid;