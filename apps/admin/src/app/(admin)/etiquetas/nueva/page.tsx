'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function NewTagPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '' });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.createTag(formData);
      router.push('/etiquetas');
    } catch (error) {
      console.error('Error creating tag:', error);
      alert('Error al crear la etiqueta');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Nueva etiqueta</h1>
      <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Nombre *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ name: e.target.value })}
            required
            className="w-full rounded-lg border px-4 py-2"
            placeholder="Nombre de la etiqueta"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => router.push('/etiquetas')}
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
