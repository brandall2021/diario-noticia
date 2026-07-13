'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Tag } from '@/lib/types';

interface TagSelectProps {
  value?: string[];
  onChange: (value: string[]) => void;
}

export default function TagSelect({ value = [], onChange }: TagSelectProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
    loadTags();
  }, []);

  const toggleTag = (tagId: string) => {
    if (value.includes(tagId)) {
      onChange(value.filter((id) => id !== tagId));
    } else {
      onChange([...value, tagId]);
    }
  };

  if (isLoading) {
    return <p className="text-sm text-gray-500">Cargando etiquetas...</p>;
  }

  if (tags.length === 0) {
    return <p className="text-sm text-gray-500">No hay etiquetas disponibles</p>;
  }

  return (
    <div className="max-h-48 overflow-y-auto space-y-2">
      {tags.map((tag) => (
        <label key={tag.id} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value.includes(tag.id)}
            onChange={() => toggleTag(tag.id)}
            className="rounded"
          />
          <span className="text-sm">{tag.name}</span>
        </label>
      ))}
    </div>
  );
}
