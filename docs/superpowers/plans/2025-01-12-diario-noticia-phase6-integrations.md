# Phase 6: Integrations - SEO, Analytics, AI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement SEO optimization, analytics tracking, and AI-powered features (OpenAI integration) for the Diario Noticia platform.

**Architecture:** Server-side SEO with Next.js metadata, client-side analytics with custom events, OpenAI integration for content suggestions and moderation. Redis caching for performance.

**Tech Stack:** Next.js 14+ Metadata API, OpenAI API, Redis, structured data (JSON-LD), sitemap generation, robots.txt

## Global Constraints
- SEO: Server-side rendering, proper meta tags, structured data
- Analytics: Privacy-respecting, no third-party trackers by default
- AI: OpenAI GPT-4 for content suggestions, moderation, summaries
- Caching: Redis for API responses, page cache
- Performance: Lighthouse score > 90
- Commit after each task

---

## File Structure

### Phase 6 Files

| File | Responsibility |
|------|----------------|
| `apps/api/src/modules/seo/` | SEO module (sitemap, robots) |
| `apps/api/src/modules/ai/` | AI integration module |
| `apps/api/src/common/services/cache.service.ts` | Redis caching service |
| `apps/web/app/sitemap.ts` | Dynamic sitemap generation |
| `apps/web/app/robots.ts` | Robots.txt generation |
| `apps/web/components/SEOHead.tsx` | SEO component |
| `apps/web/lib/structuredData.ts` | JSON-LD generators |
| `apps/web/lib/analytics.ts` | Analytics client |
| `apps/admin/app/configuracion/seo/page.tsx` | SEO settings |
| `apps/admin/app/configuracion/ai/page.tsx` | AI settings |

---

## Tasks

### Task 1: Redis Caching Service

**Files:**
- Create: `apps/api/src/common/services/cache.service.ts`
- Modify: `apps/api/src/app.module.ts`

**Interfaces:**
- Consumes: Redis connection
- Produces: CacheService for all modules

- [ ] **Step 1: Install Redis dependencies**

```bash
cd apps/api && npm install @nestjs/cache-manager cache-manager ioredis
```

- [ ] **Step 2: Create CacheService**

```typescript
// apps/api/src/common/services/cache.service.ts'
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleDestroy {
  private client: Redis;
  private defaultTTL = 300; // 5 minutes

  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    if (!data) return null;
    return JSON.parse(data);
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttl) {
      await this.client.setex(key, ttl, serialized);
    } else {
      await this.client.setex(key, this.defaultTTL, serialized);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async delPattern(pattern: string): Promise<void> {
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  async reset(): Promise<void> {
    await this.client.flushdb();
  }

  onModuleDestroy() {
    this.client.disconnect();
  }
}
```

- [ ] **Step 3: Register CacheService globally**

```typescript
// apps/api/src/app.module.ts
import { CacheService } from './common/services/cache.service';

@Module({
  providers: [
    // ... existing providers
    CacheService,
  ],
  exports: [CacheService],
})
```

- [ ] **Step 4: Add Redis to docker-compose.dev.yml**

```yaml
# docker-compose.dev.yml - add redis service
redis:
  image: redis:7-alpine
  ports:
    - "6379:6379"
  volumes:
    - redis_data:/data
```

- [ ] **Step 5: Test Redis connection**

Run: `docker-compose -f docker-compose.dev.yml up -d redis`
Run: `npm run start:dev`
Expected: Server connects to Redis without errors

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/common/services apps/api/src/app.module.ts docker-compose.dev.yml
git commit -m "feat(api): add Redis caching service"
```

---

### Task 2: SEO Module (Sitemap & Robots)

**Files:**
- Create: `apps/api/src/modules/seo/seo.module.ts`
- Create: `apps/api/src/modules/seo/seo.controller.ts`
- Create: `apps/api/src/modules/seo/seo.service.ts`

**Interfaces:**
- Consumes: PrismaService, CacheService
- Produces: Sitemap XML, robots.txt

- [ ] **Step 1: Create SEO module**

```typescript
// apps/api/src/modules/seo/seo.module.ts'
import { Module } from '@nestjs/common';
import { SeoController } from './seo.controller';
import { SeoService } from './seo.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SeoController],
  providers: [SeoService],
})
export class SeoModule {}
```

- [ ] **Step 2: Create SeoService**

```typescript
// apps/api/src/modules/seo/seo.service.ts'
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
        select: { slug: true, updatedAt: true },
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
          tag.updatedAt,
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
```

- [ ] **Step 3: Create SeoController**

```typescript
// apps/api/src/modules/seo/seo.controller.ts'
import { Controller, Get, Header, Put, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SeoService } from './seo.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('seo')
@Controller()
export class SeoController {
  constructor(private readonly seoService: SeoService) {}

