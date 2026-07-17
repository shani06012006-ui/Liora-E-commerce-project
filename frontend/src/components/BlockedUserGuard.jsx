// frontend/src/components/BlockedUserGuard.jsx
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const BlockedUserGuard = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.is_blocked === true) {
      toast.error('Your account has been blocked by the administrator. Please contact support.');
      navigate('/Login?blocked=true', { replace: true });
    }
  }, [user, navigate]);

  return children;
};

export default BlockedUserGuard;