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
