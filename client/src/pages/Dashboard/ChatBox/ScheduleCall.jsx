import React, { useState, useEffect } from 'react';
import { X, Video, Users } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

// Add default props and prop validation
const ScheduleCall = ({ onClose, onSchedule, group }) => {
  const [scheduledTime, setScheduledTime] = useState(new Date());
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(30);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSchedule({
      scheduledTime,
      participants: selectedParticipants,
      description,
      duration
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Schedule Video Call</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Date & Time Picker */}
            <div>
              <label className="block text-white mb-2">Select Date & Time</label>
              <DatePicker
                selected={scheduledTime}
                onChange={(date) => setScheduledTime(date)}
                showTimeSelect
                dateFormat="MMMM d, yyyy h:mm aa"
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2"
                minDate={new Date()}
              />
            </div>

            {/* Duration Selection */}
            <div>
              <label className="block text-white mb-2">Duration (minutes)</label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>1 hour</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-white mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2"
                rows={3}
                placeholder="Enter meeting description..."
              />
            </div>

            {/* Participants Selection */}
            <div>
              <label className="block text-white mb-2">
                Select Participants ({group.members?.length} available)
              </label>
              <div className="max-h-40 overflow-y-auto bg-gray-800 rounded-lg">
                {Array.isArray(group.members) && group.members.length > 0 ? (
                  group.members.map(member => {
                    const memberId = member.id || member._id || member.name;
                    return (
                      <label 
                        key={memberId}
                        className="flex items-center p-2 hover:bg-gray-700 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedParticipants.includes(memberId)}
                          onChange={() => {
                            setSelectedParticipants(prev =>
                              prev.includes(memberId)
                                ? prev.filter(id => id !== memberId)
                                : [...prev, memberId]
                            );
                          }}
                          className="mr-2"
                        />
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                            <img 
                              src={member.avatar} 
                              alt={member.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="text-white">{member.name}</span>
                        </div>
                      </label>
                    );
                  })
                ) : (
                  <p className="text-gray-400 p-2">No participants available</p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-white bg-gray-700 rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-500"
              disabled={selectedParticipants.length === 0}
            >
              Schedule Call
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Example usage in ChatBox.jsx
const ChatBox = () => {
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    // Fetch participants
    const fetchParticipants = async () => {
      try {
        const response = await fetch('/api/participants');
        const data = await response.json();
        setParticipants(data);
      } catch (error) {
        console.error('Failed to fetch participants:', error);
        setParticipants([]);
      }
    };

    fetchParticipants();
  }, []);

  return (
    // ...other code
    <ScheduleCall 
      onClose={handleClose}
      onSchedule={handleSchedule}
      group={{ members: participants }}
    />
    // ...other code
  );
};

export default ScheduleCall;