  @Get('sitemap.xml')
  @Public()
  @Header('Content-Type', 'application/xml')
  @ApiOperation({ summary: 'Generate sitemap XML' })
  async getSitemap() {
    const baseUrl = process.env.APP_URL || 'http://localhost:3001';
    return this.seoService.generateSitemap(baseUrl);
  }

  @Get('robots.txt')
  @Public()
  @Header('Content-Type', 'text/plain')
  @ApiOperation({ summary: 'Generate robots.txt' })
  async getRobotsTxt() {
    const baseUrl = process.env.APP_URL || 'http://localhost:3001';
    return this.seoService.generateRobotsTxt(baseUrl);
  }

  @Get('admin/seo/settings')
  @ApiOperation({ summary: 'Get SEO settings' })
  async getSeoSettings() {
    return this.seoService.getSeoSettings();
  }

  @Put('admin/seo/settings')
  @ApiOperation({ summary: 'Update SEO settings' })
  async updateSeoSettings(@Body() settings: Record<string, any>) {
    return this.seoService.updateSeoSettings(settings);
  }
}
```

- [ ] **Step 4: Register SeoModule**

```typescript
// apps/api/src/app.module.ts
import { SeoModule } from './modules/seo/seo.module';

@Module({
  imports: [
    // ... existing imports
    SeoModule,
  ],
})
```

- [ ] **Step 5: Test sitemap generation**

Run: `npm run start:dev`
Navigate to: `http://localhost:3000/sitemap.xml`
Expected: Valid XML sitemap with articles, categories, tags

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/modules/seo
git commit -m "feat(api): implement SEO module with sitemap and robots.txt"
```

---

### Task 3: AI Integration Module

**Files:**
- Create: `apps/api/src/modules/ai/ai.module.ts`
- Create: `apps/api/src/modules/ai/ai.controller.ts`
- Create: `apps/api/src/modules/ai/ai.service.ts`
- Create: `apps/api/src/modules/ai/dto/content-suggestion.dto.ts`

**Interfaces:**
- Consumes: OpenAI API, PrismaService
- Produces: Content suggestions, summaries, moderation

- [ ] **Step 1: Install OpenAI SDK**

```bash
cd apps/api && npm install openai
```

- [ ] **Step 2: Create AI module**

```typescript
// apps/api/src/modules/ai/ai.module.ts'
import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
```

- [ ] **Step 3: Create AiService**

```typescript
// apps/api/src/modules/ai/ai.service.ts'
import { Injectable, BadRequestException } from '@nestjs/common';
import OpenAI from 'openai';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(private prisma: PrismaService) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateContentSuggestions(topic: string, count: number = 5): Promise<string[]> {
    if (!process.env.OPENAI_API_KEY) {
      throw new BadRequestException('OpenAI API key not configured');
    }

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Eres un editor de noticias experimentado. Genera sugerencias de titulares atractivos y informativos.',
        },
        {
          role: 'user',
          content: `Genera ${count} sugerencias de titulares para noticias sobre: ${topic}. Responde solo con los titulares, uno por línea.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const suggestions = completion.choices[0]?.message?.content || '';
    return suggestions.split('\n').filter((s) => s.trim());
  }

  async generateSummary(content: string, maxLength: number = 200): Promise<string> {
    if (!process.env.OPENAI_API_KEY) {
      throw new BadRequestException('OpenAI API key not configured');
    }

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Eres un editor de noticias. Resume el contenido de manera concisa y objetiva.',
        },
        {
          role: 'user',
          content: `Resume el siguiente contenido en máximo ${maxLength} caracteres:\n\n${content}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 300,
    });

    return completion.choices[0]?.message?.content || '';
  }

  async moderateContent(content: string): Promise<{
    approved: boolean;
    reason?: string;
    suggestions?: string[];
  }> {
    if (!process.env.OPENAI_API_KEY) {
      // Fallback to basic moderation if no API key
      return { approved: true };
    }

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `Eres un moderador de contenido. Analiza el contenido y determina si es apropiado para un periódico.
          Responde con un JSON: { "approved": boolean, "reason": string, "suggestions": string[] }`,
        },
        {
          role: 'user',
          content: `Analiza este contenido:\n\n${content}`,
        },
      ],
      temperature: 0.1,
      max_tokens: 500,
    });

    try {
      const response = completion.choices[0]?.message?.content || '{}';
      return JSON.parse(response);
    } catch {
      return { approved: true };
    }
  }

  async generateMetaDescription(content: string): Promise<string> {
    if (!process.env.OPENAI_API_KEY) {
      return content.substring(0, 160) + '...';
    }

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Genera una meta descripción SEO optimizada para el contenido dado. Máximo 155 caracteres.',
        },
        {
          role: 'user',
          content: `Genera una meta descripción para:\n\n${content.substring(0, 500)}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 200,
    });

    return completion.choices[0]?.message?.content || '';
  }

  async suggestTags(content: string): Promise<string[]> {
    if (!process.env.OPENAI_API_KEY) {
      return [];
    }

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Sugiere 5-10 etiquetas relevantes para el contenido. Responde solo con las etiquetas, una por línea.',
        },
        {
          role: 'user',
          content: `Sugiere etiquetas para:\n\n${content.substring(0, 1000)}`,
        },
      ],
      temperature: 0.5,
      max_tokens: 200,
    });

    const tags = completion.choices[0]?.message?.content || '';
    return tags.split('\n').filter((t) => t.trim());
  }
}
```

- [ ] **Step 4: Create AiController**

```typescript
// apps/api/src/modules/ai/ai.controller.ts'
import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AiService } from './ai.service';

@ApiTags('ai')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('suggest-content')
  @ApiOperation({ summary: 'Get content suggestions' })
  async suggestContent(
    @Body('topic') topic: string,
    @Body('count') count?: number,
  ) {
    return this.aiService.generateContentSuggestions(topic, count);
  }

  @Post('summarize')
  @ApiOperation({ summary: 'Generate content summary' })
  async summarize(
    @Body('content') content: string,
    @Body('maxLength') maxLength?: number,
  ) {
    return this.aiService.generateSummary(content, maxLength);
  }

  @Post('moderate')
  @ApiOperation({ summary: 'Moderate content' })
  async moderate(@Body('content') content: string) {
    return this.aiService.moderateContent(content);
  }

  @Post('meta-description')
  @ApiOperation({ summary: 'Generate meta description' })
  async generateMetaDescription(@Body('content') content: string) {
    return this.aiService.generateMetaDescription(content);
  }

  @Post('suggest-tags')
  @ApiOperation({ summary: 'Suggest tags for content' })
  async suggestTags(@Body('content') content: string) {
    return this.aiService.suggestTags(content);
  }
}
```

- [ ] **Step 5: Register AiModule**

```typescript
// apps/api/src/app.module.ts
import { AiModule } from './modules/ai/ai.module';

@Module({
  imports: [
    // ... existing imports
    AiModule,
  ],
})
```

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/modules/ai apps/api/package.json
git commit -m "feat(api): implement AI integration module with OpenAI"
```

---

### Task 4: Frontend SEO Components

**Files:**
- Create: `apps/web/lib/structuredData.ts`
- Create: `apps/web/components/SEOHead.tsx`
- Modify: `apps/web/app/articulo/[slug]/page.tsx`

**Interfaces:**
- Consumes: Article, Category types
- Produces: JSON-LD structured data, SEO meta tags

- [ ] **Step 1: Create structured data generators**

```typescript
// apps/web/lib/structuredData.ts'
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
```

- [ ] **Step 2: Create SEOHead component**

```tsx
// apps/web/components/SEOHead.tsx'
import Head from 'next/head';

interface SEOHeadProps {
  title: string;
  description: string;
  image?: string;
  url: string;
  type?: string;
  publishedTime?: string;
  author?: string;
  structuredData?: any;
}

export default function SEOHead({
  title,
  description,
  image,
  url,
  type = 'website',
  publishedTime,
  author,
  structuredData,
}: SEOHeadProps) {
  const siteName = 'Diario Noticia';
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="author" content={author} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      {image && <meta property="og:image" content={image} />}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      
      {/* Twitter */}
      <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
      
      {/* Canonical */}
      <link rel="canonical" href={url} />
      
      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
    </Head>
  );
}
```

- [ ] **Step 3: Update article page with SEO**

```tsx
// apps/web/app/articulo/[slug]/page.tsx - add to imports and head
import SEOHead from '@/components/SEOHead';
import { generateArticleSchema } from '@/lib/structuredData';

