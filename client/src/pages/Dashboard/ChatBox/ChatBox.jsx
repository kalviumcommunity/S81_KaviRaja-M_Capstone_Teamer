import React, { useState, useRef, useEffect } from 'react';
import { Phone, Video, MoreVertical, Paperclip, Send, Smile, Mic, BarChart3, CreditCard, X, ChevronDown } from 'lucide-react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import GroupInfo from './GroupInfo';
import UserProfile from './UserProfile';
import GroupPerformance from './GroupPerformance';
import CreatePoll from './CreatePoll';
import ScheduleCall from './ScheduleCall';
import GroupMenu from './GroupMenu';
import TaskAssignmentModal from './TaskAssignmentModal';
import TaskMessage from './TaskMessage';
import AnalyticsGraph from './AnalyticsGraph';
import { useNavigate } from 'react-router-dom';
import { useCall } from '../../../context/CallContext';
import { useSocket } from '../../../context/SocketContext';
import { useAuth } from '../../../context/AuthContext';

const ChatBox = ({ chat }) => {
  const navigate = useNavigate();
  const { joinCall } = useCall();
  const { socket } = useSocket();
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [showCallModal, setShowCallModal] = useState(false);
  const [callType, setCallType] = useState(null);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPerformance, setShowPerformance] = useState(false);
  const [showGroupMenu, setShowGroupMenu] = useState(false);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [showScheduleCall, setShowScheduleCall] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const previousScrollHeightRef = useRef(0);
  const emojiButtonRef = useRef(null);

  const scrollToBottom = (force = false) => {
    if (!isUserScrolling || force) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setHasUnreadMessages(false);
    } else {
      setHasUnreadMessages(true);
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      const container = chatContainerRef.current;
      previousScrollHeightRef.current = container.scrollHeight;

      const handleScroll = () => {
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
        setIsUserScrolling(!isNearBottom);
        if (isNearBottom) {
          setHasUnreadMessages(false);
        }
      };

      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  useEffect(() => {
    if (chatContainerRef.current && messages.length > 0) {
      const container = chatContainerRef.current;
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      
      if (!isUserScrolling || isNearBottom) {
        scrollToBottom();
      } else {
        setHasUnreadMessages(true);
      }
    }
  }, [messages]);

  useEffect(() => {
    if (chat?.id) {
      const savedMessages = localStorage.getItem(`chat-messages-${chat.id}`);
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      } else {
        setMessages([]);
      }
      setIsUserScrolling(false);
      setHasUnreadMessages(false);
    }
  }, [chat?.id]);

  useEffect(() => {
    if (chat?.id) {
      localStorage.setItem(`chat-messages-${chat.id}`, JSON.stringify(messages));
    }
  }, [messages, chat?.id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiButtonRef.current && !emojiButtonRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleMemberClick = (member) => {
    setSelectedUser(member);
    setShowUserProfile(true);
    setShowGroupInfo(false);
  };

  const handlePaymentClick = () => {
    const paymentMessage = {
      id: Date.now(),
      type: 'payment',
      amount: 100,
      sender: 'You',
      timestamp: new Date().toISOString(),
      status: 'sent'
    };
    setMessages(prev => [...prev, paymentMessage]);
    setShowUserProfile(false);
    scrollToBottom(true);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      const newMessage = {
        id: Date.now(),
        type: 'text',
        content: message,
        sender: user?.name || 'You',
        senderId: user?._id,
        chatId: chat.id,
        timestamp: new Date().toISOString(),
        status: 'sent'
      };
      setMessages(prev => [...prev, newMessage]);
      setMessage('');
      scrollToBottom(true);
      // Real-time: emit to server
      if (socket && chat?.id) {
        socket.emit('sendMessage', { ...newMessage, chatId: chat.id });
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newMessage = {
        id: Date.now(),
        type: 'file',
        content: file.name,
        fileType: file.type,
        sender: 'You',
        timestamp: new Date().toISOString(),
        status: 'sent'
      };
      setMessages(prev => [...prev, newMessage]);
      scrollToBottom(true);
    }
  };

  const handleEmojiSelect = (emoji) => {
    const cursor = document.querySelector('input[type="text"]').selectionStart;
    const text = message.slice(0, cursor) + emoji.native + message.slice(cursor);
    setMessage(text);
  };

  const handleCreateTask = (taskText, assignedTo) => {
    const newTask = {
      id: Date.now(),
      description: taskText,
      assignedTo,
      completed: false,
      approved: false,
      timestamp: new Date().toISOString()
    };
    setTasks(prev => [...prev, newTask]);
    
    const taskMessage = {
      id: Date.now(),
      type: 'task',
      content: `New task assigned: ${taskText}`,
      taskId: newTask.id,
      assignedTo,
      sender: 'You',
      timestamp: new Date().toISOString(),
      status: 'sent'
    };
    setMessages(prev => [...prev, taskMessage]);
    scrollToBottom(true);
  };

  const handleTaskComplete = (taskId) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: true } : task
    ));
    
    const completionMessage = {
      id: Date.now(),
      type: 'system',
      content: `Task marked as complete`,
      taskId,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, completionMessage]);
    scrollToBottom();
  };

  const handleTaskApprove = (taskId) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, approved: true } : task
    ));
    
    const approvalMessage = {
      id: Date.now(),
      type: 'system',
      content: `Task approved by admin`,
      taskId,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, approvalMessage]);
    scrollToBottom();
  };

  const handleCreatePoll = (pollData) => {
    const pollMessage = {
      id: Date.now(),
      type: 'poll',
      content: pollData.question,
      options: pollData.options.map(option => ({
        text: option,
        votes: [],
        percentage: 0
      })),
      settings: {
        multipleAnswers: pollData.multipleAnswers,
        showVoters: pollData.showVoters,
        expiresAt: pollData.expiresAt
      },
      creator: 'You',
      timestamp: new Date().toISOString(),
      status: 'active'
    };
    setMessages(prev => [...prev, pollMessage]);
    setShowCreatePoll(false);
    scrollToBottom(true);
  };

  const handleVote = (pollId, optionIndex, voter) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === pollId && msg.type === 'poll') {
        if (!msg.settings.multipleAnswers) {
          msg.options.forEach(opt => {
            opt.votes = opt.votes.filter(v => v !== voter);
          });
        }
        
        const updatedOptions = msg.options.map((option, index) => {
          if (index === optionIndex) {
            const hasVoted = option.votes.includes(voter);
            const newVotes = hasVoted 
              ? option.votes.filter(v => v !== voter)
              : [...option.votes, voter];
            
            return {
              ...option,
              votes: newVotes
            };
          }
          return option;
        });

        const totalVotes = updatedOptions.reduce((acc, opt) => acc + opt.votes.length, 0);
        const optionsWithPercentages = updatedOptions.map(opt => ({
          ...opt,
          percentage: totalVotes > 0 ? (opt.votes.length / totalVotes) * 100 : 0
        }));

        return { ...msg, options: optionsWithPercentages };
      }
      return msg;
    }));
  };

  const handleScheduleCall = (callData) => {
    const callId = `call-${Date.now()}`; // Generate unique call ID
    const callMessage = {
      id: callId, // Use the same ID for both message and call
      type: 'scheduledCall',
      scheduledTime: callData.scheduledTime,
      duration: callData.duration,
      description: callData.description,
      participants: callData.participants,
      sender: 'You',
      timestamp: new Date().toISOString(),
      status: 'scheduled'
    };
    
    setMessages(prev => [...prev, callMessage]);
    setShowScheduleCall(false);
    scrollToBottom(true);
  };

  const handleLeaveGroup = () => {
    const systemMessage = {
      id: Date.now(),
      type: 'system',
      content: 'You left the group',
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, systemMessage]);
    scrollToBottom(true);
  };

  const handleJoinCall = (callId) => {
    // Find call message
    const callMessage = messages.find(msg => msg.id === callId && msg.type === 'scheduledCall');
    if (callMessage) {
      joinCall({
        id: callId,
        ...callMessage
      });
      navigate(`/video-call/${callId}`);
    }
  };

  const renderMessage = (msg) => {
    const isOwnMessage = msg.sender === 'You';
    const baseClasses = "px-4 py-2 rounded-lg max-w-[70%] break-words";
    const messageClasses = isOwnMessage
      ? `${baseClasses} bg-blue-600 text-white ml-auto`
      : `${baseClasses} bg-gray-700 text-white`;

    switch (msg.type) {
      case 'text':
        return (
          <div className={messageClasses}>
            {msg.content}
          </div>
        );
      case 'file':
        return (
          <div className={messageClasses}>
            <div className="flex items-center gap-2">
              <Paperclip className="w-4 h-4" />
              <span>{msg.content}</span>
            </div>
          </div>
        );
      case 'payment':
        return (
          <div className={messageClasses}>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span>Payment sent: ${msg.amount}</span>
            </div>
          </div>
        );
      case 'task':
        return (
          <TaskMessage
            task={tasks.find(t => t.id === msg.taskId)}
            onComplete={handleTaskComplete}
            onApprove={handleTaskApprove}
            isAdmin={true}
            isAssignee={msg.assignedTo === 'You'}
          />
        );
      case 'poll':
        return (
          <div className={messageClasses}>
            <h4 className="font-semibold mb-2">{msg.content}</h4>
            <div className="space-y-2">
              {msg.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleVote(msg.id, index, 'You')}
                  className="w-full text-left p-2 hover:bg-opacity-80 rounded"
                >
                  <div className="flex justify-between">
                    <span>{option.text}</span>
                    <span>{option.percentage.toFixed(1)}%</span>
                  </div>
                  <div className="h-1 bg-gray-600 mt-1 rounded">
                    <div
                      className="h-full bg-blue-500 rounded"
                      style={{ width: `${option.percentage}%` }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      case 'scheduledCall':
        const isCallActive = new Date(msg.scheduledTime) <= new Date();
        const participants = msg.participants.map(id => 
          chat.members.find(m => m.id === id)
        ).filter(Boolean);

        return (
          <div className={messageClasses}>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-blue-500" />
                  <h4 className="font-semibold text-white">Video Call</h4>
                </div>
                <span className="text-sm text-gray-400">
                  Created by {msg.sender}
                </span>
              </div>
              
              <p className="text-sm text-gray-300 mb-3">{msg.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>{new Date(msg.scheduledTime).toLocaleString()}</span>
                  <span>{msg.duration} minutes</span>
                </div>
                <div className="text-sm text-gray-400">
                  Participants: {participants.map(p => p.name).join(', ')}
                </div>
              </div>

              {isCallActive ? (
                <button 
                  onClick={() => handleJoinCall(msg.id)}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Join Call
                </button>
              ) : (
                <div className="text-sm text-gray-400">
                  Starting in {formatTimeUntilCall(msg.scheduledTime)}
                </div>
              )}
            </div>
          </div>
        );
      case 'system':
        return (
          <div className="text-center text-sm py-2 text-gray-400">
            {msg.content}
          </div>
        );
      default:
        return null;
    }
  };

  const formatTimeUntilCall = (scheduledTime) => {
    const diff = new Date(scheduledTime) - new Date();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} days`;
    if (hours > 0) return `${hours} hours`;
    return `${minutes} minutes`;
  };

  if (!chat) {
    return (
      <div className="flex flex-col h-full bg-gray-900 items-center justify-center text-gray-400">
        <p>Select a chat to start messaging</p>
      </div>
    );
  }

  const handleGroupHeaderClick = () => {
    setShowGroupInfo(true);
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900">
        <div className="flex items-center gap-4">
          <div 
            className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center cursor-pointer overflow-hidden"
            onClick={() => chat.isGroup ? setShowGroupInfo(true) : handleMemberClick(chat)}
          >
            <img
              src={chat.avatar}
              alt={chat.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.name)}&background=random`;
              }}
            />
          </div>
          <div>
            <h2 className="font-semibold text-white text-lg">{chat.name}</h2>
            {chat.isGroup ? (
              <p className="text-sm text-gray-400">{chat.members?.length || 0} members</p>
            ) : (
              <p className="text-sm text-gray-400">
                {chat.isOnline ? 'Online' : `Last seen ${chat.lastSeen}`}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setCallType('audio');
              setShowCallModal(true);
            }}
            className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"
          >
            <Phone className="w-6 h-6" />
          </button>
          <button
            onClick={() => {
              setCallType('video');
              setShowCallModal(true);
            }}
            className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"
          >
            <Video className="w-6 h-6" />
          </button>
          <button
            onClick={() => setShowGroupMenu(true)}
            className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"
          >
            <MoreVertical className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-6 space-y-4"
      >
        {messages.map((msg) => (
          <div key={msg.id} className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-gray-500">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
              {msg.sender !== 'You' && (
                <span className="text-sm font-medium text-gray-400">{msg.sender}</span>
              )}
            </div>
            {renderMessage(msg)}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-800 bg-gray-900">
        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
          <button
            type="button"
            className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"
            onClick={() => document.getElementById('file-input').click()}
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            id="file-input"
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full p-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-none"
            />
            <div ref={emojiButtonRef} className="absolute right-2 top-1/2 -translate-y-1/2">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 hover:bg-gray-700 rounded-full text-gray-400 hover:text-white transition-colors"
              >
                <Smile className="w-5 h-5" />
              </button>
              {showEmojiPicker && (
                <div className="absolute bottom-12 right-0 z-50">
                  <Picker
                    data={data}
                    onEmojiSelect={handleEmojiSelect}
                    theme="dark"
                    previewPosition="none"
                  />
                </div>
              )}
            </div>
          </div>
          <button
            type="button"
            className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"
          >
            <Mic className="w-5 h-5" />
          </button>
          <button
            type="submit"
            disabled={!message.trim()}
            className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Call Modal */}
      {showCallModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-8 w-full max-w-md">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-gray-800 mx-auto mb-4 flex items-center justify-center">
                {chat?.name?.[0]?.toUpperCase()}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{chat?.name}</h3>
              <p className="text-gray-400 mb-8">{callType === 'video' ? 'Video Call' : 'Voice Call'}</p>
              
              <div className="flex justify-center gap-6">
                <button className="p-4 bg-gray-800 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
                  <Mic className="w-6 h-6" />
                </button>
                {callType === 'video' && (
                  <button className="p-4 bg-gray-800 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
                    <Video className="w-6 h-6" />
                  </button>
                )}
                <button 
                  onClick={() => setShowCallModal(false)}
                  className="p-4 bg-red-600 rounded-full text-white hover:bg-red-700 transition-colors"
                >
                  <Phone className="w-6 h-6 rotate-135" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Other Modals */}
      {showGroupInfo && chat && (
        <GroupInfo
          group={chat}
          onClose={() => setShowGroupInfo(false)}
          onMemberClick={handleMemberClick}
        />
      )}
      {showUserProfile && selectedUser && (
        <UserProfile
          user={selectedUser}
          onClose={() => setShowUserProfile(false)}
          onPaymentClick={handlePaymentClick}
        />
      )}
      {showPerformance && chat && (
        <GroupPerformance
          members={chat.members || []}
          onClose={() => setShowPerformance(false)}
        />
      )}
      {showCreatePoll && (
        <CreatePoll
          onClose={() => setShowCreatePoll(false)}
          onCreatePoll={handleCreatePoll}
        />
      )}
      {showScheduleCall && (
        <ScheduleCall
          onClose={() => setShowScheduleCall(false)}
          onSchedule={handleScheduleCall}
          group={chat}
        />
      )}
      {showGroupMenu && chat && (
        <GroupMenu
          isGroup={true}
          isAdmin={true}
          onClose={() => setShowGroupMenu(false)}
          onCreatePoll={() => {
            setShowGroupMenu(false);
            setShowCreatePoll(true);
          }}
          onScheduleCall={() => {
            setShowGroupMenu(false);
            setShowScheduleCall(true);
          }}
          onAssignTask={() => {
            setShowGroupMenu(false);
            setShowTaskModal(true);
          }}
          onLeaveGroup={handleLeaveGroup}
        />
      )}
      {showTaskModal && chat && (
        <TaskAssignmentModal
          onClose={() => setShowTaskModal(false)}
          onAssignTask={handleCreateTask}
          groupMembers={chat.members || []}
        />
      )}
    </div>
  );
};

export default ChatBox;