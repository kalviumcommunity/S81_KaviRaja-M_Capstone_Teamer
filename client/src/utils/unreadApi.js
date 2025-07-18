import axios from "axios";

export const fetchUnreadChats = async (token) => {
  const res = await axios.get('/chat/unread-chats', {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.data;
};