// In the component, before return:
const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const articleSchema = generateArticleSchema(article, baseUrl);

// Add to return:
<>
  <SEOHead
    title={article.metaTitle || article.title}
    description={article.metaDescription || article.excerpt || article.subtitle}
    image={article.ogImage || article.media?.[0]?.url}
    url={`${baseUrl}/articulo/${article.slug}`}
    type="article"
    publishedTime={article.publishedAt}
    author={`${article.author.firstName} ${article.author.lastName}`}
    structuredData={articleSchema}
  />
  {/* ... rest of the page */}
</>
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/lib/structuredData.ts apps/web/components/SEOHead.tsx apps/web/app/articulo
git commit -m "feat(web): add SEO components and structured data"
```

---

### Task 5: Frontend Analytics

**Files:**
- Create: `apps/web/lib/analytics.ts`
- Create: `apps/web/components/AnalyticsProvider.tsx`
- Modify: `apps/web/app/layout.tsx`

**Interfaces:**
- Produces: Analytics tracking, event logging

- [ ] **Step 1: Create analytics client**

```typescript
// apps/web/lib/analytics.ts'
type EventProperties = Record<string, string | number | boolean>;

class Analytics {
  private enabled: boolean;
  private endpoint: string;

  constructor() {
    this.enabled = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true';
    this.endpoint = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT || '/api/analytics';
  }

