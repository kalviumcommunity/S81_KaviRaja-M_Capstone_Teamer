import React from 'react';
import { LogOut, PieChart, Video, Users, CheckSquare } from 'lucide-react';

const GroupMenu = ({ isGroup, isAdmin, onCreatePoll, onScheduleCall, onLeaveGroup, onAssignTask, onClose }) => {
  if (!isGroup) return null;

  return (
    <div className="absolute right-0 top-12 bg-gray-900 rounded-lg shadow-lg py-2 w-48 border border-gray-800 z-50">
      {isAdmin && (
        <>
          <button
            onClick={() => { onCreatePoll(); onClose(); }}
            className="w-full flex items-center px-4 py-2 text-white hover:bg-gray-800 transition-colors"
          >
            <PieChart size={18} className="mr-2" />
            Create Poll
          </button>
          <button
            onClick={() => { onScheduleCall(); onClose(); }}
            className="w-full flex items-center px-4 py-2 text-white hover:bg-gray-800 transition-colors"
          >
            <Video size={18} className="mr-2" />
            Schedule Call
          </button>
          <button
            onClick={() => { onAssignTask(); onClose(); }}
            className="w-full flex items-center px-4 py-2 text-white hover:bg-gray-800 transition-colors"
          >
            <CheckSquare size={18} className="mr-2" />
            Assign Task
          </button>
          <div className="border-t border-gray-800 my-1" />
        </>
      )}
      <button
        onClick={() => { onLeaveGroup(); onClose(); }}
        className="w-full flex items-center px-4 py-2 text-red-500 hover:bg-gray-800 transition-colors"
      >
        <LogOut size={18} className="mr-2" />
        Leave Group
      </button>
    </div>
  );
};

export default GroupMenu;