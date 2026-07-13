'use client';

import { useState, useEffect, useMemo } from 'react';
import DataTable from '@/components/DataTable';
import { api } from '@/lib/api';
import { User } from '@/lib/types';
import { Search, Users as UsersIcon, Shield, UserCheck, UserX } from 'lucide-react';

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

const roleFilters = ['Todos', 'ADMIN', 'EDITOR', 'AUTHOR', 'SUBSCRIBER'];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRole, setActiveRole] = useState('Todos');

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

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        searchQuery === '' ||
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = activeRole === 'Todos' || user.role.name === activeRole;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, activeRole]);

  const stats = useMemo(() => {
    return {
      total: users.length,
      active: users.filter((u) => u.isActive).length,
      admins: users.filter((u) => u.role.name === 'ADMIN').length,
    };
  }, [users]);

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
        <p className="mt-1 text-sm text-gray-500">Gestionar usuarios y permisos del sistema</p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <UsersIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total usuarios</p>
              <p className="text-xl font-bold">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Activos</p>
              <p className="text-xl font-bold">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-100 p-2">
              <Shield className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Administradores</p>
              <p className="text-xl font-bold">{stats.admins}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
          {roleFilters.map((role) => (
            <button
              key={role}
              onClick={() => setActiveRole(role)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                activeRole === role
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {role === 'Todos' ? 'Todos' : roleLabels[role] || role}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-gray-500">Cargando...</div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredUsers}
          onDelete={handleToggleActive}
        />
      )}
    </div>
  );
}
