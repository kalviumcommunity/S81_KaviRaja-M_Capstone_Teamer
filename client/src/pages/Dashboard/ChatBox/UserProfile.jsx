import React from 'react';
import { CreditCard } from 'lucide-react';

const UserProfile = ({ user, onClose, onPaymentClick }) => {
  return (
    <div className="absolute inset-0 bg-black bg-opacity-95 flex items-start justify-end">
      <div className="w-80 h-full bg-gray-900 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Profile</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ×
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4">
            <img 
              src={user.avatar} 
              alt={user.name}
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="text-lg font-medium text-white mb-1">{user.name}</h3>
          {user.status && (
            <p className="text-sm text-gray-400">{user.status}</p>
          )}
        </div>

        <button
          onClick={onPaymentClick}
          className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white py-3 px-4 rounded-lg transition-colors"
        >
          <CreditCard size={20} />
          <span>Send Payment</span>
        </button>
      </div>
    </div>
  );
};

export default UserProfile;