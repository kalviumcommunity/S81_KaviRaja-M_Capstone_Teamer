import express from 'express';
import { getTasks, createTask, updateTask } from '../controllers/taskController.js';

const router = express.Router();

// GET /api/tasks/:chatId - get all tasks for a chat
router.get('/:chatId', getTasks);

// POST /api/tasks/:chatId - create a new task
router.post('/:chatId', createTask);

// PATCH /api/tasks/update/:taskId - update a task (complete/approve)
router.patch('/update/:taskId', updateTask);

export default router;