  async track(event: string, properties?: EventProperties) {
    if (!this.enabled) return;

    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event,
          properties,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent,
        }),
      });
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }

  pageView(path: string, title?: string) {
    this.track('page_view', { path, title });
  }

  articleView(slug: string, title: string, category?: string) {
    this.track('article_view', { slug, title, category });
  }

  search(query: string, resultsCount: number) {
    this.track('search', { query, resultsCount });
  }

  newsletterSubscribe(email: string) {
    this.track('newsletter_subscribe', { email });
  }

  commentSubmit(articleId: string) {
    this.track('comment_submit', { articleId });
  }

  share(method: string, url: string) {
    this.track('share', { method, url });
  }
}

export const analytics = new Analytics();
```

- [ ] **Step 2: Create AnalyticsProvider**

```tsx
// apps/web/components/AnalyticsProvider.tsx'
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { analytics } from '@/lib/analytics';

export default function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    analytics.pageView(pathname);
  }, [pathname]);

  return <>{children}</>;
}
```

- [ ] **Step 3: Add to layout**

```tsx
// apps/web/app/layout.tsx
import AnalyticsProvider from '@/components/AnalyticsProvider';

// In body:
<body className="font-sans antialiased">
  <AuthProvider>
    <AnalyticsProvider>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </AnalyticsProvider>
  </AuthProvider>
</body>
```

- [ ] **Step 4: Add tracking to article page**

```tsx
// In article page component, add:
'use client';
import { useEffect } from 'react';
import { analytics } from '@/lib/analytics';

// After component renders:
useEffect(() => {
  analytics.articleView(article.slug, article.title, article.category?.name);
}, [article]);
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/analytics.ts apps/web/components/AnalyticsProvider.tsx
git commit -m "feat(web): add analytics tracking provider"
```

---

### Task 6: Admin SEO & AI Settings

**Files:**
- Create: `apps/admin/app/configuracion/seo/page.tsx`
- Create: `apps/admin/app/configuracion/ai/page.tsx`

**Interfaces:**
- Consumes: API client
- Produces: Settings pages

- [ ] **Step 1: Create SEO settings page**

```tsx
// apps/admin/app/configuracion/seo/page.tsx'
'use client';

