import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function useSessionCheck() {
  const { user, setUser } = useAuth();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/profile', { credentials: 'include' });
        if (!res.ok) {
          setUser(null);
          return;
        }
        const data = await res.json();
        setUser(data);
      } catch {
        setUser(null);
      }
    };
    checkSession();
    // Only run on mount
    // eslint-disable-next-line
  }, []);
}
