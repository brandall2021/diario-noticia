'use client';

import { AdminAuthProvider } from '@/contexts/AdminAuthContext';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { usePathname } from 'next/navigation';

function AdminShell({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAdminAuth();
  const pathname = usePathname();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-1 flex-col pl-0 lg:pl-64">
        <Header />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      <AdminShell>{children}</AdminShell>
    </AdminAuthProvider>
  );
}
