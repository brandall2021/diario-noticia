import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RssService {
  private readonly logger = new Logger(RssService.name);

  constructor(private prisma: PrismaService) {}

  async generateRssFeed(baseUrl: string): Promise<string> {
    const articles = await this.prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        publishedAt: { not: null },
      },
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
      },
      orderBy: { publishedAt: 'desc' },
      take: 50,
    });

    const siteName = 'Diario Noticia';
    const siteDescription = 'Noticias de última hora, análisis y opiniones';
    const feedUrl = `${baseUrl}/rss`;

    const items = articles
      .map((article) => this.formatItem(article, baseUrl))
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${this.escapeXml(siteName)}</title>
    <link>${this.escapeXml(baseUrl)}</link>
    <description>${this.escapeXml(siteDescription)}</description>
    <language>es</language>
    <lastBuildDate>${this.formatRssDate(new Date())}</lastBuildDate>
    <atom:link href="${this.escapeXml(feedUrl)}" rel="self" type="application/rss+xml"/>
    <ttl>60</ttl>
${items}
  </channel>
</rss>`;
  }

  async generateCategoryFeed(
    baseUrl: string,
    categorySlug: string,
  ): Promise<string> {
    const category = await this.prisma.category.findUnique({
      where: { slug: categorySlug },
    });

    if (!category) {
      return this.generateNotFoundFeed(baseUrl, categorySlug);
    }

    const articles = await this.prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        publishedAt: { not: null },
        categoryId: category.id,
      },
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
      },
      orderBy: { publishedAt: 'desc' },
      take: 50,
    });

    const siteName = 'Diario Noticia';
    const feedUrl = `${baseUrl}/rss/categoria/${categorySlug}`;

    const items = articles
      .map((article) => this.formatItem(article, baseUrl))
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${this.escapeXml(siteName)} - ${this.escapeXml(category.name)}</title>
    <link>${this.escapeXml(baseUrl)}/categoria/${this.escapeXml(categorySlug)}</link>
    <description>${this.escapeXml(category.description || category.name)}</description>
    <language>es</language>
    <lastBuildDate>${this.formatRssDate(new Date())}</lastBuildDate>
    <atom:link href="${this.escapeXml(feedUrl)}" rel="self" type="application/rss+xml"/>
    <ttl>60</ttl>
${items}
  </channel>
</rss>`;
  }

  private formatItem(article: any, baseUrl: string): string {
    const itemUrl = `${baseUrl}/articulo/${article.slug}`;
    const author = `${article.author.firstName} ${article.author.lastName}`;
    const category = article.category?.name || '';
    const pubDate = article.publishedAt
      ? this.formatRssDate(article.publishedAt)
      : this.formatRssDate(article.createdAt);

    const description = article.excerpt || article.subtitle || '';
    const content = this.extractTextContent(article.content);

    const categories = article.tags
      ?.map((tag: any) => `    <category>${this.escapeXml(tag.name)}</category>`)
      .join('\n') || '';

    return `    <item>
      <title>${this.escapeXml(article.title)}</title>
      <link>${this.escapeXml(itemUrl)}</link>
      <guid isPermaLink="true">${this.escapeXml(itemUrl)}</guid>
      <pubDate>${pubDate}</pubDate>
      <dc:creator>${this.escapeXml(author)}</dc:creator>
      <description>${this.escapeXml(description)}</description>
      <content:encoded><![CDATA[${content}]]></content:encoded>${categories ? '\n' + categories : ''}
      <category>${this.escapeXml(category)}</category>
    </item>`;
  }

  private extractTextContent(content: any): string {
    if (!content?.content) return '';

    return content.content
      .map((node: any) => {
        if (node.content) {
          return node.content
            .map((inline: any) => inline.text || '')
            .join('');
        }
        return '';
      })
      .join('\n');
  }

  private formatRssDate(date: Date | string): string {
    const d = new Date(date);
    return d.toUTCString();
  }

  private escapeXml(str: string): string {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private generateNotFoundFeed(baseUrl: string, slug: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Diario Noticia - Categoría no encontrada</title>
    <link>${this.escapeXml(baseUrl)}</link>
    <description>La categoría "${this.escapeXml(slug)}" no fue encontrada</description>
    <language>es</language>
  </channel>
</rss>`;
  }
}
