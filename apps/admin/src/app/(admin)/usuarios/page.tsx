'use client';

import { useState, useEffect } from 'react';
import DataTable from '@/components/DataTable';
import { api } from '@/lib/api';
import { User } from '@/lib/types';

const roleLabels: Record<string, string> = {
  ADMIN: 'Admin',
  EDITOR: 'Editor',
  AUTHOR: 'Autor',
  SUBSCRIBER: 'Suscriptor',
};

const roleColors: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-800',
  EDITOR: 'bg-purple-100 text-purple-800',
  AUTHOR: 'bg-blue-100 text-blue-800',
  SUBSCRIBER: 'bg-green-100 text-green-800',
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await api.getUsers({ limit: 100 });
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      const updated = await api.updateUser(user.id, { isActive: !user.isActive } as Partial<User>);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isActive: updated.isActive } : u)));
    } catch (error) {
      console.error('Error toggling user status:', error);
      alert('Error al cambiar el estado del usuario');
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Nombre',
      render: (user: User) => (
        <span className="font-medium">{user.firstName} {user.lastName}</span>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (user: User) => (
        <span className="text-gray-600">{user.email}</span>
      ),
    },
    {
      key: 'role',
      header: 'Rol',
      render: (user: User) => (
        <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${roleColors[user.role.name] || 'bg-gray-100 text-gray-800'}`}>
          {roleLabels[user.role.name] || user.role.name}
        </span>
      ),
    },
    {
      key: 'isActive',
      header: 'Estado',
      render: (user: User) => (
        <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {user.isActive ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Usuarios</h1>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-gray-500">Cargando...</div>
      ) : (
        <DataTable
          columns={columns}
          data={users}
          onDelete={handleToggleActive}
        />
      )}
    </div>
  );
}
