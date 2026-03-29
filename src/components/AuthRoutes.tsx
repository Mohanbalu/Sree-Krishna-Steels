import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, initialized } = useAuthStore();
  const location = useLocation();

  if (!initialized || loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  return <>{children}</>;
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { profile, loading, initialized } = useAuthStore();
  const location = useLocation();

  if (!initialized || loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (profile?.role !== 'admin') return <Navigate to="/" replace />;

  return <>{children}</>;
}
