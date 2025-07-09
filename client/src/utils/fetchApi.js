import axios from 'axios';

export const uploadChatFile = async ({ chatId, file, token }) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('chatId', chatId);
  const res = await axios.post('/api/chat/upload-file', formData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

// Task API
export const fetchTasks = async (chatId, token) => {
  const res = await axios.get(`/api/tasks/${chatId}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return res.data;
};

export const createTask = async (task, token) => {
  const res = await axios.post('/api/tasks', task, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return res.data;
};

export const updateTask = async (taskId, updates, token) => {
  const res = await axios.patch(`/api/tasks/${taskId}`, updates, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return res.data;
};
