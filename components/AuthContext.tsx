import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from '../domain/types';
import { api } from '../api';
import { analytics } from '../utils/analytics';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentUser = await api.auth.getMe();
      setUser(currentUser);
      
      // Identify user in analytics if logged in
      if (currentUser) {
        analytics.identify(currentUser.id, {
          email: currentUser.email,
          name: currentUser.name
        });
      }
    } catch (e) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } catch (e) {
      console.error('Logout error', e);
    } finally {
      setUser(null);
      // Reset analytics on logout
      analytics.reset();
      window.location.href = '/';
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <AuthContext.Provider value={{ user, isLoading, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};