import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  description: { type: String, required: true },
  assignedTo: { type: String, required: true }, // store name or userId for simplicity
  createdBy: { type: mongoose.Schema.Types.Mixed, required: true },
  completed: { type: Boolean, default: false },
  approved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Task = mongoose.model('Task', taskSchema);
export { Task };
