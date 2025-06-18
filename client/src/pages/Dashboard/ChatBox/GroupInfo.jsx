import React, { useState } from 'react';
import { BarChart3, Users, Crown, X, ChevronRight } from 'lucide-react';
import GroupPerformance from './GroupPerformance';

const GroupInfo = ({ group, onClose, onMemberClick }) => {
  const [showPerformance, setShowPerformance] = useState(false);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-start justify-end z-50">
      <div className="w-96 h-full bg-gray-900 p-6 overflow-y-auto">
        {/* Header with Close Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Group Info</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Group Profile Section */}
        <div className="text-center mb-6">
          <div className="relative w-32 h-32 rounded-full overflow-hidden mx-auto mb-4 bg-gray-800">
            <img
              src={group.avatar}
              alt={group.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(group.name)}&background=random`;
              }}
            />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">{group.name}</h3>
          <p className="text-sm text-gray-400">{group.members?.length || 0} members</p>
        </div>

        {/* Performance Graph Button */}
        <button
          onClick={() => setShowPerformance(true)}
          className="w-full flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors mb-6"
        >
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            <span className="text-white">View Group Performance</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        {/* Members List */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-400 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Members
          </h4>
          <div className="space-y-2">
            {group.members?.map((member) => (
              <button
                key={member.id}
                onClick={() => onMemberClick(member)}
                className="w-full flex items-center p-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`;
                    }}
                  />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-white">{member.name}</span>
                    {member.role === 'admin' && (
                      <Crown className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-400">
                    {member.role || 'Member'} • {member.messageCount || 0} messages
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Modal */}
      {showPerformance && (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-full max-w-3xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Group Performance</h3>
              <button 
                onClick={() => setShowPerformance(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <GroupPerformance
              members={group.members || []}
              onClose={() => setShowPerformance(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupInfo;