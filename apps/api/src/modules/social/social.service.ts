import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SocialService {
  private readonly logger = new Logger(SocialService.name);

  constructor(private prisma: PrismaService) {}

  async getOpenGraphMeta(slug: string, baseUrl: string) {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      include: {
        author: {
          select: { firstName: true, lastName: true },
        },
        category: {
          select: { name: true, slug: true },
        },
        tags: {
          select: { name: true },
        },
        media: {
          select: { url: true, alt: true, type: true },
          take: 1,
        },
      },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const articleUrl = `${baseUrl}/articulo/${article.slug}`;
    const imageUrl = article.ogImage || article.media?.[0]?.url || `${baseUrl}/og-default.png`;
    const description = article.metaDescription || article.excerpt || article.subtitle || '';

    return {
      'og:title': article.metaTitle || article.title,
      'og:description': description,
      'og:url': articleUrl,
      'og:type': 'article',
      'og:site_name': 'Diario Noticia',
      'og:image': imageUrl,
      'og:image:width': '1200',
      'og:image:height': '630',
      'og:locale': 'es_AR',
      'article:published_time': article.publishedAt?.toISOString(),
      'article:modified_time': article.updatedAt.toISOString(),
      'article:author': `${article.author.firstName} ${article.author.lastName}`,
      'article:section': article.category?.name,
      'article:tag': article.tags?.map((t: any) => t.name).join(', '),
    };
  }

  async getTwitterCardMeta(slug: string, baseUrl: string) {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      include: {
        author: {
          select: { firstName: true, lastName: true },
        },
        category: {
          select: { name: true, slug: true },
        },
        media: {
          select: { url: true, alt: true },
          take: 1,
        },
      },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const articleUrl = `${baseUrl}/articulo/${article.slug}`;
    const imageUrl = article.ogImage || article.media?.[0]?.url || `${baseUrl}/twitter-default.png`;
    const description = article.metaDescription || article.excerpt || article.subtitle || '';

    return {
      'twitter:card': imageUrl ? 'summary_large_image' : 'summary',
      'twitter:title': article.metaTitle || article.title,
      'twitter:description': description,
      'twitter:image': imageUrl,
      'twitter:image:alt': article.media?.[0]?.alt || article.title,
      'twitter:site': '@DiarioNoticia',
      'twitter:creator': `@${article.author.firstName}${article.author.lastName}`,
      'twitter:url': articleUrl,
    };
  }

  async getShareUrls(slug: string, baseUrl: string) {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      select: {
        title: true,
        slug: true,
        shareCount: true,
      },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const articleUrl = `${baseUrl}/articulo/${article.slug}`;
    const encodedUrl = encodeURIComponent(articleUrl);
    const encodedTitle = encodeURIComponent(article.title);

    return {
      article: {
        title: article.title,
        url: articleUrl,
        shareCount: article.shareCount,
      },
      shareUrls: {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
        telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
        email: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
      },
    };
  }

  async incrementShareCount(slug: string) {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      select: { id: true, shareCount: true },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return this.prisma.article.update({
      where: { slug },
      data: { shareCount: { increment: 1 } },
      select: { slug: true, shareCount: true },
    });
  }
}
