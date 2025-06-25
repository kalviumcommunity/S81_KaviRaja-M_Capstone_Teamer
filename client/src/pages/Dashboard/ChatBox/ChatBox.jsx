import React, { useState, useRef, useEffect } from 'react';
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

const ChatBox = ({ chat }) => {
  const { user } = useAuth();
  const { messages, sendMessage } = useChat();
  const [input, setInput] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showScheduleCall, setShowScheduleCall] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showVoiceCall, setShowVoiceCall] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [polls, setPolls] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const emojiButtonRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

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

  if (!chat) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Select a chat to start messaging
      </div>
    );
  }

  const isGroup = chat.isGroupChat;
  const isAdmin = chat.groupAdmin === user?._id;

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Placeholder: send file name as message. Replace with upload logic.
      sendMessage(chat._id, `[File] ${file.name}`);
    }
  };

  // Modal handlers
  const handleOpenGroupInfo = () => setShowGroupInfo(true);
  const handleCloseGroupInfo = () => setShowGroupInfo(false);
  const handleOpenUserProfile = (u) => { setSelectedUser(u); setShowUserProfile(true); };
  const handleCloseUserProfile = () => setShowUserProfile(false);
  const handleOpenCreatePoll = () => setShowCreatePoll(true);
  const handleCloseCreatePoll = () => setShowCreatePoll(false);
  const handleOpenTaskModal = () => setShowTaskModal(true);
  const handleCloseTaskModal = () => setShowTaskModal(false);
  const handleOpenScheduleCall = () => setShowScheduleCall(true);
  const handleCloseScheduleCall = () => setShowScheduleCall(false);

  // Poll and Task handlers (stubbed for now)
  const handleCreatePoll = (poll) => {
    setPolls((prev) => [...prev, { ...poll, id: Date.now(), creator: user, members: chat.participants, options: poll.options.map(opt => ({ text: opt, votes: [] })), totalVotes: 0 }]);
    handleCloseCreatePoll();
  };
  const handleAssignTask = (desc, member) => {
    setTasks((prev) => [...prev, { id: Date.now(), description: desc, assignedTo: member, completed: false, approved: false }]);
    handleCloseTaskModal();
  };
  const handleCompleteTask = (id) => {
    setTasks((prev) => prev.map(t => t.id === id ? { ...t, completed: true } : t));
  };
  const handleApproveTask = (id) => {
    setTasks((prev) => prev.map(t => t.id === id ? { ...t, approved: true } : t));
  };

  // Merge messages, polls, and tasks into a single array and sort by timestamp/id
  const combinedItems = [
    ...messages.filter(m => m.chatId === chat._id).map(m => ({ ...m, _type: 'message', time: new Date(m.timestamp || m.createdAt || Date.now()).getTime() })),
    ...polls.map(p => ({ ...p, _type: 'poll', time: p.createdAt ? new Date(p.createdAt).getTime() : p.id })),
    ...tasks.map(t => ({ ...t, _type: 'task', time: t.createdAt ? new Date(t.createdAt).getTime() : t.id })),
  ].sort((a, b) => a.time - b.time);

  return (
    <div className="flex flex-col h-full">
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
                  return other?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(other?.name || 'User')}&background=random`;
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
          <button onClick={() => setShowVoiceCall(true)} className="p-2 rounded hover:bg-gray-800 text-green-400" title="Voice Call">
            <Phone size={20} />
          </button>
          <button onClick={() => setShowVideoCall(true)} className="p-2 rounded hover:bg-gray-800 text-blue-400" title="Video Call">
            <Video size={20} />
          </button>
          <button onClick={() => setShowMenu((v) => !v)} className="p-2 rounded hover:bg-gray-800 text-gray-400" title="Menu">
            <MoreVertical size={20} />
          </button>
          {showMenu && (
            <GroupMenu
              isGroup={true} // Always true so menu shows for all chats
              isAdmin={true} // Always true so all options show
              onCreatePoll={() => { handleOpenCreatePoll(); setShowMenu(false); }}
              onScheduleCall={() => { handleOpenScheduleCall(); setShowMenu(false); }}
              onLeaveGroup={() => {}}
              onAssignTask={() => { handleOpenTaskModal(); setShowMenu(false); }}
              onClose={() => setShowMenu(false)}
            />
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gray-900">
        {combinedItems.map((item, idx) => {
          if (item._type === 'message') {
            const senderId = item.senderId || item.sender;
            return (
              <div key={item._id || idx} className={`flex ${senderId === user._id ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] rounded-lg px-4 py-2 ${senderId === user._id ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-200'}`}>
                  {item.content}
                </div>
              </div>
            );
          }
          if (item._type === 'poll') {
            return <Poll key={item.id} poll={item} onVote={() => {}} currentUser={user} />;
          }
          if (item._type === 'task') {
            return (
              <TaskMessage
                key={item.id}
                task={item}
                onComplete={handleCompleteTask}
                onApprove={handleApproveTask}
                isAdmin={isAdmin}
                isAssignee={item.assignedTo === user.name}
              />
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
      </form>

      {/* Modals and Portals */}
      {showGroupInfo && (
        <GroupInfo group={chat} onClose={handleCloseGroupInfo} onMemberClick={handleOpenUserProfile} />
      )}
      {showUserProfile && selectedUser && (
        <UserProfile user={selectedUser} onClose={handleCloseUserProfile} onPaymentClick={() => {}} />
      )}
      {showCreatePoll && (
        <CreatePoll onClose={handleCloseCreatePoll} onCreatePoll={handleCreatePoll} />
      )}
      {showTaskModal && (
        <TaskAssignmentModal onClose={handleCloseTaskModal} onAssignTask={handleAssignTask} groupMembers={chat.participants} />
      )}
      {showScheduleCall && (
        <ScheduleCall onClose={handleCloseScheduleCall} onSchedule={() => {}} group={chat} />
      )}
      {showAnalytics && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl relative">
            <button onClick={() => setShowAnalytics(false)} className="absolute top-2 right-2 text-gray-400 hover:text-white">✕</button>
            <AnalyticsGraph tasks={tasks} members={chat.participants} />
          </div>
        </div>
      )}
      {showVoiceCall && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="bg-gray-800 rounded-lg p-8 w-full max-w-md relative flex flex-col items-center">
            <button onClick={() => setShowVoiceCall(false)} className="absolute top-2 right-2 text-gray-400 hover:text-white">✕</button>
            <Phone size={48} className="text-green-400 mb-4" />
            <h2 className="text-white text-xl mb-2">Voice Call</h2>
            <p className="text-gray-300 mb-4">Voice call UI coming soon...</p>
            <button onClick={() => setShowVoiceCall(false)} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">End Call</button>
          </div>
        </div>
      )}
      {showVideoCall && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
          <div className="bg-gray-900 rounded-lg w-full h-full max-w-5xl max-h-[90vh] relative overflow-hidden flex flex-col">
            <button onClick={() => setShowVideoCall(false)} className="absolute top-2 right-2 text-gray-400 hover:text-white z-10">✕</button>
            <VideoCall />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBox;