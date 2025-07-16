import express from 'express';
import { getSchedules, createSchedule, deleteSchedule } from '../controllers/scheduleController.js';

const router = express.Router();

// GET /api/schedules/:chatId - get all schedules for a chat
router.get('/:chatId', getSchedules);

// POST /api/schedules - create a new schedule
router.post('/', createSchedule);

// DELETE /api/schedules/:scheduleId - delete a schedule
router.delete('/:scheduleId', deleteSchedule);

export default router;
