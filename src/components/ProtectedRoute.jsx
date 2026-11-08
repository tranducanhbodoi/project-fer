import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles, allowGuest = false, children }) => {
  const { user } = useContext(AuthContext);

  // Nếu chưa đăng nhập
  if (!user) {
    if (allowGuest) return children;
    return <Navigate to="/login" replace />;
  }

  // Nếu đã đăng nhập nhưng role không nằm trong danh sách cho phép
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'manager') return <Navigate to="/manager/products" replace />;
    if (user.role === 'admin') return <Navigate to="/admin/users" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

