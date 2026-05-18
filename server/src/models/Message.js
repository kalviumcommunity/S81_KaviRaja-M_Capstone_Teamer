import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  isFile: { type: Boolean, default: false },
  fileName: String,
  fileType: String,
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  timestamp: { type: Date, default: Date.now }
});

messageSchema.index({ chatId: 1, timestamp: -1 }); // essential index

const Message = mongoose.model('Message', messageSchema);
export { Message };
