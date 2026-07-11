import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const NewAdminRoute = ({ children }) => {
  const { user } = useSelector(s => s.auth);
  const stored = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  })();
  const currentUser = user || stored;

  if (!currentUser?.username) return <Navigate to="/Login" replace />;
  if (currentUser.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

export default NewAdminRoute;