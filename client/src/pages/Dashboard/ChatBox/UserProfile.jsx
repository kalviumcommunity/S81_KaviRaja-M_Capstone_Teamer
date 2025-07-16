import React, { useRef, useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { CreditCard, Mail, Phone, Calendar, Activity, X, Crown, MessageSquare, CheckSquare, BarChart2, Upload } from 'lucide-react';
import api from '../../../utils/fetchApi';

const UserProfile = ({ user: userProp, onClose, onPaymentClick }) => {
  const { user: authUser, setUser } = useAuth();
  const user = userProp || authUser;
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef();
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrUploading, setQrUploading] = useState(false);
  const [qrError, setQrError] = useState(null);
  const qrInputRef = useRef();
  const [fetchedUser, setFetchedUser] = useState(null);
  useEffect(() => {
    if (userProp && userProp._id) {
      api.get(`/api/auth/profile/${userProp._id}`)
        .then(res => setFetchedUser(res.data))
        .catch(() => setFetchedUser(userProp));
    }
  }, [userProp]);
  const displayUser = fetchedUser || user;

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const res = await api.post('/api/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUser((prev) => ({ ...prev, avatar: res.data.avatar, avatarUpdatedAt: res.data.avatarUpdatedAt }));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleQrChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setQrUploading(true);
    setQrError(null);
    const formData = new FormData();
    formData.append('qr', file);
    try {
      const res = await api.post('/api/auth/payment-qr', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUser((prev) => ({ ...prev, paymentQr: res.data.paymentQr }));
      // Re-fetch profile if viewing own profile (to update fetchedUser)
      if (userProp && userProp._id) {
        const profileRes = await api.get(`/api/auth/profile/${userProp._id}`);
        setFetchedUser(profileRes.data);
      }
    } catch (err) {
      setQrError(err.response?.data?.message || err.message);
    } finally {
      setQrUploading(false);
    }
  };

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
          <div className="relative w-32 h-32 rounded-full overflow-hidden mx-auto mb-4 group border-4 border-blue-700 shadow-lg">
            <img
              src={displayUser.avatar && !displayUser.avatar.startsWith('http') ? `http://localhost:5000${displayUser.avatar}?t=${displayUser.avatarUpdatedAt || Date.now()}` : (displayUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayUser.name)}&background=random`)}
              alt={displayUser.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayUser.name)}&background=random`;
              }}
            />
            {/* Only show upload button for current user */}
            {(!userProp || (authUser && userProp._id === authUser._id)) && (
              <>
                <button
                  className="absolute bottom-2 right-2 bg-blue-600 text-white rounded-full p-2 shadow-lg opacity-80 hover:opacity-100 transition"
                  onClick={() => fileInputRef.current.click()}
                  title="Change profile photo"
                  disabled={uploading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6 6M9 13l-6 6m6-6l6-6" /></svg>
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={uploading}
                />
              </>
            )}
            {uploading && <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center text-white text-xs">Uploading...</div>}
          </div>
          {error && <div className="text-red-400 text-xs mb-2">{error}</div>}
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-xl font-semibold text-white">{displayUser.name}</h3>
            {displayUser.role === 'admin' && (
              <Crown className="w-5 h-5 text-yellow-500" />
            )}
          </div>
          <p className="text-sm text-gray-400 mt-1">{displayUser.role || 'Member'}</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className={`w-2 h-2 rounded-full ${displayUser.isOnline ? 'bg-green-500' : 'bg-gray-500'}`}></span>
            <span className="text-sm text-gray-400">
              {displayUser.isOnline ? 'Online' : `Last seen ${displayUser.lastActive}`}
            </span>
          </div>
        </div>

        {/* Activity Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <MessageSquare className="w-5 h-5 text-blue-500 mx-auto mb-2" />
            <p className="text-lg font-semibold text-white">{displayUser.messageCount || 0}</p>
            <p className="text-xs text-gray-400">Messages</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <CheckSquare className="w-5 h-5 text-green-500 mx-auto mb-2" />
            <p className="text-lg font-semibold text-white">
              {displayUser.performance?.tasksCompleted || 0}
            </p>
            <p className="text-xs text-gray-400">Tasks</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <BarChart2 className="w-5 h-5 text-purple-500 mx-auto mb-2" />
            <p className="text-lg font-semibold text-white">
              {displayUser.performance?.pollsCreated || 0}
            </p>
            <p className="text-xs text-gray-400">Polls</p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-4 mb-8 bg-gray-800 p-4 rounded-lg">
          {displayUser.email && (
            <div className="flex items-center gap-3 text-gray-400">
              <Mail className="w-5 h-5" />
              <span>{displayUser.email}</span>
            </div>
          )}
          {displayUser.phone && (
            <div className="flex items-center gap-3 text-gray-400">
              <Phone className="w-5 h-5" />
              <span>{displayUser.phone}</span>
            </div>
          )}
          {displayUser.joinedAt && (
            <div className="flex items-center gap-3 text-gray-400">
              <Calendar className="w-5 h-5" />
              <span>Joined {new Date(displayUser.joinedAt).toLocaleDateString()}</span>
            </div>
          )}
          <div className="flex items-center gap-3 text-gray-400">
            <Activity className="w-5 h-5" />
            <span>
              {displayUser.isOnline ? 'Online' : `Last active ${displayUser.lastActive}`}
            </span>
          </div>
        </div>

        {/* Payment Button */}
        {(!userProp || (authUser && userProp._id === authUser._id)) ? (
          <div className="mt-4">
            <label className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-colors cursor-pointer">
              <Upload className="w-5 h-5" />
              <span>{displayUser.paymentQr ? 'Update Payment QR Code' : 'Upload Payment QR Code'}</span>
              <input
                type="file"
                accept="image/*"
                ref={qrInputRef}
                className="hidden"
                onChange={handleQrChange}
                disabled={qrUploading}
              />
            </label>
            {qrUploading && <div className="text-blue-400 text-xs mt-2">Uploading QR code...</div>}
            {qrError && <div className="text-red-400 text-xs mt-2">{qrError}</div>}
            {displayUser.paymentQr && (
              <div className="mt-4 flex flex-col items-center">
                <img src={`http://localhost:5000${displayUser.paymentQr}?t=${Date.now()}`} alt="Payment QR" className="w-40 h-40 object-contain border-2 border-gray-700 rounded-lg" />
                <span className="text-xs text-gray-400 mt-2">This is your payment QR code. Others can scan this to pay you.</span>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setShowQrModal(true)}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors mt-4"
            disabled={!displayUser.paymentQr}
          >
            <CreditCard className="w-5 h-5" />
            <span>Pay</span>
          </button>
        )}
        {/* QR Modal for paying others */}
        {showQrModal && displayUser.paymentQr && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
            <div className="bg-gray-900 rounded-lg p-6 flex flex-col items-center relative">
              <button onClick={() => setShowQrModal(false)} className="absolute top-2 right-2 text-gray-400 hover:text-white">✕</button>
              <h3 className="text-lg font-semibold text-white mb-4">Scan to Pay</h3>
              <img src={`http://localhost:5000${displayUser.paymentQr}`} alt="Payment QR" className="w-64 h-64 object-contain border-2 border-gray-700 rounded-lg" />
              <span className="text-xs text-gray-400 mt-2">Scan this QR code to pay {displayUser.name}.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserProfile;