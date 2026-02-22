import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Mascot } from './Mascot';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-dark">
        <Mascot className="w-24 h-24 mb-4" emotion="thinking" accessory="none" />
        <div className="w-8 h-8 border-4 border-brand-main/20 border-t-brand-main rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm mt-4 font-bold uppercase tracking-widest">Проверка магии...</p>
      </div>
    );
  }

  if (!user) {
    // Redirect to login and save current location
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }

  return <>{children}</>;
};