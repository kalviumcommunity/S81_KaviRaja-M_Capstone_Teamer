import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
  scheduledTime: { type: Date, required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  description: { type: String },
  duration: { type: Number, default: 30 }, // in minutes
  createdBy: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: String,
    username: String
  },
  createdAt: { type: Date, default: Date.now }
});

const Schedule = mongoose.model('Schedule', scheduleSchema);
export { Schedule };
