import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  const isAdmin = !!(user?.is_staff || user?.type_compte === 'admin');

  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;

  return children;
}

