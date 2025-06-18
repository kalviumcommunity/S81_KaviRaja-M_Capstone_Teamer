import React from 'react';
import { Mic, MicOff, Video, VideoOff, Share, MessageSquare, Users, PhoneOff } from 'lucide-react';

const ControlBar = ({
  isMicOn,
  isCameraOn,
  isScreenSharing,
  showChat,
  showParticipants,
  onToggleMic,
  onToggleCamera,
  onToggleScreenShare,
  onToggleChat,
  onToggleParticipants,
  onLeaveCall
}) => {
  const handleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        await navigator.mediaDevices.getDisplayMedia({ video: true });
        onToggleScreenShare(true);
      } else {
        // Stop screen sharing
        onToggleScreenShare(false);
      }
    } catch (err) {
      console.error('Error sharing screen:', err);
    }
  };

  return (
    <div className="h-20 bg-gray-800 flex items-center justify-center gap-4 px-4">
      <button 
        onClick={onToggleMic}
        className={`p-4 rounded-full ${isMicOn ? 'bg-gray-700' : 'bg-red-500'} hover:bg-opacity-80 transition-colors`}
      >
        {isMicOn ? <Mic className="text-white" /> : <MicOff className="text-white" />}
      </button>
      
      <button 
        onClick={onToggleCamera}
        className={`p-4 rounded-full ${isCameraOn ? 'bg-gray-700' : 'bg-red-500'} hover:bg-opacity-80 transition-colors`}
      >
        {isCameraOn ? <Video className="text-white" /> : <VideoOff className="text-white" />}
      </button>
      
      <button 
        onClick={handleScreenShare}
        className={`p-4 rounded-full ${isScreenSharing ? 'bg-green-500' : 'bg-gray-700'} hover:bg-opacity-80 transition-colors`}
      >
        <Share className="text-white" />
      </button>
      
      <button 
        onClick={onToggleChat}
        className={`p-4 rounded-full ${showChat ? 'bg-blue-500' : 'bg-gray-700'} hover:bg-opacity-80 transition-colors`}
      >
        <MessageSquare className="text-white" />
      </button>
      
      <button 
        onClick={onToggleParticipants}
        className={`p-4 rounded-full ${showParticipants ? 'bg-blue-500' : 'bg-gray-700'} hover:bg-opacity-80 transition-colors`}
      >
        <Users className="text-white" />
      </button>
      
      <button 
        onClick={onLeaveCall}
        className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
      >
        <PhoneOff className="text-white" />
      </button>
    </div>
  );
};

export default ControlBar;