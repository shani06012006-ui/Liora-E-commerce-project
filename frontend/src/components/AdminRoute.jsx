// frontend/src/components/AdminRoute.jsx
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdminRoute = ({ children }) => {
  const { user, token } = useSelector((state) => state.auth);

  const isAuthenticated = !!token;
  const isAdmin = user && (user.role === 'admin' || user.is_staff === true);

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default AdminRoute;