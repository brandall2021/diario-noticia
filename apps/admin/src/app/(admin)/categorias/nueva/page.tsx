'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function NewCategoryPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
    icon: '',
    sortOrder: 0,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.createCategory(formData);
      router.push('/categorias');
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Error al crear la categoría');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Nueva categoría</h1>
      <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Nombre *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full rounded-lg border px-4 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Descripción</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full rounded-lg border px-4 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Color</label>
          <input
            type="color"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            className="h-10 w-20"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Ícono</label>
          <input
            type="text"
            value={formData.icon}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            placeholder="Nombre del ícono (opcional)"
            className="w-full rounded-lg border px-4 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Orden</label>
          <input
            type="number"
            value={formData.sortOrder}
            onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
            className="w-full rounded-lg border px-4 py-2"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => router.push('/categorias')}
            className="rounded-lg border px-4 py-2 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {isSaving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}
