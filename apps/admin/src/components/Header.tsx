'use client';

import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Bell } from 'lucide-react';

export default function Header() {
  const { user } = useAdminAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="lg:hidden" />

        <div className="flex items-center gap-4 ml-auto">
          <button className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100">
            <Bell className="h-5 w-5" />
          </button>

          {user && (
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-gray-700">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-500">{user.role.name}</p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-sm font-medium text-white">
                {user.firstName?.[0]}
                {user.lastName?.[0]}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
