'use client';

import { useRouter } from 'next/navigation';
import ArticleForm from '@/components/ArticleForm';
import { api } from '@/lib/api';

export default function NewArticlePage() {
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    await api.createArticle(data);
    router.push('/articulos');
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Nuevo artículo</h1>
      <ArticleForm onSubmit={handleSubmit} />
    </div>
  );
}
