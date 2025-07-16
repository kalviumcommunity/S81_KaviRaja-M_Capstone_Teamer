import { Task } from '../models/Task.js';

// Get all tasks for a chat
export const getTasks = async (req, res) => {
  try {
    const { chatId } = req.params;
    const tasks = await Task.find({ chatId });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

// Create a new task
export const createTask = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { description, assignedTo, createdBy } = req.body;
    const task = new Task({ chatId, description, assignedTo, createdBy });
    await task.save();
    // Use io from app context for socket emission
    const io = req.app.get('io');
    io?.to(task.chatId.toString()).emit('new_task', task);
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create task' });
  }
};

// Update a task (for completion/approval)
export const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const update = req.body;
    const task = await Task.findByIdAndUpdate(taskId, update, { new: true });
    // Increment performance score if task is completed and approved
    if (task && task.completed && task.approved && task.assignedTo) {
      try {
        const { User } = await import('../models/userModel.js');
        await User.updateOne({ name: task.assignedTo }, { $inc: { performanceScore: 1 } });
      } catch (e) { /* ignore errors for scoring */ }
    }
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task' });
  }
};
