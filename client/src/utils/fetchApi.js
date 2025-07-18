// Configuration for backend URLs
export const getBackendURL = () => {
  if (typeof window !== 'undefined' && window.location.hostname === 'teamerwork.netlify.app') {
    return 'https://s81-kaviraja-m-capstone-teamer-2.onrender.com';
  }
  return 'http://localhost:5000';
};

import axios from 'axios';

const api = axios.create({
  baseURL: getBackendURL() + '/api'
});

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
  const res = await api.post('/chat/upload-file', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

// Task API
export const fetchTasks = async (chatId) => {
  const res = await api.get(`/tasks/${chatId}`);
  return res.data;
};

export const createTask = async (task) => {
  const res = await api.post('/tasks', task);
  return res.data;
};

export const updateTask = async (taskId, updates) => {
  const res = await api.patch(`/tasks/${taskId}`, updates);
  return res.data;
};

// Poll API
export const fetchPolls = async (chatId) => {
  const res = await api.get(`/polls/${chatId}`);
  return res.data;
};

// Schedule API
export const fetchSchedules = async (chatId) => {
  const res = await api.get(`/schedules/${chatId}`);
  return res.data;
};

export const createSchedule = async (schedule) => {
  const res = await api.post('/schedules', schedule);
  return res.data;
};

export default api;
