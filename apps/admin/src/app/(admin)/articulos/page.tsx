'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter } from 'lucide-react';
import DataTable from '@/components/DataTable';
import { api } from '@/lib/api';
import { Article, ArticleStatus, Category } from '@/lib/types';

const statusLabels: Record<ArticleStatus, string> = {
  DRAFT: 'Borrador',
  IN_REVIEW: 'En revisión',
  CORRECTION: 'Corrección',
  APPROVED: 'Aprobado',
  SCHEDULED: 'Programado',
  PUBLISHED: 'Publicado',
  ARCHIVED: 'Archivado',
};

const statusColors: Record<ArticleStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  IN_REVIEW: 'bg-yellow-100 text-yellow-800',
  CORRECTION: 'bg-orange-100 text-orange-800',
  APPROVED: 'bg-blue-100 text-blue-800',
  SCHEDULED: 'bg-purple-100 text-purple-800',
  PUBLISHED: 'bg-green-100 text-green-800',
  ARCHIVED: 'bg-red-100 text-red-800',
};

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    loadArticles();
    loadCategories();
  }, []);

  useEffect(() => {
    loadArticles();
  }, [statusFilter, categoryFilter]);

  const loadArticles = async () => {
    try {
      setIsLoading(true);
      const response = await api.getArticles({
        search: search || undefined,
        status: statusFilter || undefined,
        categoryId: categoryFilter || undefined,
        limit: 100,
      });
      setArticles(response.data || []);
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadArticles();
  };

  const handleDelete = async (article: Article) => {
    if (confirm('¿Estás seguro de eliminar este artículo?')) {
      try {
        await api.deleteArticle(article.id);
        setArticles((prev) => prev.filter((a) => a.id !== article.id));
      } catch (error) {
        console.error('Error deleting article:', error);
        alert('Error al eliminar el artículo');
      }
    }
  };

  const columns = [
    {
      key: 'title',
      header: 'Título',
      render: (article: Article) => (
        <span className="font-medium line-clamp-1">{article.title}</span>
      ),
    },
    {
      key: 'category',
      header: 'Categoría',
      render: (article: Article) => article.category?.name || '-',
    },
    {
      key: 'status',
      header: 'Estado',
      render: (article: Article) => (
        <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${statusColors[article.status]}`}>
          {statusLabels[article.status]}
        </span>
      ),
    },
    {
      key: 'author',
      header: 'Autor',
      render: (article: Article) => `${article.author.firstName} ${article.author.lastName}`,
    },
    {
      key: 'publishedAt',
      header: 'Publicado',
      render: (article: Article) =>
        article.publishedAt
          ? new Date(article.publishedAt).toLocaleDateString('es-ES')
          : '-',
    },
    {
      key: 'comments',
      header: 'Comentarios',
      render: (article: Article) => article._count?.comments ?? 0,
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Artículos</h1>
        <Link
          href="/articulos/nuevo"
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          Nuevo artículo
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <form onSubmit={handleSearch} className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar artículos..."
            className="w-full rounded-lg border py-2 pl-10 pr-4 text-sm"
          />
        </form>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            <option value="">Todos los estados</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            <option value="">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-gray-500">Cargando...</div>
      ) : (
        <DataTable
          columns={columns}
          data={articles}
          editPath={(article) => `/articulos/${article.id}/editar`}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
