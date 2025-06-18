import React, { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';

const ChatTester = () => {
  const socket = useSocket();
  const { user } = useAuth();
  const { messages, sendMessage } = useChat();
  const [messageInput, setMessageInput] = useState('');
  const [debugLogs, setDebugLogs] = useState([]);

  // Log socket events
  useEffect(() => {
    if (socket) {
      const log = (event, data) => {
        setDebugLogs(prev => [...prev, {
          time: new Date().toLocaleTimeString(),
          event,
          data
        }]);
      };

      socket.on('connect', () => log('connect', 'Socket connected'));
      socket.on('disconnect', () => log('disconnect', 'Socket disconnected'));
      socket.on('new_message', (msg) => log('new_message', msg));
      socket.on('user_status', (status) => log('user_status', status));

      return () => {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('new_message');
        socket.off('user_status');
      };
    }
  }, [socket]);

  const handleTestMessage = () => {
    if (messageInput.trim()) {
      sendMessage('test-chat', messageInput);
      setMessageInput('');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 bg-white p-4 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Chat Tester</h2>
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            className="flex-1 p-2 border rounded"
            placeholder="Type a test message..."
          />
          <button
            onClick={handleTestMessage}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Send Test Message
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-bold mb-2">Debug Logs:</h3>
        <div className="h-60 overflow-y-auto border rounded p-2">
          {debugLogs.map((log, index) => (
            <div key={index} className="text-sm mb-1">
              <span className="text-gray-500">{log.time}</span> -{' '}
              <span className="font-semibold">{log.event}</span>:{' '}
              <span className="text-blue-600">
                {typeof log.data === 'string' ? log.data : JSON.stringify(log.data)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatTester;