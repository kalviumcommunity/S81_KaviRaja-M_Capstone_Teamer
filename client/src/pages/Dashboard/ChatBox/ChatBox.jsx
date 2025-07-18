import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Paperclip, Send, MoreVertical, Phone, Video, Smile } from 'lucide-react';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { useChat } from '../../../context/ChatContext';
import { useAuth } from '../../../context/AuthContext';
import GroupMenu from './GroupMenu';
import GroupInfo from './GroupInfo';
import UserProfile from './UserProfile';
import CreatePoll from './CreatePoll';
import Poll from './Poll';
import TaskAssignmentModal from './TaskAssignmentModal';
import TaskMessage from './TaskMessage';
import ScheduleCall from './ScheduleCall';
import AnalyticsGraph from './AnalyticsGraph';
import VideoCall from '../../../pages/VideoCall/VideoCall';
import VoiceCallModal from './VoiceCallModal';
import CreateMeeting from './CreateMeeting';
import MeetingCard from './MeetingCard';
import { uploadChatFile, fetchTasks, createTask, updateTask, fetchPolls, fetchSchedules, createSchedule } from '../../../utils/fetchApi';
import axios from 'axios';
import api from '../../../utils/fetchApi';

const ChatBox = ({ chat }) => {
  const { user } = useAuth();
  const { getMessages, sendMessage, loadMessages, socket, chats } = useChat();
  // --- Video Call Modal State ---
  const [videoCallModal, setVideoCallModal] = useState({ open: false, caller: null, isIncoming: false, isRinging: false });
  const [videoCallAccepted, setVideoCallAccepted] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [currentCallId, setCurrentCallId] = useState(null); // Unique call ID for 1:1 video call
  const [pendingShowVideoCall, setPendingShowVideoCall] = useState(false); // Ensures UI only opens after callId is set
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showVoiceCall, setShowVoiceCall] = useState(false); // <-- Added missing state
  const [polls, setPolls] = useState([]);
  const [tasks, setTasks] = useState([]); // <-- Added missing tasks state
  const [schedules, setSchedules] = useState([]); // <-- Added missing schedules state
  const [meetings, setMeetings] = useState([]);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showScheduleCall, setShowScheduleCall] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  // Removed selectedUser state, not needed for my profile modal
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [input, setInput] = useState(''); // <-- Added missing input state
  const [showMenu, setShowMenu] = useState(false); // <-- Added missing showMenu state
  const [showCreateMeeting, setShowCreateMeeting] = useState(false);
  const navigate = useNavigate();
  // --- Meeting Join By ID Modal State ---
  const [showJoinById, setShowJoinById] = useState(false);
  function handleJoinMeetingById(meetId) {
    setShowJoinById(false);
    window.location.href = `/video-call/${meetId}`;
  }

  // --- Video Call Socket Logic ---
  useEffect(() => {
    if (!socket || !chat || !chat._id || chat.isGroupChat) return;
    let callTimeout = null;
    // Listen for incoming video call request
    const handleVideoCallRequest = ({ fromUserId, fromUserName, callId }) => {
      if (user._id !== fromUserId) {
        setCurrentCallId(callId);
        setVideoCallModal({ open: true, caller: { _id: fromUserId, name: fromUserName }, isIncoming: true, isRinging: true });
        // DO NOT call setShowVideoCall(true) here! Only after accept.
      }
    };
    // Listen for video call response
    const handleVideoCallResponse = ({ accepted, fromUserId, callId }) => {
      clearTimeout(callTimeout);
      if (accepted) {
        setVideoCallModal({ open: false, caller: null, isIncoming: false, isRinging: false });
        setCurrentCallId(callId);
        setPendingShowVideoCall(true); // Wait for callId to be set before opening UI
      } else {
        setVideoCallModal({ open: false, caller: null, isIncoming: false, isRinging: false });
        setCurrentCallId(null);
        alert('Call declined');
      }
    };
    // Listen for call cancel
    const handleVideoCallCancel = () => {
      clearTimeout(callTimeout);
      setVideoCallModal({ open: false, caller: null, isIncoming: false, isRinging: false });
      setCurrentCallId(null);
    };
    socket.on('video-call-request', handleVideoCallRequest);
    socket.on('video-call-response', handleVideoCallResponse);
    socket.on('video-call-cancel', handleVideoCallCancel);

    // Timeout for unanswered calls (30s)
    if (videoCallModal.open && !videoCallModal.isIncoming) {
      callTimeout = setTimeout(() => {
        setVideoCallModal({ open: false, caller: null, isIncoming: false, isRinging: false });
        setCurrentCallId(null);
        alert('No answer');
        // Optionally, emit cancel event
        const latestChat = chats.find(c => c._id === chat._id) || chat;
        const other = latestChat.participants.find(p => p._id !== user._id);
        socket.emit('video-call-cancel', { toUserId: other._id, fromUserId: user._id });
      }, 30000);
    }
    return () => {
      clearTimeout(callTimeout);
      socket.off('video-call-request', handleVideoCallRequest);
      socket.off('video-call-response', handleVideoCallResponse);
      socket.off('video-call-cancel', handleVideoCallCancel);
    };
  }, [socket, chat, user._id, videoCallModal.open]);

  // Ensure showVideoCall is only set after currentCallId is set (prevents race condition)
  useEffect(() => {
    if (pendingShowVideoCall && currentCallId) {
      setShowVideoCall(true);
      setPendingShowVideoCall(false);
    }
  }, [pendingShowVideoCall, currentCallId]);

  // --- Video Call Button Handler ---
  const handleStartVideoCall = () => {
    // Always use the latest chat object from context (with updated avatars)
    const latestChat = chats.find(c => c._id === chat._id) || chat;
    const other = latestChat.participants.find(p => p._id !== user._id);
    // Generate a unique callId for this 1:1 call
    const callId = [user._id, other._id, Date.now()].join('-');
    setCurrentCallId(callId);
    socket.emit('video-call-request', { toUserId: other._id, fromUserId: user._id, fromUserName: user.name, callId });
    setVideoCallModal({ open: true, caller: other, isIncoming: false, isRinging: true });
  };

  // --- Accept/Decline Handlers ---
  const handleAcceptVideoCall = () => {
    setVideoCallModal({ open: false, caller: null, isIncoming: false, isRinging: false });
    setCurrentCallId(prev => {
      setTimeout(() => setShowVideoCall(true), 0);
      return prev;
    });
    socket.emit('video-call-response', { toUserId: videoCallModal.caller._id, fromUserId: user._id, accepted: true, callId: currentCallId });
  };
  const handleDeclineVideoCall = () => {
    setVideoCallModal({ open: false, caller: null, isIncoming: false, isRinging: false });
    setCurrentCallId(null);
    socket.emit('video-call-response', { toUserId: videoCallModal.caller._id, fromUserId: user._id, accepted: false, callId: currentCallId });
  };
  // If caller cancels before answer
  const handleCancelVideoCall = () => {
    setVideoCallModal({ open: false, caller: null, isIncoming: false, isRinging: false });
    const other = chat.participants.find(p => p._id !== user._id);
    socket.emit('video-call-cancel', { toUserId: other._id, fromUserId: user._id });
  };
  const [voiceCallCallee, setVoiceCallCallee] = useState(null);
  const [isCaller, setIsCaller] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const emojiButtonRef = useRef(null);
  const isCallerRef = useRef(false);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chat && chat._id, getMessages(chat?._id)]);

  useEffect(() => {
    if (!showEmojiPicker) return;
    function handleClickOutside(e) {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target) &&
        !emojiButtonRef.current.contains(e.target)
      ) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  // Fix: fetchTasks and fetchPolls return array, not {tasks: []}
  // Always trust backend for polls, tasks, schedules
  useEffect(() => {
    if (chat && chat._id) {
      localStorage.setItem('lastChatId', chat._id);
      const token = localStorage.getItem('token');
      loadMessages(chat._id, token);
      fetchTasks(chat._id, token)
        .then((data) => setTasks(Array.isArray(data) ? data : (data.tasks || [])))
        .catch((err) => setTasks([]));
      fetchPolls(chat._id, token)
        .then((data) => {
          const arr = Array.isArray(data) ? data : (data.polls || []);
          console.log('[DEBUG] Polls fetched from backend:', arr);
          setPolls(arr.map(p => ({
            ...p,
            id: p.id || p._id,
            chatId: typeof p.chatId === 'object' && p.chatId !== null && p.chatId.toString ? p.chatId.toString() : String(p.chatId)
          })));
        })
        .catch((err) => { console.error('[DEBUG] Poll fetch error:', err); setPolls([]); });
      fetchSchedules(chat._id, token)
        .then((data) => setSchedules(Array.isArray(data) ? data : (data.schedules || [])))
        .catch((err) => setSchedules([]));
      fetchMeetings();
    }
    // eslint-disable-next-line
  }, [chat && chat._id]);

  const handleStartVoiceCall = () => {
    const latestChat = chats.find(c => c._id === chat._id) || chat;
    const other = latestChat.participants.find(p => p._id !== user._id);
    setVoiceCallCallee(other);
    setIsCaller(true);
    isCallerRef.current = true;
    setShowVoiceCall(true);
  };

  useEffect(() => {
    if (!socket) return;
    const handleIncomingCall = ({ fromUserId }) => {
      // Only open modal as callee if the current user is NOT the caller and not already the caller
      if (user._id !== fromUserId && !isCallerRef.current) {
        const fromUser = chat.participants.find(p => p._id === fromUserId);
        setVoiceCallCallee(fromUser);
        setIsCaller(false);
        isCallerRef.current = false;
        setShowVoiceCall(true);
      }
    };
    socket.on('incoming_call', handleIncomingCall);
    return () => socket.off('incoming_call', handleIncomingCall);
  }, [socket, chat, user._id, isCaller]);

  // Ensure isCallerRef is reset when modal closes
  useEffect(() => {
    if (!showVoiceCall) {
      setIsCaller(false);
      isCallerRef.current = false;
    }
  }, [showVoiceCall]);

  // Real-time poll, task, and schedule events
  // After any poll socket event, always re-fetch from backend for this chat
  useEffect(() => {
    if (!socket || !chat || !chat._id) return;
    const token = localStorage.getItem('token');
    const refetchPolls = () => {
      fetchPolls(chat._id, token)
        .then((data) => {
          const arr = Array.isArray(data) ? data : (data.polls || []);
          console.log('[DEBUG] Polls fetched from backend:', arr);
          setPolls(arr.map(p => ({
            ...p,
            id: p.id || p._id,
            chatId: p.chatId && p.chatId.toString ? p.chatId.toString() : String(p.chatId)
          })));
        })
        .catch((err) => { console.error('[DEBUG] Poll fetch error:', err); setPolls([]); });
    };
    socket.on('polls_updated', refetchPolls);
    return () => {
      socket.off('polls_updated', refetchPolls);
    };
  }, [socket, chat && chat._id]);

  // Emit poll, task, and schedule events
  // No emitPoll: poll creation is via REST API only; socket is for notification only
  // Create task via API, then emit socket event for real-time
  const emitTask = async (task) => {
    if (!chat || !chat._id) return;
    const token = localStorage.getItem('token');
    try {
      const created = await createTask({ ...task, chatId: chat._id }, token);
      if (socket) {
        socket.emit('new_task', created);
      }
    } catch (err) {
      // Optionally show error
    }
  };
  const emitSchedule = (schedule) => {
    if (socket && chat && chat._id) {
      socket.emit('new_schedule', { ...schedule, chatId: chat._id });
    }
    // Do not update local state here; let the socket event handle it for everyone (including sender)
  };

  // Task completion and approval logic
  // Complete/approve task via API, then emit socket event
  const handleCompleteTask = async (taskId) => {
    const token = localStorage.getItem('token');
    try {
      await updateTask(taskId, { completed: true }, token);
      if (socket && chat && chat._id) {
        socket.emit('task_completed', { taskId, chatId: chat._id });
      }
    } catch (err) {
      // Optionally show error
    }
  };
  const handleApproveTask = async (taskId) => {
    const token = localStorage.getItem('token');
    try {
      await updateTask(taskId, { approved: true }, token);
      if (socket && chat && chat._id) {
        socket.emit('task_approved', { taskId, chatId: chat._id });
      }
    } catch (err) {
      // Optionally show error
    }
  };

  useEffect(() => {
    if (!socket) return;
    const handleTaskCompleted = ({ taskId }) => {
      console.log('Received task_completed for taskId:', taskId);
      setTasks(prev => prev.map(t =>
        String(t.id) === String(taskId) ? { ...t, completed: true } : t
      ));
    };
    const handleTaskApproved = ({ taskId }) => {
      console.log('Received task_approved for taskId:', taskId);
      setTasks(prev => prev.map(t =>
        String(t.id) === String(taskId) ? { ...t, approved: true } : t
      ));
    };
    socket.on('task_completed', handleTaskCompleted);
    socket.on('task_approved', handleTaskApproved);
    return () => {
      socket.off('task_completed', handleTaskCompleted);
      socket.off('task_approved', handleTaskApproved);
    };
  }, [socket]);

  // Fix: pass correct user id for poll voting
  const handleVotePoll = async (pollId, optionIdx) => {
    const token = localStorage.getItem('token');
    // Defensive: user._id or user.id
    const userId = user?._id || user?.id;
    const userName = user?.name || user?.username || userId;
    if (!userId) return;
    try {
      await axios.post('/api/polls/vote', {
        pollId,
        optionIdx,
        userId,
        userName
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // No need to update local state; socket event will update for all
    } catch (err) {
      // Optionally show error
    }
  };

  // Fetch meetings for this chat
  const fetchMeetings = async () => {
    if (!chat?._id) return;
    try {
      const token = localStorage.getItem('token');
      const res = await api.get(`/meetings/chat/${chat._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('[DEBUG] Meetings fetched:', res.data);
      setMeetings(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('[DEBUG] Failed to fetch meetings:', err);
      setMeetings([]);
    }
  };

  // Always fetch meetings when chat changes
  useEffect(() => {
    fetchMeetings();
    // eslint-disable-next-line
  }, [chat && chat._id]);

  // Real-time meeting_created event
  useEffect(() => {
    if (!socket || !chat?._id) return;
    const handler = (meeting) => {
      if (meeting.chatId === chat._id || meeting.chatId?._id === chat._id) {
        console.log('[DEBUG] meeting_created event received:', meeting);
        fetchMeetings();
      }
    };
    socket.on('meeting_created', handler);
    return () => socket.off('meeting_created', handler);
  }, [socket, chat && chat._id]);

  // Join Meet handler
  const handleJoinMeeting = (meeting) => {
    // Redirect to video call page with meetingId
    window.location.href = `/video-call/${meeting.meetId}`;
  };

  if (!chat) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Select a chat to start messaging

      {/* My Profile Floating Button */}
      <button
        className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full shadow-lg border-4 border-blue-600 bg-gray-900 flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50"
        title="View My Profile"
        disabled={!user}
        onClick={() => {
          if (!user) return;
          setShowUserProfile(true);
        }}
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.25)' }}
      >
        <img
          src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random`}
          alt={user?.name || 'User'}
          className="w-12 h-12 rounded-full object-cover"
          onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random`; }}
        />
      </button>
    </div>
  );
};

  const isGroup = chat.isGroupChat;
  // Robust admin check: groupAdmin can be id or user object
  const adminId = typeof chat.groupAdmin === 'object' ? chat.groupAdmin._id : chat.groupAdmin;
  const isAdmin = adminId === user?._id;

  // Debug: log admin check
if (isGroup) {
  // Only log admin info for group chats
  console.log('adminId:', adminId, 'user._id:', user?._id, 'isAdmin:', isAdmin);
}

  const handleSend = (e) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(chat._id, input);
      setInput('');
    }
  };

  const handleEmojiSelect = (emoji) => {
    setInput(input + (emoji.native || emoji.emoji));
    // Do NOT close the picker here
  };

  const handlePaperclipClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) { // 20MB limit
      setUploadError('File too large (max 20MB)');
      return;
    }
    setUploading(true);
    setUploadError(null);
    try {
      const token = localStorage.getItem('token');
      await uploadChatFile({ chatId: chat._id, file, token });
      // Always refresh messages after upload in case socket event is missed
      await loadMessages(chat._id, token);
    } catch (err) {
      setUploadError('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Modal handlers
  const handleOpenGroupInfo = () => setShowGroupInfo(true);
  const handleCloseGroupInfo = () => setShowGroupInfo(false);
  const handleOpenUserProfile = (u) => { setSelectedUser(u); setShowUserProfile(true); };
  const handleCloseUserProfile = () => setShowUserProfile(false);
  const handleOpenCreatePoll = () => setShowCreatePoll(true);
  const handleCloseCreatePoll = () => setShowCreatePoll(false);
  const handleCreatePoll = async (poll) => {
    const token = localStorage.getItem('token');
    try {
      // Always use backend API for creation
      const res = await api.post('/polls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...poll, chatId: chat._id, creator: user, members: chat.participants.map(p => ({ id: p._id, name: p.name })) })
      });
      if (!res.ok) throw new Error('Poll creation failed');
      const createdPoll = await res.json();
      console.log('[DEBUG] Poll created, backend response:', createdPoll);
      // Instead of optimistic update, always re-fetch from backend for true source of state
      await fetchPolls(chat._id, token)
        .then((data) => {
          const arr = Array.isArray(data) ? data : (data.polls || []);
          console.log('[DEBUG] Polls after creation:', arr);
          setPolls(arr.map(p => ({
            ...p,
            id: p.id || p._id,
            chatId: typeof p.chatId === 'object' && p.chatId !== null && p.chatId.toString ? p.chatId.toString() : String(p.chatId)
          })));
        })
        .catch((err) => { console.error('[DEBUG] Poll fetch error after create:', err); setPolls([]); });
    } catch (err) {
      console.error('[DEBUG] Poll creation error:', err);
    }
    handleCloseCreatePoll();
  };
  const handleOpenTaskModal = () => setShowTaskModal(true);
  const handleCloseTaskModal = () => setShowTaskModal(false);
  const handleAssignTask = async (desc, member) => {
    const token = localStorage.getItem('token');
    try {
      await createTask({ description: desc, assignedTo: member, createdBy: user, chatId: chat._id }, token);
      // No need to update local state; socket event will update for all
    } catch (err) {
      // Optionally show error
    }
    handleCloseTaskModal();
  };
  const handleOpenScheduleCall = () => setShowScheduleCall(true);
  const handleCloseScheduleCall = () => setShowScheduleCall(false);
  const handleSchedule = async (schedule) => {
    const token = localStorage.getItem('token');
    try {
      await createSchedule({ ...schedule, chatId: chat._id, createdBy: user }, token);
      // No need to update local state; socket event will update for all
    } catch (err) {
      // Optionally show error
    }
    handleCloseScheduleCall();
  };

  // Merge messages, polls, and tasks into a single array and sort by timestamp/id
  const combinedItems = [
    ...getMessages(chat?._id).map(m => ({ ...m, _type: 'message', time: new Date(m.timestamp || m.createdAt || Date.now()).getTime() })),
    ...meetings
      .filter(m => String(m.chatId) === String(chat?._id))
      .map(m => ({
        ...m,
        _type: 'meeting',
        time: m.createdAt ? new Date(m.createdAt).getTime() : Date.now(),
      })),
    ...polls
      .filter(p => String(p.chatId) === String(chat?._id))
      .map(p => ({
        ...p,
        _type: 'poll',
        time: p.createdAt ? new Date(p.createdAt).getTime() : (p.id || p._id || Date.now()),
        options: Array.isArray(p.options) ? p.options : [],
        members: Array.isArray(p.members) ? p.members : (chat.participants ? chat.participants.map(u => ({ id: u._id, name: u.name })) : []),
        creator: p.creator || { _id: user._id, name: user.name, username: user.username }
      })),
    ...tasks.map(t => ({ ...t, _type: 'task', time: t.createdAt ? new Date(t.createdAt).getTime() : t.id })),
    ...schedules.map(s => ({ ...s, _type: 'schedule', time: s.scheduledTime ? new Date(s.scheduledTime).getTime() : s.id })),
  ].sort((a, b) => a.time - b.time);
        // Render scheduled video call inside the map, not outside

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-black">
        <div className="flex items-center gap-4">
          {isGroup ? (
            <img
              src={chat.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.name)}&background=random`}
              alt={chat.name}
              className="w-12 h-12 rounded-full object-cover cursor-pointer"
              onClick={handleOpenGroupInfo}
            />
          ) : (
            <div className="relative">
              <img
                src={(() => {
                  const other = chat.participants.find(p => p._id !== user._id);
                  return other?.avatar ? `${other.avatar.startsWith('http') ? '' : 'http://localhost:5000'}${other.avatar}?t=${other.avatarUpdatedAt || Date.now()}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(other?.name || 'User')}&background=random`;
                })()}
                alt={(() => {
                  const other = chat.participants.find(p => p._id !== user._id);
                  return other?.name || 'User';
                })()}
                className="w-12 h-12 rounded-full object-cover cursor-pointer"
                onClick={() => handleOpenUserProfile(chat.participants.find(p => p._id !== user._id))}
              />
              {/* Online/Offline dot */}
              <span
                className={`absolute bottom-1 right-1 w-3 h-3 rounded-full border-2 border-black ${(() => {
                  const other = chat.participants.find(p => p._id !== user._id);
                  return other?.isOnline ? 'bg-green-500' : 'bg-gray-400';
                })()}`}
                title={(() => {
                  const other = chat.participants.find(p => p._id !== user._id);
                  return other?.isOnline ? 'Online' : 'Offline';
                })()}
              />
            </div>
          )}
          <div className="cursor-pointer" onClick={isGroup ? handleOpenGroupInfo : () => handleOpenUserProfile(chat.participants.find(p => p._id !== user._id))}>
            <h2 className="text-lg font-semibold text-white">
              {isGroup
                ? chat.name
                : (() => {
                    const other = chat.participants.find(p => p._id !== user._id);
                    return other?.name || other?.username || 'User';
                  })()}
            </h2>
            <p className="text-xs text-gray-400">
              {isGroup
                ? `${chat.participants.length} members`
                : (() => {
                    const other = chat.participants.find(p => p._id !== user._id);
                    if (other?.isOnline) return 'Online';
                    if (other?.lastSeen) return `Last seen ${other.lastSeen}`;
                    return 'Offline';
                  })()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 relative">
          <button onClick={handleStartVoiceCall} className="p-2 rounded hover:bg-gray-800 text-green-400" title="Voice Call">
            <Phone size={20} />
          </button>
          <button onClick={handleStartVideoCall} className="p-2 rounded hover:bg-gray-800 text-blue-400" title="Video Call">
            <Video size={20} />
          </button>
      {/* Video Call Modal */}
      {videoCallModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center">
            {videoCallModal.isIncoming ? (
              <>
                <div className="text-lg font-semibold mb-4">Incoming video call from {videoCallModal.caller?.name || 'Unknown'}</div>
                <div className="flex gap-4">
                  <button onClick={handleAcceptVideoCall} className="px-6 py-2 bg-green-500 text-white rounded-lg font-bold">Accept</button>
                  <button onClick={handleDeclineVideoCall} className="px-6 py-2 bg-red-500 text-white rounded-lg font-bold">Decline</button>
                </div>
              </>
            ) : (
              <>
                <div className="text-lg font-semibold mb-4">Calling {videoCallModal.caller?.name || 'User'}...</div>
                <button onClick={handleCancelVideoCall} className="px-6 py-2 bg-gray-500 text-white rounded-lg font-bold mt-2">Cancel</button>
              </>
            )}
          </div>
        </div>
      )}
          <button onClick={() => setShowMenu((v) => !v)} className="p-2 rounded hover:bg-gray-800 text-gray-400" title="Menu">
            <MoreVertical size={20} />
          </button>
          {showMenu && (
            <GroupMenu
              isGroup={true} // Always true so menu shows for all chats
              isAdmin={true} // Always true so all options show
              onCreatePoll={() => { handleOpenCreatePoll(); setShowMenu(false); }}
              onScheduleCall={() => { setShowCreateMeeting(true); setShowMenu(false); }}
              onLeaveGroup={() => {}}
              onAssignTask={() => { handleOpenTaskModal(); setShowMenu(false); }}
              onClose={() => setShowMenu(false)}
            />
          )}
        </div>
      </div>

      {/* Meeting creation modal */}
      {showCreateMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <CreateMeeting
              chat={chat}
              currentUser={user}
              onMeetingCreated={() => { setShowCreateMeeting(false); fetchMeetings(); }}
              onClose={() => setShowCreateMeeting(false)}
            />
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4 space-y-4 bg-gray-900">

        {/* Meetings are now rendered in combinedItems below */}
        {combinedItems.map((item, idx) => {
          if (item._type === 'meeting') {
            const creatorId = item.creator?._id || item.creator?.id || item.creator;
            const isMine = String(creatorId) === String(user._id);
            return (
              <MeetingCard
                key={item._id || idx}
                meeting={item}
                currentUser={user}
                onJoin={handleMeetingJoin}
                alignRight={isMine}
              />
            );
          }
  // Meeting join handler for both invited and not-invited users
  function handleMeetingJoin(meeting) {
    const userId = String(user?._id || user?.id);
    const isInvited = meeting.participants.some(
      p => String(typeof p === 'string' ? p : p._id) === userId
    );
    if (isInvited) {
      navigate(`/video-call/${meeting.meetId}`);
    } else {
      setShowJoinById(true);
    }
  }
      {/* Join Meeting by ID Popup */}
      {showJoinById && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <button onClick={() => setShowJoinById(false)} className="absolute top-2 right-2 text-gray-400 hover:text-black">✕</button>
            <h2 className="text-lg font-semibold mb-2 text-gray-900">Enter Meeting ID to Join</h2>
            <JoinMeetingById onJoin={handleJoinMeetingById} />
          </div>
        </div>
      )}
          if (item._type === 'message') {
            // ...existing code for rendering messages...
            let senderId = '';
            if (item.sender && typeof item.sender === 'object') {
              senderId = item.sender._id || item.sender.id || '';
            } else {
              senderId = item.sender || item.senderId || '';
            }
            const isMine = senderId.toString() === user._id.toString();
            return (
              <div key={item._id || idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] rounded-lg px-4 py-2 mb-1 ${isMine ? 'bg-blue-600 text-white ml-auto' : 'bg-gray-800 text-gray-200 mr-auto'}`}
                  style={{ borderTopRightRadius: isMine ? 0 : undefined, borderTopLeftRadius: !isMine ? 0 : undefined }}>
                  {/* Sender name */}
                  {!isMine && (
                    <div className="text-xs text-blue-300 font-semibold mb-1">
                      {item.sender && typeof item.sender === 'object'
                        ? item.sender.name || item.sender.username || 'Unknown'
                        : (chat.participants?.find(p => p._id === senderId || p.id === senderId)?.name || 'Unknown')}
                    </div>
                  )}
                  {item.isFile ? (
                    item.fileType && item.fileType.startsWith('image/') ? (
                      <div className="flex flex-col items-end">
                        <div className="relative group">
                          <img
                            src={item.content}
                            alt={item.fileName || 'Image'}
                            className="max-w-[220px] max-h-[320px] rounded-lg shadow border border-gray-700 object-cover cursor-pointer transition-transform group-hover:scale-105"
                            onClick={() => window.open(item.content, '_blank')}
                          />
                          <span className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-0.5 rounded opacity-80 group-hover:opacity-100">
                            {item.fileName || 'Image'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2 px-3 py-2 bg-gray-700 rounded-lg text-blue-200">
                          <span role="img" aria-label="file">📎</span>
                          <span className="truncate max-w-[120px]">{item.fileName || 'File'}</span>
                          <a
                            href={item.content}
                            download={item.fileName}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs"
                          >
                            Download
                          </a>
                        </div>
                        <span className="text-xs text-gray-400 mt-1">{item.fileType}</span>
                      </div>
                    )
                  ) : (
                    item.content
                  )}
                </div>
              </div>
            );
          }
          if (item._type === 'poll') {
            // WhatsApp-like poll bubble styling
            // Use sender logic like messages: if poll.creator matches user._id, it's mine
            let isMine = false;
            // TRIPLE CHECK: Always treat poll as mine if creator matches user._id (string or object)
            // Fix: Use a unique variable name for poll alignment
            // Use a unique variable name for poll alignment to avoid redeclaration
            let pollAlignMine = false;
            if (item.creator) {
              if (typeof item.creator === 'string' || typeof item.creator === 'number') {
                pollAlignMine = String(item.creator) === String(user._id);
              } else if (item.creator._id) {
                pollAlignMine = String(item.creator._id) === String(user._id);
              } else if (item.creator.id) {
                pollAlignMine = String(item.creator.id) === String(user._id);
              }
            }
            // Show poll on right if sent by me, left if sent by others
            let pollIsMine = false;
            if (item.creator) {
              if (typeof item.creator === 'string' || typeof item.creator === 'number') {
                pollIsMine = String(item.creator) === String(user._id);
              } else if (item.creator._id) {
                pollIsMine = String(item.creator._id) === String(user._id);
              } else if (item.creator.id) {
                pollIsMine = String(item.creator.id) === String(user._id);
              }
            }
            return (
              <div key={item.id || item._id || idx} className={`flex ${pollAlignMine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="max-w-[70%] rounded-lg px-4 py-2 mb-1 bg-gray-800 text-gray-200 text-center"
                >
                  {/* Always show creator name */}
                  {item.creator && (item.creator.name || item.creator.username) && (
                    <div className="text-xs text-blue-300 font-semibold mb-1">
                      {item.creator.name || item.creator.username}
                    </div>
                  )}
                  <Poll
                    poll={item}
                    onVote={handleVotePoll}
                    currentUser={user}
                  />
                </div>
              </div>
            );
          }
          if (item._type === 'task') {
            return (
              <TaskMessage
                key={item.id || item._id || idx}
                task={item}
                onComplete={handleCompleteTask}
                onApprove={handleApproveTask}
                isAdmin={isAdmin}
                isAssignee={item.assignedTo === user.name}
              />
            );
          }
          if (item._type === 'schedule') {
            // Simple rendering for scheduled calls
            return (
              <div key={item.id || item._id || idx} className="bg-purple-800 text-white rounded-lg p-4 max-w-[80%] mx-auto my-2">
                <div className="font-semibold mb-1">Scheduled Video Call</div>
                <div>Date: {item.scheduledTime ? new Date(item.scheduledTime).toLocaleString() : 'N/A'}</div>
                <div>Duration: {item.duration} min</div>
                <div>Participants: {Array.isArray(item.participants) ? item.participants.length : 0}</div>
                <div className="mt-1 text-sm text-gray-200">{item.description}</div>
              </div>
            );
          }
          return null;
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-gray-800 bg-black flex items-center gap-2">
        <div className="relative">
          <button
            type="button"
            className="p-2 rounded hover:bg-gray-800 text-gray-400"
            onClick={() => setShowEmojiPicker(v => !v)}
            ref={emojiButtonRef}
          >
            <Smile size={22} />
          </button>
          {showEmojiPicker && (
            <div className="absolute bottom-12 left-0 z-50" ref={emojiPickerRef}>
              <Picker data={data} onEmojiSelect={handleEmojiSelect} theme="dark" />
            </div>
          )}
        </div>
        <input
          type="text"
          className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type a message..."
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <button type="button" className="p-2 rounded hover:bg-gray-800 text-gray-400" onClick={handlePaperclipClick}>
          <Paperclip size={22} />
        </button>
        <button type="submit" className="p-2 rounded bg-blue-600 hover:bg-blue-700 text-white">
          <Send size={22} />
        </button>
        {uploadError && <div className="text-red-400 text-xs ml-2">{uploadError}</div>}
        {uploading && <div className="text-blue-400 text-xs ml-2">Uploading...</div>}
      </form>

      {/* Modals and Portals */}
      {showGroupInfo && (
        <GroupInfo 
          group={{
            ...((chats.find(c => c._id === chat._id)) || chat),
            members: ((chats.find(c => c._id === chat._id) || chat).participants || []).map(p => ({
              id: p._id || p.id || p.name,
              name: p.name || p.username || 'User',
              avatar: p.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name || p.username || 'User')}&background=random`,
              role: (typeof chat.groupAdmin === 'object' ? chat.groupAdmin._id : chat.groupAdmin) === (p._id || p.id) ? 'admin' : 'member',
              messageCount: p.messageCount || 0
            }))
          }}
          onClose={handleCloseGroupInfo}
          onMemberClick={handleOpenUserProfile}
        />
      )}
      {showUserProfile && (
        <UserProfile user={selectedUser} onClose={() => setShowUserProfile(false)} onPaymentClick={() => {}} />
      )}
      {showCreatePoll && (
        <CreatePoll onClose={handleCloseCreatePoll} onCreatePoll={handleCreatePoll} />
      )}
      {showTaskModal && (
        <TaskAssignmentModal 
          onClose={handleCloseTaskModal} 
          onAssignTask={handleAssignTask} 
          groupMembers={chat.participants} 
          isAdmin={isAdmin}
        />
      )}
      {showScheduleCall && (
        <ScheduleCall onClose={handleCloseScheduleCall} onSchedule={handleSchedule} group={{ members: chat.participants }} />
      )}
      {showAnalytics && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl relative">
            <button onClick={() => setShowAnalytics(false)} className="absolute top-2 right-2 text-gray-400 hover:text-white">✕</button>
            <AnalyticsGraph tasks={tasks} members={chat.participants} />
          </div>
        </div>
      )}
      {showVoiceCall && voiceCallCallee && (
        <VoiceCallModal
          chat={chat}
          onClose={() => {
            setShowVoiceCall(false);
            setVoiceCallCallee(null);
            setIsCaller(false);
            isCallerRef.current = false;
          }}
          callee={voiceCallCallee}
          isCaller={isCaller}
        />
      )}
      {showVideoCall && currentCallId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
          <div className="bg-gray-900 rounded-lg w-full h-full max-w-5xl max-h-[90vh] relative overflow-hidden flex flex-col">
            <button onClick={() => { setShowVideoCall(false); setCurrentCallId(null); }} className="absolute top-2 right-2 text-gray-400 hover:text-white z-10">✕</button>
            {/* Always pass currentCallId as callId prop for 1:1 calls */}
            <VideoCall callId={currentCallId} />
          </div>
        </div>
      )}
      {/* My Profile Floating Button */}
      <button
        className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full shadow-lg border-4 border-blue-600 bg-gray-900 flex items-center justify-center hover:scale-105 transition-transform"
        title="View My Profile"
        onClick={() => { setSelectedUser(user); setShowUserProfile(true); }}
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.25)' }}
      >
        <img
          key={user.avatar}
          src={user.avatar && !user.avatar.startsWith('http') ? `http://localhost:5000${user.avatar}?t=${user.avatarUpdatedAt || Date.now()}` : (user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`)}
          alt={user.name}
          className="w-12 h-12 rounded-full object-cover"
          onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`; }}
        />
      </button>
    </div>
  );
};

export default ChatBox;