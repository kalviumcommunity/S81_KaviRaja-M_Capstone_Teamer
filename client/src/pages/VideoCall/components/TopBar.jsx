import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const TopBar = ({ callId }) => {
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-16 bg-gray-800 flex items-center justify-between px-6">
      <h1 className="text-white font-semibold">Meeting ID: {callId}</h1>
      <div className="flex items-center gap-2 text-gray-400">
        <Clock className="w-4 h-4" />
        <span>{formatDuration(duration)}</span>
      </div>
    </div>
  );
};

export default TopBar;