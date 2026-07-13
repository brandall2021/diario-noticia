'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';
import { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      api.setToken(token);
      try {
        const userData = await api.getProfile();
        setUser(userData);
      } catch {
        localStorage.removeItem('token');
        api.setToken(null);
      }
    }
    setIsLoading(false);
  };

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password);
    if (response.data) {
      localStorage.setItem('token', response.data.token);
      api.setToken(response.data.token);
      setUser(response.data.user);
    }
  };

  const register = async (data: { email: string; password: string; firstName: string; lastName: string }) => {
    const response = await api.register(data);
    if (response.data) {
      localStorage.setItem('token', response.data.token);
      api.setToken(response.data.token);
      setUser(response.data.user);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    api.setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
