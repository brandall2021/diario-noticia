'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const ALLOWED_ROLES = ['ADMIN', 'EDITOR'];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    if (!ALLOWED_ROLES.includes(user.role?.name)) {
      router.replace('/');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          <p className="text-sm text-gray-600">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  if (!user || !ALLOWED_ROLES.includes(user.role?.name)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
