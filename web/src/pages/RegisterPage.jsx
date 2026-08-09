import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Phone authentication handles both login and registration in one flow
    navigate('/login', { replace: true });
  }, [navigate]);

  return null;
}
