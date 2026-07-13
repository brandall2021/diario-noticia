'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Tag } from '@/lib/types';

export default function EditTagPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [tag, setTag] = useState<Tag | null>(null);
  const [formData, setFormData] = useState({ name: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTag();
  }, [id]);

  const loadTag = async () => {
    try {
      const tags = await api.getTags();
      const found = tags.find((t) => t.id === id);
      if (found) {
        setTag(found);
        setFormData({ name: found.name });
      } else {
        setError('Etiqueta no encontrada');
      }
    } catch (err) {
      setError('Error al cargar la etiqueta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateTag(id, formData);
      router.push('/etiquetas');
    } catch (error) {
      console.error('Error updating tag:', error);
      alert('Error al actualizar la etiqueta');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="py-12 text-center text-gray-500">Cargando...</div>;
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => router.push('/etiquetas')}
          className="mt-4 text-primary-600 hover:underline"
        >
          Volver a etiquetas
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Editar etiqueta</h1>
      <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Nombre *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ name: e.target.value })}
            required
            className="w-full rounded-lg border px-4 py-2"
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