import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { api } from '@/lib/api';

export default function SeoSettingsPage() {
  const [settings, setSettings] = useState({
    siteTitle: 'Diario Noticia',
    siteDescription: 'Tu fuente de noticias confiable',
    ogImage: '',
    twitterHandle: '',
    googleAnalyticsId: '',
    robotsTxt: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await api.request('/admin/seo/settings');
      if (data && typeof data === 'object') {
        setSettings((prev) => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.request('/admin/seo/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="py-12 text-center">Cargando...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Configuración SEO</h1>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* General SEO */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold">General</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Título del sitio</label>
              <input
                type="text"
                value={settings.siteTitle}
                onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
                className="w-full rounded-lg border px-4 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Descripción del sitio</label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                rows={3}
                className="w-full rounded-lg border px-4 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Imagen Open Graph</label>
              <input
                type="url"
                value={settings.ogImage}
                onChange={(e) => setSettings({ ...settings, ogImage: e.target.value })}
                placeholder="https://..."
                className="w-full rounded-lg border px-4 py-2"
              />
            </div>
          </div>
        </div>

        {/* Analytics */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold">Analytics</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Google Analytics ID</label>
              <input
                type="text"
                value={settings.googleAnalyticsId}
                onChange={(e) => setSettings({ ...settings, googleAnalyticsId: e.target.value })}
                placeholder="G-XXXXXXXXXX"
                className="w-full rounded-lg border px-4 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Twitter Handle</label>
              <input
                type="text"
                value={settings.twitterHandle}
                onChange={(e) => setSettings({ ...settings, twitterHandle: e.target.value })}
                placeholder="@dianoticia"
                className="w-full rounded-lg border px-4 py-2"
              />
            </div>
          </div>
        </div>

        {/* Robots.txt */}
        <div className="col-span-full rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold">Robots.txt Personalizado</h2>
          <textarea
            value={settings.robotsTxt}
            onChange={(e) => setSettings({ ...settings, robotsTxt: e.target.value })}
            rows={10}
            className="w-full rounded-lg border px-4 py-2 font-mono text-sm"
            placeholder="User-agent: *&#10;Allow: /&#10;Disallow: /admin"
          />
          <p className="mt-2 text-sm text-gray-500">
            Dejar vacío para usar la configuración por defecto.
          </p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create AI settings page**

```tsx
// apps/admin/app/configuracion/ai/page.tsx'
'use client';

import { useState } from 'react';
import { Save, Key, Bot } from 'lucide-react';
import { api } from '@/lib/api';

export default function AiSettingsPage() {
  const [settings, setSettings] = useState({
    openaiApiKey: '',
    openaiModel: 'gpt-4',
    contentModerationEnabled: true,
    autoGenerateMeta: true,
    autoSuggestTags: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.request('/admin/ai/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const testConnection = async () => {
    try {
      const result = await api.request('/ai/suggest-content', {
        method: 'POST',
        body: JSON.stringify({ topic: 'noticias de prueba', count: 2 }),
      });
      setTestResult(`Conexión exitosa. Sugerencia: ${result[0] || 'OK'}`);
    } catch (error: any) {
      setTestResult(`Error: ${error.message}`);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Configuración de IA</h1>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* API Configuration */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Key className="h-5 w-5 text-gray-500" />
            <h2 className="font-semibold">Configuración de API</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">OpenAI API Key</label>
              <input
                type="password"
                value={settings.openaiApiKey}
                onChange={(e) => setSettings({ ...settings, openaiApiKey: e.target.value })}
                placeholder="sk-..."
                className="w-full rounded-lg border px-4 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Modelo</label>
              <select
                value={settings.openaiModel}
                onChange={(e) => setSettings({ ...settings, openaiModel: e.target.value })}
                className="w-full rounded-lg border px-4 py-2"
              >
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              </select>
            </div>
            <button
              onClick={testConnection}
              className="flex items-center gap-2 rounded-lg border px-4 py-2 hover:bg-gray-50"
            >
              <Bot className="h-4 w-4" />
              Probar conexión
            </button>
            {testResult && (
              <p className={`text-sm ${testResult.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>
                {testResult}
              </p>
            )}
          </div>
        </div>

        {/* AI Features */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Bot className="h-5 w-5 text-gray-500" />
            <h2 className="font-semibold">Funciones de IA</h2>
          </div>
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.contentModerationEnabled}
                onChange={(e) => setSettings({ ...settings, contentModerationEnabled: e.target.checked })}
                className="rounded"
              />
              <div>
                <p className="font-medium">Moderación automática</p>
                <p className="text-sm text-gray-500">Analizar contenido con IA antes de publicar</p>
              </div>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.autoGenerateMeta}
                onChange={(e) => setSettings({ ...settings, autoGenerateMeta: e.target.checked })}
                className="rounded"
              />
              <div>
                <p className="font-medium">Generar meta descripciones</p>
                <p className="text-sm text-gray-500">Crear automáticamente meta descripciones SEO</p>
              </div>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.autoSuggestTags}
                onChange={(e) => setSettings({ ...settings, autoSuggestTags: e.target.checked })}
                className="rounded"
              />
              <div>
                <p className="font-medium">Sugerir etiquetas</p>
                <p className="text-sm text-gray-500">Sugerir etiquetas relevantes para artículos</p>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Update settings navigation**

Add SEO and AI settings links to the admin settings page navigation.

- [ ] **Step 4: Commit**

```bash
git add apps/admin/app/configuracion
git commit -m "feat(admin): add SEO and AI settings pages"
```

---

### Task 7: Final Verification & Documentation

**Files:**
- Modify: `.superpowers/sdd/progress.md`
- Modify: `README.md`

**Interfaces:**
- Consumes: All Phase 6 tasks
- Produces: Verified integrations, updated documentation

- [ ] **Step 1: Test SEO**

```bash
# Start both servers
cd apps/api && npm run start:dev &
cd apps/web && npm run dev &

# Test sitemap
curl http://localhost:3000/sitemap.xml

# Test robots.txt
curl http://localhost:3000/robots.txt
```

Expected: Valid XML sitemap and robots.txt

- [ ] **Step 2: Test AI (if API key configured)**

```bash
# Test content suggestion
curl -X POST http://localhost:3000/ai/suggest-content \
  -H "Content-Type: application/json" \
  -d '{"topic": "economía", "count": 3}'
```

Expected: Array of content suggestions

- [ ] **Step 3: Test analytics**

Navigate to: `http://localhost:3001`
Open browser console
Expected: Analytics events logged

- [ ] **Step 4: Lighthouse audit**

Run Lighthouse on public portal
Expected: Performance > 90, SEO > 95, Accessibility > 90

- [ ] **Step 5: Update progress.md**

Add Phase 6 completion status.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "docs: complete Phase 6 verification and update progress"
```

---

### Task 8: Project Completion

**Files:**
- Modify: `README.md`
- Modify: `docker-compose.dev.yml`

**Interfaces:**
- All phases complete
- Produces: Final documentation, deployment-ready configuration

- [ ] **Step 1: Update README.md**

Add sections for:
- Project overview
- Tech stack
- Getting started
- Development
- Deployment
- Environment variables
- API documentation
- Contributing

- [ ] **Step 2: Update docker-compose.dev.yml**

Ensure all services are properly configured:
- PostgreSQL
- Redis
- MinIO
- Elasticsearch (optional)
- API
- Web
- Admin

- [ ] **Step 3: Create .env.example**

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/diario_noticia

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=1h

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=diario-noticia

# OpenAI (optional)
OPENAI_API_KEY=sk-your-key-here

# App URLs
NEXT_PUBLIC_API_URL=http://localhost:3000
APP_URL=http://localhost:3001
```

- [ ] **Step 4: Final commit**

```bash
git add .
git commit -m "chore: complete project documentation and configuration"
```

---

## Summary

**Phase 6 adds:**
- Redis caching for improved performance
- Dynamic sitemap and robots.txt
- OpenAI integration for content suggestions, summaries, moderation
- SEO structured data (JSON-LD)
- Client-side analytics tracking
- Admin settings for SEO and AI configuration

**Total estimated tasks:** 8
**Estimated time:** 4-6 hours
