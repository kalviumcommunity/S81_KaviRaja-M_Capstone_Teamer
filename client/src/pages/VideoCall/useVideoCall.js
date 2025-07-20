import { useEffect, useRef, useState, useCallback } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

// Helper to create a new RTCPeerConnection
function createPeerConnection({ socket, callId, userId, remoteUserId, onRemoteTrack }) {
  const pc = new RTCPeerConnection({
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
    ],
  });

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit('signal', {
        callId,
        to: remoteUserId,
        from: userId,
        data: { type: 'candidate', candidate: event.candidate }
      });
    }
  };

  pc.ontrack = (event) => {
    console.log('[WebRTC] ontrack fired for remoteUserId:', remoteUserId, event.streams);
    if (onRemoteTrack) onRemoteTrack(event.streams[0], remoteUserId);
  };

  return pc;
}

// Helper to add or update a participant in the array
function upsertParticipant(participants, participant) {
  // Remove any existing participant with the same id
  const filtered = participants.filter(p => p.id !== participant.id);
  // Add the new/updated participant
  const updated = [...filtered, participant];
  // Deduplicate by id (shouldn't be needed, but extra safety)
  const deduped = [];
  const seen = new Set();
  for (const p of updated) {
    if (!seen.has(p.id)) {
      deduped.push(p);
      seen.add(p.id);
    }
  }
  // For 1:1 calls, only keep up to 2 participants
  if (deduped.length > 2) {
    return deduped.slice(-2);
  }
  return deduped;
}

