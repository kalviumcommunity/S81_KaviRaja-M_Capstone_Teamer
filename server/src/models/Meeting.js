import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
  meetId: { type: String, unique: true, required: true },
  title: { type: String },
  description: { type: String },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  scheduledAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
  status: { type: String, enum: ['scheduled', 'active', 'ended'], default: 'scheduled' },
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true } // <-- Added for correct chat linkage
});

export default mongoose.model('Meeting', meetingSchema);
