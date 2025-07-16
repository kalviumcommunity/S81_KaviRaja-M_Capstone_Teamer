import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      // Optionally fetch user profile here
      navigate('/dashboard');
    } else {
      // If no token, just go to dashboard or login
      navigate('/dashboard');
    }
  }, [navigate]);

  return <div className="flex items-center justify-center h-screen text-white bg-black">Signing you in...</div>;
} 