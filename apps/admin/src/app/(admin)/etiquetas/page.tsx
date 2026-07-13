'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import DataTable from '@/components/DataTable';
import { api } from '@/lib/api';
import { Tag } from '@/lib/types';

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const data = await api.getTags();
      setTags(data);
    } catch (error) {
      console.error('Error loading tags:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (tag: Tag) => {
    if (confirm('¿Estás seguro de eliminar esta etiqueta?')) {
      try {
        await api.deleteTag(tag.id);
        setTags((prev) => prev.filter((t) => t.id !== tag.id));
      } catch (error) {
        console.error('Error deleting tag:', error);
        alert('Error al eliminar la etiqueta');
      }
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Nombre',
      render: (tag: Tag) => (
        <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
          {tag.name}
        </span>
      ),
    },
    {
      key: 'slug',
      header: 'Slug',
      render: (tag: Tag) => (
        <span className="font-mono text-sm text-gray-500">{tag.slug}</span>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Etiquetas</h1>
        <Link
          href="/etiquetas/nueva"
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          Nueva etiqueta
        </Link>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-gray-500">Cargando...</div>
      ) : (
        <DataTable
          columns={columns}
          data={tags}
          editPath={(tag) => `/etiquetas/${tag.id}/editar`}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
