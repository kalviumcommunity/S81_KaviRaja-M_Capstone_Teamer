import mongoose from 'mongoose';

const pollOptionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

const pollSchema = new mongoose.Schema({
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
  question: { type: String, required: true },
  options: [pollOptionSchema],
  totalVotes: { type: Number, default: 0 },
  multipleChoice: { type: Boolean, default: false },
  expiresAt: { type: Date },
  canChangeVote: { type: Boolean, default: true },
  creator: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: String,
    username: String
  },
  voters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

const Poll = mongoose.model('Poll', pollSchema);
export { Poll };
