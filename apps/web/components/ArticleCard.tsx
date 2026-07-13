import Link from 'next/link';
import Image from 'next/image';
import { Clock, MessageSquare } from 'lucide-react';
import { Article } from '@/lib/types';
import CategoryBadge from './CategoryBadge';

interface ArticleCardProps {
  article: Article;
  variant?: 'default' | 'featured' | 'compact';
}

export default function ArticleCard({ article, variant = 'default' }: ArticleCardProps) {
  const formattedDate = new Date(article.publishedAt || article.createdAt).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  if (variant === 'featured') {
    return (
      <Link href={`/articulo/${article.slug}`} className="group">
        <article className="relative overflow-hidden rounded-lg bg-gray-900">
          {article.media?.[0]?.url && (
            <div className="relative h-96">
              <Image
                src={article.media[0].url}
                alt={article.media[0].alt || article.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            {article.category && (
              <CategoryBadge category={article.category} className="mb-3" />
            )}
            <h2 className="text-2xl font-bold font-serif line-clamp-2">{article.title}</h2>
            {article.subtitle && (
              <p className="mt-2 text-gray-300 line-clamp-2">{article.subtitle}</p>
            )}
            <div className="mt-4 flex items-center gap-4 text-sm text-gray-400">
              <span>{article.author.firstName} {article.author.lastName}</span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {article.readTimeMinutes} min
              </span>
              {article._count?.comments && (
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  {article._count.comments}
                </span>
              )}
            </div>
          </div>
        </article>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link href={`/articulo/${article.slug}`} className="group">
        <article className="flex gap-4">
          {article.media?.[0]?.url && (
            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded">
              <Image
                src={article.media[0].url}
                alt={article.media[0].alt || article.title}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <h3 className="font-semibold line-clamp-2 group-hover:text-primary-600">
              {article.title}
            </h3>
            <p className="mt-1 text-sm text-gray-500">{formattedDate}</p>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link href={`/articulo/${article.slug}`} className="group">
      <article className="overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md">
        {article.media?.[0]?.url && (
          <div className="relative h-48">
            <Image
              src={article.media[0].url}
              alt={article.media[0].alt || article.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          </div>
        )}
        <div className="p-4">
          {article.category && (
            <CategoryBadge category={article.category} className="mb-2" />
          )}
          <h3 className="font-bold line-clamp-2 group-hover:text-primary-600">
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="mt-2 text-sm text-gray-600 line-clamp-2">{article.excerpt}</p>
          )}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <span>{article.author.firstName} {article.author.lastName}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {article.readTimeMinutes} min
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
