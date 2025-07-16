import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Plus, Minus, X } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const CreatePoll = ({ onClose, onCreatePoll }) => {
  const { user } = useAuth();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [multipleAnswers, setMultipleAnswers] = useState(false);
  const [showVoters, setShowVoters] = useState(true);
  const [expiresAt, setExpiresAt] = useState(null);

  const handleAddOption = () => {
    if (options.length < 5) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validOptions = options.filter(opt => opt.trim());
    if (question.trim() && validOptions.length >= 2) {
      // Backend expects options as array of { text: string }
      onCreatePoll({
        question,
        options: validOptions.map(opt => ({ text: opt })),
        multipleAnswers,
        showVoters,
        canChangeVote: true, // Always allow changing vote
        expiresAt,
        creator: user ? { _id: user._id, name: user.name, username: user.username } : undefined,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Create Poll</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Ask a question..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-3 mb-4">
            {options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(index)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Minus size={24} />
                  </button>
                )}
              </div>
            ))}
            {options.length < 5 && (
              <button
                type="button"
                onClick={handleAddOption}
                className="flex items-center text-blue-500 hover:text-blue-400 transition-colors"
              >
                <Plus size={20} className="mr-1" />
                Add Option
              </button>
            )}
          </div>

          <div className="space-y-3 mb-6">
            {/* Always allow users to change their vote; no checkbox needed */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="multipleAnswers"
                checked={multipleAnswers}
                onChange={(e) => setMultipleAnswers(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="multipleAnswers" className="text-white">
                Allow multiple answers
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="showVoters"
                checked={showVoters}
                onChange={(e) => setShowVoters(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="showVoters" className="text-white">
                Show who voted for what
              </label>
            </div>

            <div>
              <label className="block text-white mb-2">Poll Expiration (Optional)</label>
              <select
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => {
                  const hours = parseInt(e.target.value);
                  setExpiresAt(hours ? new Date(Date.now() + hours * 3600000) : null);
                }}
              >
                <option value="">No expiration</option>
                <option value="1">1 hour</option>
                <option value="24">24 hours</option>
                <option value="168">7 days</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-white bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors"
              disabled={!question.trim() || options.filter(opt => opt.trim()).length < 2}
            >
              Create Poll
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePoll;