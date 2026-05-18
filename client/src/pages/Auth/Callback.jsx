import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from '../../components/LoadingScreen';

export default function Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/dashboard');
  }, [navigate]);

  return <LoadingScreen message="Completing sign in..." />;
} 