export function useVideoCall(callId) {
  const socket = useSocket();
  const { user } = useAuth();
  const [participants, setParticipants] = useState([]); // {id, name, stream, isHost, isActiveSpeaker, isMuted, isScreenSharing}
  const [activeSpeakerId, setActiveSpeakerId] = useState(null);
  const [reactions, setReactions] = useState([]); // {userId, emoji, timestamp}
  const [chatMessages, setChatMessages] = useState([]);
  const [error, setError] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [screenStream, setScreenStream] = useState(null);
  const peerConnections = useRef({});
  // Store userId -> name mapping
  const userNames = useRef({});
  // Track if this user should initiate the offer and the peer to call

  // Always upsert remote participant on remote stream (ontrack)
  function handleRemoteTrack(stream, remoteId) {
    setParticipants(prev => {
      // Never add yourself as a remote participant
      if (remoteId === user._id) return prev;
      let remoteName = userNames.current[remoteId] || 'Peer';
      // If we don't know the name, request it
      if (!userNames.current[remoteId] && socket) {
        socket.emit('request-user-names', { userIds: [remoteId] });
      }
      const updated = upsertParticipant(prev, {
        id: remoteId,
        name: remoteName,
        stream
      });
      return updated;
    });
  }

  // Always upsert local participant on localStream change
  useEffect(() => {
    if (!localStream) return;
    setParticipants(prev => {
      // Remove any duplicate local entries
      const filtered = prev.filter(p => p.id !== user._id);
      return [
        ...filtered,
        {
          id: user._id,
          name: user.name,
          stream: localStream,
          isHost: true,
          isActiveSpeaker: false,
          isMuted: !micOn,
          isScreenSharing: false
        }
      ];
    });
  }, [localStream, user._id, user.name, micOn]);

  // Join call and setup local media
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: camOn, audio: micOn });
        if (!isMounted) return;
        setLocalStream(stream);
        // Store your own name
        userNames.current[user._id] = user.name;
        setParticipants(prev => {
          const updated = upsertParticipant(prev, {
            id: user._id,
            name: user.name,
            stream,
            isHost: true,
            isActiveSpeaker: false,
            isMuted: !micOn,
            isScreenSharing: false
          });
          console.log('[VideoCall] Local participant set:', updated);
          return updated;
        });
        socket.emit('join-call', { callId, userId: user._id, name: user.name });
      } catch (err) {
        setError(err);
      }
    })();
    return () => { isMounted = false; };
    // Only re-run when joining a new call
    // eslint-disable-next-line
  }, [callId, user, socket]);

  // After joining, listen for call-room-info and connect to all existing users
  useEffect(() => {
    if (!socket || !localStream) return;
    const handleRoomInfo = ({ callId: roomCallId, roomSize, userIds }) => {
      // Find userIds we don't know the name for
      const unknownIds = userIds.filter(id => !userNames.current[id]);
      if (unknownIds.length > 0) {
        socket.emit('request-user-names', { userIds: unknownIds });
      }
      userIds.forEach(remoteUserId => {
        if (remoteUserId !== user._id && !peerConnections.current[remoteUserId]) {
          const pc = createPeerConnection({
            socket,
            callId,
            userId: user._id,
            remoteUserId,
            onRemoteTrack: handleRemoteTrack
          });
          localStream.getTracks().forEach(track => {
            pc.addTrack(track, localStream);
          });
          peerConnections.current[remoteUserId] = pc;
          // Create offer
          pc.createOffer().then(offer => {
            pc.setLocalDescription(offer);
            socket.emit('signal', { callId, to: remoteUserId, from: user._id, fromName: user.name, data: { type: 'offer', sdp: offer } });
          });
        }
      });
    };
    socket.on('call-room-info', handleRoomInfo);
    return () => {
      socket.off('call-room-info', handleRoomInfo);
    };
  }, [socket, localStream, user._id, callId]);

  // Listen for user-names and update mapping and participants
  useEffect(() => {
    if (!socket) return;
    const handleUserNames = ({ names }) => {
      // names: { [userId]: name }
      Object.entries(names).forEach(([id, name]) => {
        userNames.current[id] = name;
      });
      // Update participants array with correct names
      setParticipants(prev =>
        prev.map(p => ({
          ...p,
          name: userNames.current[p.id] || p.name
        }))
      );
    };
    socket.on('user-names', handleUserNames);
    return () => {
      socket.off('user-names', handleUserNames);
    };
  }, [socket]);

  // When a new participant joins, only create a connection for the new user
  useEffect(() => {
    if (!socket || !localStream) return;
    const handleUserJoined = async ({ userId, name }) => {
      if (userId === user._id) return;
      // Store the user's name
      userNames.current[userId] = name;
      setParticipants(prev => prev.map(p => p.id === userId ? { ...p, name } : p));
      if (!peerConnections.current[userId]) {
        const pc = createPeerConnection({
          socket,
          callId,
          userId: user._id,
          remoteUserId: userId,
          onRemoteTrack: handleRemoteTrack
        });
        localStream.getTracks().forEach(track => {
          pc.addTrack(track, localStream);
        });
        peerConnections.current[userId] = pc;
        // Create offer
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('signal', { callId, to: userId, from: user._id, fromName: user.name, data: { type: 'offer', sdp: offer } });
      }
      // Do NOT add participant here! Only add on remote track.
    };
    socket.on('user-joined', handleUserJoined);
    return () => {
      socket.off('user-joined', handleUserJoined);
    };
  }, [socket, localStream, user._id, callId]);

  // When a user leaves, remove them from participants and close their connection
  useEffect(() => {
    if (!socket) return;
    const handleUserLeft = ({ userId }) => {
      if (peerConnections.current[userId]) {
        peerConnections.current[userId].close();
        delete peerConnections.current[userId];
      }
      setParticipants(prev => {
        const filtered = prev.filter(p => p.id !== userId);
        console.log('[VideoCall] Participant left, updated list:', filtered);
        return filtered;
      });
    };
    socket.on('user-left', handleUserLeft);
    return () => {
      socket.off('user-left', handleUserLeft);
    };
  }, [socket]);

  // Toggle mic
  const toggleMic = useCallback(() => {
    if (!localStream) return;
    localStream.getAudioTracks().forEach(track => {
      track.enabled = !track.enabled;
      setMicOn(track.enabled);
      setParticipants(prev => prev.map(p => p.id === user._id ? { ...p, isMuted: !track.enabled } : p));
    });
    // Optionally notify others
    socket.emit('mic-toggle', { callId, userId: user._id, micOn: !micOn });
  }, [localStream, user, micOn, socket, callId]);

  // Toggle camera
  const toggleCam = useCallback(() => {
    if (!localStream) return;
    localStream.getVideoTracks().forEach(track => {
      track.enabled = !track.enabled;
      setCamOn(track.enabled);
    });
    // Optionally notify others
    socket.emit('cam-toggle', { callId, userId: user._id, camOn: !camOn });
  }, [localStream, user, camOn, socket, callId]);
  // Send a reaction (emoji)
  const sendReaction = useCallback((emoji) => {
    const reaction = { userId: user._id, emoji, timestamp: new Date().toISOString() };
    setReactions(prev => [...prev, reaction]);
    socket.emit('call-reaction', { callId, ...reaction });
  }, [user, socket, callId]);

  // Start/stop screen sharing
  const toggleScreenShare = useCallback(async () => {
    if (!screenSharing) {
      try {
        const screen = await navigator.mediaDevices.getDisplayMedia({ video: true });
        setScreenStream(screen);
        setScreenSharing(true);
        // Replace video track in all peer connections
        Object.values(peerConnections.current).forEach(pc => {
          const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
          if (sender) sender.replaceTrack(screen.getVideoTracks()[0]);
        });
        // Replace in local stream for self-view
        setLocalStream(prev => {
          if (!prev) return prev;
          const newStream = new MediaStream([
            screen.getVideoTracks()[0],
            ...prev.getAudioTracks()
          ]);
          return newStream;
        });
        screen.getVideoTracks()[0].onended = () => {
          setScreenSharing(false);
          setScreenStream(null);
          // Restore camera
          navigator.mediaDevices.getUserMedia({ video: true, audio: micOn }).then(camStream => {
            Object.values(peerConnections.current).forEach(pc => {
              const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
              if (sender) sender.replaceTrack(camStream.getVideoTracks()[0]);
            });
            setLocalStream(camStream);
          });
        };
      } catch (err) {
        setError(err);
      }
    } else {
      setScreenSharing(false);
      setScreenStream(null);
      // Restore camera
      navigator.mediaDevices.getUserMedia({ video: true, audio: micOn }).then(camStream => {
        Object.values(peerConnections.current).forEach(pc => {
          const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
          if (sender) sender.replaceTrack(camStream.getVideoTracks()[0]);
        });
        setLocalStream(camStream);
      });
    }
  }, [screenSharing, micOn, localStream]);

  // Handle signaling events
  useEffect(() => {
    if (!socket || !localStream) return;
    // Listen for mic/cam toggle from others
    socket.on('mic-toggle', ({ userId, micOn }) => {
      setParticipants(prev => prev.map(p => p.id === userId ? { ...p, isMuted: !micOn } : p));
    });
    socket.on('cam-toggle', ({ userId, camOn }) => {
      setParticipants(prev => prev.map(p => p.id === userId ? { ...p, camOn } : p));
    });

    // Listen for reactions
    socket.on('call-reaction', ({ userId, emoji, timestamp }) => {
      setReactions(prev => [...prev, { userId, emoji, timestamp }]);
    });

    // Listen for screen sharing state
    socket.on('screen-share-toggle', ({ userId, isScreenSharing }) => {
      setParticipants(prev => prev.map(p => p.id === userId ? { ...p, isScreenSharing } : p));
    });

    // Active speaker detection (simple: based on speaking events)
    socket.on('active-speaker', ({ userId }) => {
      setActiveSpeakerId(userId);
      setParticipants(prev => prev.map(p => ({ ...p, isActiveSpeaker: p.id === userId })));
    });

    // When a new participant joins
    // This useEffect now handles the initial connection for existing users
    // and subsequent connections for new users.

    // When receiving a signal (offer/answer/ice)
    socket.on('signal', async ({ to, from, fromName, data }) => {
      // Update userNames mapping if fromName is present
      if (from && fromName) {
        userNames.current[from] = fromName;
      }
      if (to !== user._id) return;
      let pc = peerConnections.current[from];
      if (!pc) {
        console.log('[WebRTC] Creating peer connection for', from);
        pc = createPeerConnection({
          socket,
          callId,
          userId: user._id,
          remoteUserId: from,
          onRemoteTrack: handleRemoteTrack
        });
        // Add all local tracks to the peer connection
        if (localStream) {
          localStream.getTracks().forEach(track => {
            pc.addTrack(track, localStream);
          });
        }
        peerConnections.current[from] = pc;
      }
      if (data.type === 'offer') {
        try {
          console.log('[WebRTC] setRemoteDescription(offer) from', from, 'signalingState:', pc.signalingState);
          if (pc.signalingState === 'stable') {
            await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit('signal', { callId, to: from, from: user._id, fromName: user.name, data: { type: 'answer', sdp: answer } });
            console.log('[WebRTC] Sent answer to', from);
          } else {
            console.warn('[WebRTC] Ignored setRemoteDescription(offer) because signalingState is', pc.signalingState);
          }
        } catch (err) {
          console.error('[WebRTC] setRemoteDescription(offer) error:', err);
        }
      } else if (data.type === 'answer') {
        try {
          console.log('[WebRTC] setRemoteDescription(answer) from', from, 'signalingState:', pc.signalingState);
          // Only set remote description if not already set
          if (
            pc.signalingState === 'have-local-offer' ||
            pc.signalingState === 'have-remote-offer'
          ) {
            await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
          } else {
            console.warn('[WebRTC] Ignored setRemoteDescription(answer) because signalingState is', pc.signalingState);
          }
        } catch (err) {
          console.error('[WebRTC] setRemoteDescription(answer) error:', err);
        }
      } else if (data.type === 'candidate') {
        try {
          console.log('[WebRTC] addIceCandidate from', from);
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (err) {
          console.error('[WebRTC] addIceCandidate error:', err);
        }
      }
    });
    // Send ICE candidates using new group signaling event
    Object.values(peerConnections.current).forEach((pc, remoteId) => {
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('signal', {
            callId,
            to: remoteId,
            from: user._id,
            fromName: user.name,
            data: { type: 'candidate', candidate: event.candidate }
          });
        }
      };
    });
    socket.on('user-left', ({ userId }) => {
      if (peerConnections.current[userId]) {
        peerConnections.current[userId].close();
        delete peerConnections.current[userId];
      }
      setParticipants(prev => prev.filter(p => p.id !== userId));
    });
    socket.on('call-chat-message', ({ sender, text, timestamp }) => {
      setChatMessages(prev => [...prev, { sender, text, timestamp }]);
    });

    return () => {
      socket.off('user-joined');
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
      socket.off('user-left');
      socket.off('call-chat-message');
      socket.off('mic-toggle');
      socket.off('cam-toggle');
      socket.off('call-reaction');
      socket.off('screen-share-toggle');
      socket.off('active-speaker');
    };
  }, [socket, localStream, callId, user]);
  const sendChatMessage = useCallback((text) => {
    socket.emit('call-chat-message', { callId, sender: user.name, text, timestamp: new Date().toISOString() });
    // Do NOT add to chatMessages here; wait for socket event
  }, [socket, callId, user]);

  // Toggle screen sharing and notify others
  const toggleScreenShareWithNotify = useCallback(async () => {
    await toggleScreenShare();
    socket.emit('screen-share-toggle', { callId, userId: user._id, isScreenSharing: !screenSharing });
    setParticipants(prev => prev.map(p => p.id === user._id ? { ...p, isScreenSharing: !screenSharing } : p));
  }, [toggleScreenShare, socket, callId, user, screenSharing]);

  // Leave call: close all peer connections, stop all local and screen tracks, emit leave event
  const leaveCall = useCallback(() => {
    // Close all peer connections
    Object.values(peerConnections.current).forEach(pc => pc.close());
    peerConnections.current = {};

    // Stop all tracks in localStream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }

    // Stop all tracks in screenStream (if sharing)
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
    }

    // Reset screen sharing state
    setScreenSharing(false);
    setScreenStream(null);

    // Emit leave event
    socket.emit('leave-call', { callId, userId: user._id });
    setParticipants([]);
  }, [socket, callId, user, localStream, screenStream]);

  // Always sort chatMessages by timestamp before rendering
  const sortedChatMessages = [...chatMessages].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  return {
    participants,
    chatMessages: sortedChatMessages,
    sendChatMessage,
    leaveCall,
    localStream,
    micOn,
    camOn,
    toggleMic,
    toggleCam,
    screenSharing,
    toggleScreenShare: toggleScreenShareWithNotify,
    activeSpeakerId,
    reactions,
    sendReaction,
    setActiveSpeakerId, // for advanced UI
    error,
  };
}
