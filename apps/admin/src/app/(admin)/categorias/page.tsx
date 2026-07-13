'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import DataTable from '@/components/DataTable';
import { api } from '@/lib/api';
import { Category } from '@/lib/types';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (category: Category) => {
    if (confirm('¿Estás seguro de eliminar esta categoría?')) {
      try {
        await api.deleteCategory(category.id);
        setCategories((prev) => prev.filter((c) => c.id !== category.id));
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Error al eliminar la categoría');
      }
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Nombre',
      render: (category: Category) => (
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ backgroundColor: category.color || '#3b82f6' }}
          />
          <span className="font-medium">{category.name}</span>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Descripción',
      render: (category: Category) => (
        <span className="text-gray-600 line-clamp-1">
          {category.description || '-'}
        </span>
      ),
    },
    {
      key: 'articles',
      header: 'Artículos',
      render: (category: Category) => category._count?.articles ?? 0,
    },
    {
      key: 'isActive',
      header: 'Estado',
      render: (category: Category) => (
        <span
          className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
            category.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}
        >
          {category.isActive ? 'Activa' : 'Inactiva'}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categorías</h1>
        <Link
          href="/categorias/nueva"
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          Nueva categoría
        </Link>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-gray-500">Cargando...</div>
      ) : (
        <DataTable
          columns={columns}
          data={categories}
          editPath={(category) => `/categorias/${category.id}/editar`}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
