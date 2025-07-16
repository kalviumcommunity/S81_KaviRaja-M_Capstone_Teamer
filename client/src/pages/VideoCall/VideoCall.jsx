import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopBar from './components/TopBar';
import VideoGrid from './components/VideoGrid';
import ControlBar from './components/ControlBar';
import ParticipantsList from './components/ParticipantsList';
import ChatPanel from './components/ChatPanel';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';
import { useVideoCall } from './useVideoCall';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const VideoCall = ({ callId: propCallId }) => {
  const params = useParams();
  // If propCallId is present, this is a 1:1 call. If not, it's a group/meeting call.
  const is1to1 = typeof propCallId === 'string' && !!propCallId;
  const callId = is1to1 ? propCallId : (params.callId || params.meetId);
  const navigate = useNavigate();
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [joinError, setJoinError] = useState('');
  const { user } = useAuth();

  // For 1:1 calls, require propCallId. If missing, show error and do not run backend check.
  if (is1to1 && !propCallId) {
    return <ErrorState message="Call ID missing for 1:1 call. Please try again from chat." onRetry={() => window.location.reload()} />;
  }
  // For group/meeting calls, require callId from params.
  if (!is1to1 && !callId) {
    return <ErrorState message="Call ID missing. Please try again." onRetry={() => window.location.reload()} />;
  }

  // Secure join: check with backend before connecting (only for meetings, never for 1:1 calls)
  useEffect(() => {
    let ignore = false;
    // Only check backend for group meetings (not 1:1)
    if (!is1to1 && callId && !callId.includes('-')) {
      async function checkJoin() {
        try {
          const token = localStorage.getItem('token');
          await axios.post(`/api/meetings/join/${callId}`, {
            userId: String(user?._id || user?.id)
          }, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
        } catch (err) {
          if (!ignore) {
            setJoinError(err.response?.data?.error || 'Not allowed to join this meeting.');
          }
        }
      }
      checkJoin();
    }
    return () => { ignore = true; };
  }, [callId, user, is1to1]);

  const {
    participants,
    chatMessages,
    sendChatMessage,
    leaveCall,
    localStream,
    micOn,
    camOn,
    toggleMic,
    toggleCam,
    screenSharing,
    toggleScreenShare,
    error,
  } = useVideoCall(callId);

  if (joinError) {
    return (
      <ErrorState 
        message={joinError} 
        onRetry={() => navigate('/dashboard/meetings')} 
      />
    );
  }
  if (!localStream && !error) {
    return <LoadingState />;
  }
  if (error) {
    return (
      <ErrorState 
        message={error.message || 'Failed to join call'} 
        onRetry={() => window.location.reload()} 
      />
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      <TopBar 
        callId={callId}
        participantsCount={participants.length}
      />
      <div className="flex-1 flex">
        <div className="flex-1 relative">
          <VideoGrid 
            participants={participants.map(p => ({
              ...p,
              isMuted: p.id === user._id ? !micOn : p.isMuted,
              isCameraOff: p.id === user._id ? !camOn : p.isCameraOff,
              isScreenSharing: p.id === user._id ? screenSharing : p.isScreenSharing,
            }))}
            localUser={{ id: user._id }}
          />
        </div>
        {showParticipants && (
          <ParticipantsList
            participants={participants.map(p => ({
              ...p,
              isMuted: p.id === (participants[0]?.id) ? !micOn : p.isMuted,
              isCameraOff: p.id === (participants[0]?.id) ? !camOn : p.isCameraOff,
            }))}
            onClose={() => setShowParticipants(false)}
          />
        )}
        {showChat && (
          <ChatPanel
            messages={chatMessages}
            onSendMessage={sendChatMessage}
            onClose={() => setShowChat(false)}
          />
        )}
      </div>
      <ControlBar
        isMicOn={micOn}
        isCameraOn={camOn}
        isScreenSharing={screenSharing}
        showChat={showChat}
        showParticipants={showParticipants}
        onToggleMic={toggleMic}
        onToggleCamera={toggleCam}
        onToggleScreenShare={toggleScreenShare}
        onToggleChat={() => setShowChat(prev => !prev)}
        onToggleParticipants={() => setShowParticipants(prev => !prev)}
        onLeaveCall={() => { leaveCall(); navigate('/dashboard'); }}
      />
    </div>
  );
};

export default VideoCall;