'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import api from '@/lib/api';
import ArticleCard from '@/components/ArticleCard';
import { Article } from '@/lib/types';

export default function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setHasSearched(true);

    try {
      const response = await api.searchArticles(searchQuery);
      setArticles(response.data || []);
    } catch (error) {
      console.error('Search error:', error);
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  return (
    <div className="container-custom py-8">
      <h1 className="mb-8 text-3xl font-bold">Buscar noticias</h1>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por título, contenido, etiquetas..."
              className="w-full rounded-lg border py-3 pl-12 pr-4 text-lg focus:border-primary-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-lg bg-primary-600 px-8 py-3 font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {isLoading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </form>

      {isLoading ? (
        <div className="py-12 text-center text-gray-500">Buscando...</div>
      ) : !hasSearched ? (
        <div className="py-12 text-center text-gray-500">
          Ingresa un término para buscar noticias.
        </div>
      ) : articles.length === 0 ? (
        <div className="py-12 text-center text-gray-500">
          No se encontraron resultados para &quot;{query}&quot;.
        </div>
      ) : (
        <>
          <p className="mb-6 text-gray-600">
            {articles.length} resultado{articles.length !== 1 ? 's' : ''} para &quot;{query}&quot;
          </p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
