import axios from 'axios';

// Create an axios instance
const api = axios.create();

// Add a request interceptor to include JWT if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const uploadChatFile = async ({ chatId, file }) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('chatId', chatId);
  const res = await api.post('/api/chat/upload-file', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

// Task API
export const fetchTasks = async (chatId) => {
  const res = await api.get(`/api/tasks/${chatId}`);
  return res.data;
};

export const createTask = async (task) => {
  const res = await api.post('/api/tasks', task);
  return res.data;
};

export const updateTask = async (taskId, updates) => {
  const res = await api.patch(`/api/tasks/${taskId}`, updates);
  return res.data;
};

// Poll API
export const fetchPolls = async (chatId) => {
  const res = await api.get(`/api/polls/${chatId}`);
  return res.data;
};

// Schedule API
export const fetchSchedules = async (chatId) => {
  const res = await api.get(`/api/schedules/${chatId}`);
  return res.data;
};

export const createSchedule = async (schedule) => {
  const res = await api.post('/api/schedules', schedule);
  return res.data;
};

export default api;
