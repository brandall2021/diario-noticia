import { notFound } from 'next/navigation';
import api from '@/lib/api';
import ArticleCard from '@/components/ArticleCard';
import Pagination from '@/components/Pagination';
import type { Metadata } from 'next';
import type { Article } from '@/lib/types';

interface Props {
  params: { slug: string };
  searchParams: { page?: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const category = await api.getCategory(params.slug);
    return {
      title: `${category.name} - Diario Noticia`,
      description: category.description || `Noticias de ${category.name}`,
    };
  } catch {
    return { title: 'Categoría no encontrada' };
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const page = Number(searchParams.page) || 1;
  const limit = 12;

  let category;
  try {
    category = await api.getCategory(params.slug);
  } catch {
    notFound();
  }

  let articles: Article[] = [];
  let total = 0;

  try {
    const response = await api.getArticlesByCategory(category.id, limit, page);
    articles = response.data || [];
    total = response.total || 0;
  } catch {
    // Ignore error
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="container-custom py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-serif">{category.name}</h1>
        {category.description && (
          <p className="mt-2 text-gray-600">{category.description}</p>
        )}
      </div>

      {articles.length === 0 ? (
        <div className="py-12 text-center text-gray-500">
          No hay artículos en esta categoría aún.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            baseUrl={`/categoria/${params.slug}`}
          />
        </>
      )}
    </div>
  );
}
