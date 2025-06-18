import React from 'react';
import { CreditCard, Mail, Phone, Calendar, Activity, X, Crown, MessageSquare, CheckSquare, BarChart2 } from 'lucide-react';

const UserProfile = ({ user, onClose, onPaymentClick }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-start justify-end z-50">
      <div className="w-96 h-full bg-gray-900 p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Profile</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Profile Image and Basic Info */}
        <div className="text-center mb-8">
          <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4">
            <img 
              src={user.avatar} 
              alt={user.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
              }}
            />
          </div>
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-xl font-semibold text-white">{user.name}</h3>
            {user.role === 'admin' && (
              <Crown className="w-5 h-5 text-yellow-500" />
            )}
          </div>
          <p className="text-sm text-gray-400 mt-1">{user.role || 'Member'}</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className={`w-2 h-2 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-gray-500'}`}></span>
            <span className="text-sm text-gray-400">
              {user.isOnline ? 'Online' : `Last seen ${user.lastActive}`}
            </span>
          </div>
        </div>

        {/* Activity Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <MessageSquare className="w-5 h-5 text-blue-500 mx-auto mb-2" />
            <p className="text-lg font-semibold text-white">{user.messageCount || 0}</p>
            <p className="text-xs text-gray-400">Messages</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <CheckSquare className="w-5 h-5 text-green-500 mx-auto mb-2" />
            <p className="text-lg font-semibold text-white">
              {user.performance?.tasksCompleted || 0}
            </p>
            <p className="text-xs text-gray-400">Tasks</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <BarChart2 className="w-5 h-5 text-purple-500 mx-auto mb-2" />
            <p className="text-lg font-semibold text-white">
              {user.performance?.pollsCreated || 0}
            </p>
            <p className="text-xs text-gray-400">Polls</p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-4 mb-8 bg-gray-800 p-4 rounded-lg">
          {user.email && (
            <div className="flex items-center gap-3 text-gray-400">
              <Mail className="w-5 h-5" />
              <span>{user.email}</span>
            </div>
          )}
          {user.phone && (
            <div className="flex items-center gap-3 text-gray-400">
              <Phone className="w-5 h-5" />
              <span>{user.phone}</span>
            </div>
          )}
          {user.joinedAt && (
            <div className="flex items-center gap-3 text-gray-400">
              <Calendar className="w-5 h-5" />
              <span>Joined {new Date(user.joinedAt).toLocaleDateString()}</span>
            </div>
          )}
          <div className="flex items-center gap-3 text-gray-400">
            <Activity className="w-5 h-5" />
            <span>
              {user.isOnline ? 'Online' : `Last active ${user.lastActive}`}
            </span>
          </div>
        </div>

        {/* Payment Button */}
        <button
          onClick={onPaymentClick}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors"
        >
          <CreditCard className="w-5 h-5" />
          <span>Send Payment</span>
        </button>
      </div>
    </div>
  );
};

export default UserProfile;