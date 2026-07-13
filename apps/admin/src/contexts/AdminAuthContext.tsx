'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { api } from '@/lib/api';
import { User } from '@/lib/types';

interface AdminAuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: string[]) => boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isLoginPage = pathname === '/login';

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    if (isLoginPage) {
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/login');
      setIsLoading(false);
      return;
    }

    api.setToken(token);
    try {
      const userData = await api.getProfile();
      if (!['ADMIN', 'EDITOR'].includes(userData.role.name)) {
        throw new Error('Unauthorized');
      }
      setUser(userData);
    } catch {
      localStorage.removeItem('admin_token');
      api.setToken(null);
      router.push('/login');
    }
    setIsLoading(false);
  };

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password);
    const { user: userData, token } = response as any;

    const userObj = userData?.user || userData;
    const tokenStr = token || userData?.token;

    if (!['ADMIN', 'EDITOR'].includes(userObj?.role?.name)) {
      throw new Error('Acceso no autorizado');
    }

    localStorage.setItem('admin_token', tokenStr);
    api.setToken(tokenStr);
    setUser(userObj);
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    api.setToken(null);
    setUser(null);
    router.push('/login');
  };

  const hasRole = (...roles: string[]) => {
    return user ? roles.includes(user.role.name) : false;
  };

  return (
    <AdminAuthContext.Provider value={{ user, isLoading, login, logout, hasRole }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};
