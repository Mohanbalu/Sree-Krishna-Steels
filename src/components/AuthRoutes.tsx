import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuthStore();
  const location = useLocation();

  if (!initialized) return <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-gold"></div>
  </div>;
  
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  return <>{children}</>;
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { profile, initialized } = useAuthStore();
  const location = useLocation();

  const isAdmin = profile?.role === 'super_admin' || profile?.role === 'admin' || profile?.role === 'staff';

  if (!initialized) return <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-gold"></div>
  </div>;
  
  if (!isAdmin) return <Navigate to="/" replace />;

  return <>{children}</>;
}
