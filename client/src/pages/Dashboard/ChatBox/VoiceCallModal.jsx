import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useChat } from '../../../context/ChatContext';

const VoiceCallModal = ({ chat, onClose, callee, isCaller }) => {
  const { user, setUser } = useAuth();
  const { socket } = useChat();
  const [callState, setCallState] = useState(isCaller ? 'calling' : 'ringing');
  const [remoteStream, setRemoteStream] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const pcRef = useRef(null);

  useEffect(() => {
    if (!socket) return;
    // --- WebRTC setup ---
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    pcRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice_candidate', {
          toUserId: callee._id,
          candidate: event.candidate,
        });
      }
    };
    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    // Get local audio
    navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then((stream) => {
      setLocalStream(stream);
      if (pcRef.current && pcRef.current.signalingState !== 'closed') {
        stream.getTracks().forEach((track) => pcRef.current.addTrack(track, stream));
      }
      if (isCaller && pcRef.current && pcRef.current.signalingState !== 'closed') startCall(pcRef.current, stream);
    });

    // --- Socket events ---
    const handleIncomingCall = async ({ fromUserId, offer }) => {
      if (!pcRef.current || pcRef.current.signalingState === 'closed') {
        const newPc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
        pcRef.current = newPc;
        newPc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit('ice_candidate', {
              toUserId: callee._id,
              candidate: event.candidate,
            });
          }
        };
        newPc.ontrack = (event) => {
          setRemoteStream(event.streams[0]);
        };
        if (localStream) {
          localStream.getTracks().forEach((track) => newPc.addTrack(track, localStream));
        }
      }
      setCallState('ringing');
      try {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));
      } catch (err) {}
    };
    const handleCallAnswered = async ({ answer, fromUserId }) => {
      if (pcRef.current && pcRef.current.signalingState !== 'closed') {
        try {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
          socket.emit('call_connected', { toUserId: fromUserId });
        } catch (err) {}
      }
    };
    const handleCallConnected = () => {
      setCallState('in-call');
      setTimerActive(true);
    };
    const handleIceCandidate = async ({ candidate }) => {
      if (pcRef.current && pcRef.current.signalingState !== 'closed') {
        try {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {}
      }
    };
    const handleCallEnded = () => {
      setCallState('ended');
      if (onClose) onClose();
      cleanup();
    };
    socket.on('incoming_call', handleIncomingCall);
    socket.on('call_answered', handleCallAnswered);
    socket.on('call_connected', handleCallConnected);
    socket.on('ice_candidate', handleIceCandidate);
    socket.on('call_ended', handleCallEnded);
    return () => {
      socket.off('incoming_call', handleIncomingCall);
      socket.off('call_answered', handleCallAnswered);
      socket.off('call_connected', handleCallConnected);
      socket.off('ice_candidate', handleIceCandidate);
      socket.off('call_ended', handleCallEnded);
      cleanup();
    };
    function cleanup() {
      if (pcRef.current) {
        try {
          pcRef.current.onicecandidate = null;
          pcRef.current.ontrack = null;
          pcRef.current.close();
        } catch {}
        pcRef.current = null;
      }
      if (localStream) {
        localStream.getTracks().forEach((t) => t.stop());
      }
      setRemoteStream(null);
      setLocalStream(null);
    }
    async function startCall(pc, stream) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('call_user', {
        toUserId: callee._id,
        fromUserId: user._id,
        offer,
      });
    }
  }, [socket, callee, isCaller]);

  useEffect(() => {
    let timer;
    if (timerActive && callState === 'in-call') {
      timer = setInterval(() => setCallDuration((d) => d + 1), 1000);
    } else if (callState === 'ended') {
      setCallDuration(0);
      setTimerActive(false);
    }
    return () => clearInterval(timer);
  }, [timerActive, callState]);

  // Accept button for callee
  const handleAccept = async () => {
    if (pcRef.current && socket && callee && !isCaller && pcRef.current.signalingState !== 'closed') {
      try {
        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);
        socket.emit('answer_call', { toUserId: callee._id, answer, fromUserId: user._id });
        socket.emit('call_connected', { toUserId: callee._id });
        // Do NOT setCallState('in-call') or setTimerActive(true) here; wait for call_connected event
      } catch (err) {}
    }
  };
  const handleEnd = () => {
    socket.emit('end_call', { toUserId: callee._id });
    setCallState('ended');
    if (onClose) onClose();
  };

  useEffect(() => {
    if (callState === 'ended') {
      const timeout = setTimeout(() => {
        if (onClose) onClose();
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [callState, onClose]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
      <div className="bg-gray-900 rounded-lg p-8 w-full max-w-md relative flex flex-col items-center">
        <h2 className="text-white text-xl mb-2">Voice Call</h2>
        {callState === 'calling' && <p className="text-gray-300 mb-4">Calling...</p>}
        {callState === 'ringing' && <p className="text-gray-300 mb-4">Incoming call...</p>}
        {callState === 'in-call' && (
          <p className="text-green-400 mb-4">In call <span className="ml-2 text-xs text-white">{Math.floor(callDuration / 60).toString().padStart(2, '0')}:{(callDuration % 60).toString().padStart(2, '0')}</span></p>
        )}
        {callState === 'ended' && <p className="text-red-400 mb-4">Call ended</p>}
        <audio autoPlay ref={el => { if (el && remoteStream) el.srcObject = remoteStream; }} />
        <audio autoPlay muted ref={el => { if (el && localStream) el.srcObject = localStream; }} />
        <div className="flex gap-4 mt-6">
          {callState === 'ringing' && <button onClick={handleAccept} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Accept</button>}
          {callState !== 'ended' && <button onClick={handleEnd} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">End Call</button>}
        </div>
      </div>
    </div>
  );
};

export default VoiceCallModal;
