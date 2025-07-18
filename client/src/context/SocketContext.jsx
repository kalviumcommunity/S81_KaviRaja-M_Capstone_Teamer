import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import { getBackendURL } from '../utils/fetchApi';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const newSocket = io(getBackendURL(), {
        withCredentials: true,
        query: { userId: user._id }
      });

      // Join userId room for targeted events (meetings, etc)
      newSocket.on('connect', () => {
        if (user._id) {
          console.log('[DEBUG] Emitting user_join with userId:', user._id);
          newSocket.emit('user_join', user._id);
        } else {
          console.warn('[DEBUG] user._id is missing on socket connect:', user);
        }
      });

      // Add error and disconnect logging
      newSocket.on('connect_error', (err) => {
        console.error('[SocketContext] connect_error:', err);
      });
      newSocket.on('error', (err) => {
        console.error('[SocketContext] error:', err);
      });
      newSocket.on('disconnect', (reason) => {
        console.warn('[SocketContext] disconnect:', reason);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    } else {
      setSocket(null);
    }
  }, [user]);

  // Always provide the context, even if socket is null
  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  // Do not throw if socket is null, just return null
  return useContext(SocketContext);
};
