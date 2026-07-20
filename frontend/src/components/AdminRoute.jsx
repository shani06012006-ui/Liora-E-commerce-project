// frontend/src/components/AdminRoute.jsx
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getCurrentUser, getTokens } from '../utils/storage';
 
const AdminRoute = ({ children }) => {
  const { user, token } = useSelector((state) => state.auth);
  
  const sessionUser = getCurrentUser();
  const { accessToken } = getTokens();
  
  const effectiveUser = user || sessionUser;
  const effectiveToken = token || accessToken;
  
  const isAuthenticated = !!effectiveToken;
  const isAdmin = effectiveUser && (effectiveUser.role === 'admin' || effectiveUser.is_staff === true);
  
  console.log('AdminRoute - User:', effectiveUser?.username);
  console.log('AdminRoute - Is Admin:', isAdmin);
  
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
};
 
export default AdminRoute;