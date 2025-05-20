import React from 'react';
import { BarChart3, CreditCard } from 'lucide-react';

const GroupInfo = ({ group, onClose, onMemberClick }) => {
  return (
    <div className="absolute inset-0 bg-black bg-opacity-95 flex items-start justify-end">
      <div className="w-80 h-full bg-gray-900 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Group Info</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ×
          </button>
        </div>

        <div className="mb-6 text-center">
          <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4">
            <img 
              src={group.avatar} 
              alt={group.name}
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="text-lg font-medium text-white mb-1">{group.name}</h3>
          <p className="text-sm text-gray-400">{group.memberCount} members</p>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-medium text-gray-400">Group Performance</h4>
            <BarChart3 size={20} className="text-gray-400" />
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-400 text-center">
              Performance metrics will be displayed here
            </p>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-4">Members</h4>
          <div className="space-y-3">
            {group.members?.map(member => (
              <button
                key={member.id}
                onClick={() => onMemberClick(member)}
                className="w-full flex items-center p-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-800">
                  <img 
                    src={member.avatar} 
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="ml-3 text-left">
                  <p className="text-sm font-medium text-white">{member.name}</p>
                  <p className="text-xs text-gray-400">{member.role || 'Member'}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupInfo;