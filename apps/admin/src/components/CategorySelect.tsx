'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Category } from '@/lib/types';

interface CategorySelectProps {
  value?: string;
  onChange: (value: string) => void;
  includeEmpty?: boolean;
  emptyLabel?: string;
}

export default function CategorySelect({
  value,
  onChange,
  includeEmpty = true,
  emptyLabel = 'Sin categoría',
}: CategorySelectProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
    loadCategories();
  }, []);

  if (isLoading) {
    return (
      <select disabled className="w-full rounded-lg border px-4 py-2">
        <option>Cargando...</option>
      </select>
    );
  }

  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border px-4 py-2"
    >
      {includeEmpty && <option value="">{emptyLabel}</option>}
      {categories.map((cat) => (
        <option key={cat.id} value={cat.id}>
          {cat.name}
        </option>
      ))}
    </select>
  );
}
