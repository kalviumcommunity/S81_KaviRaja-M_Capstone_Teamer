import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/fetchApi';

export default function useSessionCheck() {
  const { setUser } = useAuth();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await api.get('/api/auth/profile');
        setUser(res.data);
      } catch {
        setUser(null);
      }
    };
    checkSession();
  }, []);
}
