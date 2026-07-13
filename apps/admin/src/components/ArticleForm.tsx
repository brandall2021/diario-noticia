'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Category, Tag, Article, ArticleStatus } from '@/lib/types';

const articleSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  subtitle: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().min(1, 'El contenido es requerido'),
  categoryId: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
  status: z.enum(['DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED']),
  isFeatured: z.boolean(),
  isSticky: z.boolean(),
});

type ArticleFormData = z.infer<typeof articleSchema>;

interface ArticleFormProps {
  article?: Article;
  onSubmit: (data: ArticleFormData) => Promise<void>;
}

export default function ArticleForm({ article, onSubmit }: ArticleFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: article?.title || '',
      subtitle: article?.subtitle || '',
      excerpt: article?.excerpt || '',
      content: typeof article?.content === 'string' ? article.content : '',
      categoryId: article?.category?.id || '',
      tagIds: article?.tags?.map((t) => t.id) || [],
      status: (article?.status && ['DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED'].includes(article.status) ? article.status : 'DRAFT') as 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'PUBLISHED',
      isFeatured: article?.isFeatured || false,
      isSticky: article?.isSticky || false,
    },
  });

  useEffect(() => {
    loadCategories();
    loadTags();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadTags = async () => {
    try {
      const data = await api.getTags();
      setAvailableTags(data);
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const onFormSubmit = async (data: ArticleFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit as any)} className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/articulos"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {isSubmitting ? 'Guardando...' : 'Guardar'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold">Contenido</h2>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Título *</label>
                <input
                  {...register('title')}
                  className="w-full rounded-lg border px-4 py-2"
                  placeholder="Título del artículo"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Subtítulo</label>
                <input
                  {...register('subtitle')}
                  className="w-full rounded-lg border px-4 py-2"
                  placeholder="Subtítulo opcional"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Extracto</label>
                <textarea
                  {...register('excerpt')}
                  rows={2}
                  className="w-full rounded-lg border px-4 py-2"
                  placeholder="Resumen breve del artículo"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Contenido *</label>
                <textarea
                  {...register('content')}
                  rows={15}
                  className="w-full rounded-lg border px-4 py-2 font-mono text-sm"
                  placeholder="Contenido del artículo (soporta HTML)"
                />
                {errors.content && (
                  <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold">Estado</h2>
            <select
              {...register('status')}
              className="w-full rounded-lg border px-4 py-2"
            >
              <option value="DRAFT">Borrador</option>
              <option value="IN_REVIEW">En revisión</option>
              <option value="APPROVED">Aprobado</option>
              <option value="PUBLISHED">Publicado</option>
            </select>

            <div className="mt-4 space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" {...register('isFeatured')} className="rounded" />
                <span className="text-sm">Artículo destacado</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" {...register('isSticky')} className="rounded" />
                <span className="text-sm">Artículo fijo</span>
              </label>
            </div>
          </div>

          {/* Category */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold">Categoría</h2>
            <select
              {...register('categoryId')}
              className="w-full rounded-lg border px-4 py-2"
            >
              <option value="">Sin categoría</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold">Etiquetas</h2>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {availableTags.length === 0 && (
                <p className="text-sm text-gray-500">No hay etiquetas disponibles</p>
              )}
              {availableTags.map((tag) => (
                <label key={tag.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    value={tag.id}
                    {...register('tagIds')}
                    className="rounded"
                  />
                  <span className="text-sm">{tag.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
