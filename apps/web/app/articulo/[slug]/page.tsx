import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, Eye, Share2, Calendar } from 'lucide-react';
import api from '@/lib/api';
import { Article } from '@/lib/types';
import CategoryBadge from '@/components/CategoryBadge';
import Comments from '@/components/Comments';
import ArticleAnalytics from '@/components/ArticleAnalytics';
import ArticleCard from '@/components/ArticleCard';
import SEOHead from '@/components/SEOHead';
import { generateArticleSchema } from '@/lib/structuredData';
import type { Metadata } from 'next';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const article = await api.getArticle(params.slug);
    return {
      title: article.metaTitle || article.title,
      description: article.metaDescription || article.excerpt,
      openGraph: {
        title: article.metaTitle || article.title,
        description: article.metaDescription || article.excerpt,
        images: article.ogImage ? [article.ogImage] : [],
        type: 'article',
        publishedTime: article.publishedAt,
        authors: [`${article.author.firstName} ${article.author.lastName}`],
      },
    };
  } catch {
    return { title: 'Artículo no encontrado' };
  }
}

export default async function ArticlePage({ params }: Props) {
  let article;
  try {
    article = await api.getArticle(params.slug);
  } catch {
    notFound();
  }

  const formattedDate = new Date(article.publishedAt || article.createdAt).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  let relatedArticles: Article[] = [];
  if (article.category) {
    try {
      const response = await api.getArticlesByCategory(article.category.slug, 4);
      relatedArticles = (response.data || []).filter((a) => a.id !== article.id).slice(0, 3);
    } catch {
      // Ignore error
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const articleSchema = generateArticleSchema(article, baseUrl);

  return (
    <>
    <ArticleAnalytics slug={article.slug} title={article.title} category={article.category?.name} />
    <SEOHead
      title={article.metaTitle || article.title}
      description={article.metaDescription || article.excerpt || article.subtitle || ''}
      image={article.ogImage || article.media?.[0]?.url}
      url={`${baseUrl}/articulo/${article.slug}`}
      type="article"
      publishedTime={article.publishedAt}
      author={`${article.author.firstName} ${article.author.lastName}`}
      structuredData={articleSchema}
    />
    <div className="container-custom py-8">
      <article className="mx-auto max-w-4xl">
        {/* Header */}
        <header className="mb-8">
          {article.category && (
            <CategoryBadge category={article.category} className="mb-4" />
          )}
          <h1 className="text-3xl font-bold font-serif md:text-4xl">{article.title}</h1>
          {article.subtitle && (
            <p className="mt-4 text-xl text-gray-600">{article.subtitle}</p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formattedDate}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {article.readTimeMinutes} min de lectura
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {article.viewCount} vistas
            </span>
            <button className="flex items-center gap-1 hover:text-primary-600">
              <Share2 className="h-4 w-4" />
              Compartir
            </button>
          </div>

          <div className="mt-4 flex items-center gap-3">
            {article.author.avatar && (
              <Image
                src={article.author.avatar}
                alt={article.author.firstName}
                width={40}
                height={40}
                className="rounded-full"
              />
            )}
            <div>
              <span className="font-medium">{article.author.firstName} {article.author.lastName}</span>
            </div>
          </div>
        </header>

        {/* Featured image */}
        {article.media?.[0]?.url && (
          <div className="relative mb-8 h-96 overflow-hidden rounded-lg">
            <Image
              src={article.media[0].url}
              alt={article.media[0].alt || article.title}
              fill
              className="object-cover"
              priority
            />
            {article.media[0].caption && (
              <p className="absolute bottom-0 left-0 right-0 bg-black/50 p-4 text-sm text-white">
                {article.media[0].caption}
              </p>
            )}
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          {typeof article.content === 'object' && article.content.content ? (
            <div dangerouslySetInnerHTML={{ __html: renderContent(article.content) }} />
          ) : (
            <p>{String(article.content)}</p>
          )}
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="mt-8 border-t pt-6">
            <span className="text-sm font-medium text-gray-600">Etiquetas: </span>
            {article.tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tag/${tag.slug}`}
                className="mr-2 inline-block rounded-full bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* Comments */}
        {article.allowComments && (
          <Comments articleId={article.id} />
        )}
      </article>

      {/* Related articles */}
      {relatedArticles.length > 0 && (
        <section className="mx-auto mt-12 max-w-4xl border-t pt-8">
          <h2 className="mb-6 text-2xl font-bold">Noticias relacionadas</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {relatedArticles.map((relatedArticle) => (
              <ArticleCard key={relatedArticle.id} article={relatedArticle} />
            ))}
          </div>
        </section>
      )}
    </div>
    </>
  );
}

function renderContent(content: any): string {
  if (!content?.content) return '';

  return content.content
    .map((node: any) => {
      if (node.type === 'paragraph') {
        const text = node.content
          ?.map((inline: any) => inline.text || '')
          .join('') || '';
        return `<p>${text}</p>`;
      }
      if (node.type === 'heading') {
        const text = node.content
          ?.map((inline: any) => inline.text || '')
          .join('') || '';
        const level = node.attrs?.level || 2;
        return `<h${level}>${text}</h${level}>`;
      }
      if (node.type === 'image') {
        return `<img src="${node.attrs?.src}" alt="${node.attrs?.alt || ''}" />`;
      }
      return '';
    })
    .join('');
}
