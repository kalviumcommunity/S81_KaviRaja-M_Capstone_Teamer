import { Schedule } from '../models/Schedule.js';

// Get all schedules for a chat
export const getSchedules = async (req, res) => {
  try {
    const { chatId } = req.params;
    const schedules = await Schedule.find({ chatId });
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
};

// Create a new schedule
export const createSchedule = async (req, res) => {
  try {
    const schedule = new Schedule(req.body);
    await schedule.save();
    // Use io from app context for socket emission
    const io = req.app.get('io');
    io?.to(schedule.chatId.toString()).emit('new_schedule', schedule);
    res.status(201).json(schedule);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create schedule' });
  }
};

// Delete a schedule
export const deleteSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const schedule = await Schedule.findByIdAndDelete(scheduleId);
    if (schedule) {
      req.io?.to(schedule.chatId.toString()).emit('schedule_deleted', { scheduleId });
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Schedule not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete schedule' });
  }
};
