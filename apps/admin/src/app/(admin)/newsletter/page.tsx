'use client';

import { useState, useEffect } from 'react';
import { Download, Mail, Users } from 'lucide-react';
import { api } from '@/lib/api';

interface Subscriber {
  id: string;
  email: string;
  name?: string;
  isActive: boolean;
  createdAt: string;
}

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [subsData, statsData] = await Promise.all([
        api.getNewsletterSubscribers(),
        api.getNewsletterStats(),
      ]);
      setSubscribers(Array.isArray(subsData) ? subsData : []);
      setStats(statsData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportCSV = () => {
    const csv = [
      ['Email', 'Nombre', 'Estado', 'Fecha'],
      ...subscribers.map((sub) => [
        sub.email,
        sub.name || '',
        sub.isActive ? 'Activo' : 'Inactivo',
        new Date(sub.createdAt).toLocaleDateString('es-ES'),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'newsletter-subscribers.csv';
    a.click();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Newsletter</h1>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 rounded-lg border px-4 py-2 hover:bg-gray-50"
        >
          <Download className="h-4 w-4" />
          Exportar CSV
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary-100 p-2">
              <Users className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total suscriptores</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2">
              <Mail className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Activos</p>
              <p className="text-2xl font-bold">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gray-100 p-2">
              <Mail className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Inactivos</p>
              <p className="text-2xl font-bold">{stats.inactive}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscribers table */}
      {isLoading ? (
        <div className="py-12 text-center text-gray-500">Cargando...</div>
      ) : (
        <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
          <table className="w-full">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Nombre</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Estado</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {subscribers.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{sub.email}</td>
                  <td className="px-4 py-3 text-sm">{sub.name || '-'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                        sub.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {sub.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(sub.createdAt).toLocaleDateString('es-ES')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
