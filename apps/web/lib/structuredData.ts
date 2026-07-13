import { Article, Category } from './types';

export function generateArticleSchema(article: Article, baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt || article.subtitle,
    image: article.media?.[0]?.url,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: {
      '@type': 'Person',
      name: `${article.author.firstName} ${article.author.lastName}`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Diario Noticia',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/articulo/${article.slug}`,
    },
    articleSection: article.category?.name,
    keywords: article.tags?.map((t) => t.name).join(', '),
    wordCount: calculateWordCount(article.content),
    timeRequired: `PT${article.readTimeMinutes}M`,
  };
}

export function generateCategorySchema(category: Category, baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.name,
    description: category.description,
    url: `${baseUrl}/categoria/${category.slug}`,
  };
}

export function generateWebsiteSchema(baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Diario Noticia',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/buscar?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

function calculateWordCount(content: any): number {
  if (!content?.content) return 0;
  
  const text = content.content
    .map((node: any) => {
      if (node.content) {
        return node.content.map((inline: any) => inline.text || '').join('');
      }
      return '';
    })
    .join(' ');
  
  return text.split(/\s+/).filter(Boolean).length;
}
