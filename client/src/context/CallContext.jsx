
import React, { createContext, useContext, useState } from 'react';

export const CallContext = createContext(null);

export const CallProvider = ({ children }) => {
  const [activeCall, setActiveCall] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const joinCall = (callData) => {
    try {
      setLoading(true);
      setActiveCall(callData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const leaveCall = () => {
    try {
      setLoading(true);
      setActiveCall(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    activeCall,
    loading,
    error,
    joinCall,
    leaveCall
  };

  return (
    <CallContext.Provider value={value}>
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
};