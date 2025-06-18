import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopBar from './components/TopBar';
import VideoGrid from './components/VideoGrid';
import ControlBar from './components/ControlBar';
import ParticipantsList from './components/ParticipantsList';
import ChatPanel from './components/ChatPanel';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';
import { 
  handleJoinCall, 
  handleLeaveCall, 
  handleScreenShare,
  handleToggleAudio,
  handleToggleVideo
} from './utils/callHandlers';
import { useCall } from '../../context/CallContext';

const VideoCall = () => {
  const { callId } = useParams();
  const { activeCall, leaveCall } = useCall();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);

  // Initialize call
  useEffect(() => {
    const initCall = async () => {
      try {
        setLoading(true);
        const { stream, error } = await handleJoinCall(callId);
        
        if (error) throw error;
        
        setLocalStream(stream);
        setParticipants(prev => ([
          {
            id: 'local',
            name: 'You',
            isHost: true,
            stream,
            isMuted: !isMicOn,
            isCameraOff: !isCameraOn,
            isScreenSharing: false
          },
          ...prev
        ]));
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    initCall();

    // Cleanup on unmount
    return () => {
      if (localStream) handleLeaveCall(localStream);
      if (screenStream) handleLeaveCall(screenStream);
    };
  }, [callId]);

  const handleToggleMic = useCallback(() => {
    setIsMicOn(prev => {
      handleToggleAudio(localStream, !prev);
      return !prev;
    });
  }, [localStream]);

  const handleToggleCamera = useCallback(() => {
    setIsCameraOn(prev => {
      handleToggleVideo(localStream, !prev);
      return !prev;
    });
  }, [localStream]);

  const handleToggleScreenShare = useCallback(async () => {
    try {
      if (!isScreenSharing) {
        const { stream, error } = await handleScreenShare();
        if (error) throw error;
        
        setScreenStream(stream);
        setIsScreenSharing(true);
        
        // Handle stream end
        stream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          setScreenStream(null);
        };
      } else {
        if (screenStream) {
          handleLeaveCall(screenStream);
          setScreenStream(null);
        }
        setIsScreenSharing(false);
      }
    } catch (err) {
      console.error('Screen sharing error:', err);
    }
  }, [isScreenSharing, screenStream]);

  const handleLeave = useCallback(() => {
    handleLeaveCall(localStream, () => {
      if (screenStream) handleLeaveCall(screenStream);
      leaveCall(); // Clear call context
      navigate('/dashboard');
    });
  }, [localStream, screenStream, navigate, leaveCall]);

  if (loading) return <LoadingState />;
  if (error) return (
    <ErrorState 
      message={error.message || 'Failed to join call'} 
      onRetry={() => window.location.reload()}
    />
  );

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      <TopBar 
        callId={callId}
        participantsCount={participants.length}
      />
      
      <div className="flex-1 flex">
        <div className="flex-1 relative">
          <VideoGrid 
            participants={participants}
            localUser={{ isCameraOn, isScreenSharing }}
          />
        </div>

        {showParticipants && (
          <ParticipantsList
            participants={participants}
            onClose={() => setShowParticipants(false)}
          />
        )}

        {showChat && (
          <ChatPanel
            messages={messages}
            onSendMessage={(text) => {
              setMessages(prev => [...prev, {
                id: Date.now(),
                sender: 'You',
                text,
                timestamp: new Date()
              }]);
            }}
            onClose={() => setShowChat(false)}
          />
        )}
      </div>

      <ControlBar
        isMicOn={isMicOn}
        isCameraOn={isCameraOn}
        isScreenSharing={isScreenSharing}
        showChat={showChat}
        showParticipants={showParticipants}
        onToggleMic={handleToggleMic}
        onToggleCamera={handleToggleCamera}
        onToggleScreenShare={handleToggleScreenShare}
        onToggleChat={() => setShowChat(prev => !prev)}
        onToggleParticipants={() => setShowParticipants(prev => !prev)}
        onLeaveCall={handleLeave}
      />
    </div>
  );
};

export default VideoCall;