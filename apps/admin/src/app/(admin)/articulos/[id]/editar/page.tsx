'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ArticleForm from '@/components/ArticleForm';
import { api } from '@/lib/api';
import { Article } from '@/lib/types';

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadArticle();
  }, [id]);

  const loadArticle = async () => {
    try {
      const response = await api.getArticles({ limit: 100 });
      const found = response.data?.find((a) => a.id === id);
      if (found) {
        setArticle(found);
      } else {
        setError('Artículo no encontrado');
      }
    } catch (err) {
      setError('Error al cargar el artículo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    await api.updateArticle(id, data);
    router.push('/articulos');
  };

  if (isLoading) {
    return <div className="py-12 text-center text-gray-500">Cargando...</div>;
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => router.push('/articulos')}
          className="mt-4 text-primary-600 hover:underline"
        >
          Volver a artículos
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Editar artículo</h1>
      <ArticleForm article={article!} onSubmit={handleSubmit} />
    </div>
  );
}
