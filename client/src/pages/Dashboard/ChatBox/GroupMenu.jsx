import React from 'react';
import { Video, CheckSquare, PieChart } from 'lucide-react';

const GroupMenu = ({ isGroup, isAdmin, onCreatePoll, onScheduleCall, onAssignTask, onClose }) => {
  if (!isGroup) return <></>; // Changed from null to fragment

  return (
    <div className="absolute right-0 top-12 bg-gray-900 rounded-lg shadow-lg py-2 w-48 border border-gray-800 z-50">
      {isAdmin && (
        <>
          <button
            onClick={onAssignTask}
            className="w-full flex items-center px-4 py-2 text-white hover:bg-gray-800 transition-colors"
          >
            <CheckSquare size={18} className="mr-2" />
            Assign Task
          </button>
          <button
            onClick={onCreatePoll}
            className="w-full flex items-center px-4 py-2 text-white hover:bg-gray-800 transition-colors"
          >
            <PieChart size={18} className="mr-2" />
            Create Poll
          </button>
          <button
            onClick={onScheduleCall}
            className="w-full flex items-center px-4 py-2 text-white hover:bg-gray-800 transition-colors"
          >
            <Video size={18} className="mr-2" />
            Schedule Video Meet
          </button>
        </>
      )}
    </div>
  );
};

export default GroupMenu;