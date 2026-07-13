import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SeoService {
  constructor(private prisma: PrismaService) {}

  async generateSitemap(baseUrl: string): Promise<string> {
    const [articles, categories, tags] = await Promise.all([
      this.prisma.article.findMany({
        where: { status: 'PUBLISHED' },
        select: { slug: true, updatedAt: true },
        orderBy: { publishedAt: 'desc' },
      }),
      this.prisma.category.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
      }),
      this.prisma.tag.findMany({
        select: { slug: true, createdAt: true },
      }),
    ]);

    const urls: string[] = [];

    // Homepage
    urls.push(this.createUrlEntry(baseUrl, '', 'daily', '1.0'));

    // Articles
    articles.forEach((article) => {
      urls.push(
        this.createUrlEntry(
          baseUrl,
          `/articulo/${article.slug}`,
          'weekly',
          '0.8',
          article.updatedAt,
        ),
      );
    });

    // Categories
    categories.forEach((category) => {
      urls.push(
        this.createUrlEntry(
          baseUrl,
          `/categoria/${category.slug}`,
          'daily',
          '0.7',
          category.updatedAt,
        ),
      );
    });

    // Tags
    tags.forEach((tag) => {
      urls.push(
        this.createUrlEntry(
          baseUrl,
          `/tag/${tag.slug}`,
          'weekly',
          '0.5',
          tag.createdAt,
        ),
      );
    });

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.join('\n  ')}
</urlset>`;
  }

  private createUrlEntry(
    baseUrl: string,
    path: string,
    changefreq: string,
    priority: string,
    lastmod?: Date,
  ): string {
    const lastModStr = lastmod
      ? `\n    <lastmod>${lastmod.toISOString()}</lastmod>`
      : '';
    return `<url>
    <loc>${baseUrl}${path}</loc>${lastModStr}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }

  async generateRobotsTxt(baseUrl: string): Promise<string> {
    return `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api

Sitemap: ${baseUrl}/sitemap.xml`;
  }

  async getSeoSettings(): Promise<Record<string, any>> {
    const settings = await this.prisma.systemConfig.findMany({
      where: { group: 'seo' },
    });

    return settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, any>);
  }

  async updateSeoSettings(settings: Record<string, any>): Promise<void> {
    await Promise.all(
      Object.entries(settings).map(([key, value]) =>
        this.prisma.systemConfig.upsert({
          where: { key },
          update: { value },
          create: { key, value, group: 'seo' },
        }),
      ),
    );
  }
}
