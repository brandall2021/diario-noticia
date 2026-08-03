import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ElasticsearchService } from '../../common/elasticsearch/elasticsearch.service';
import Parser from 'rss-parser';
import OpenAI from 'openai';
import { ArticleStatus } from '@prisma/client';
import { CreateNewsSourceDto } from './dto/create-source.dto';
import { UpdateNewsSourceDto } from './dto/update-source.dto';
import { generateSlug } from '../../common/helpers/slug.helper';

const ARTICLE_INDEX = 'articles';

interface RawItem {
  title: string;
  content: string;
  link: string;
}

interface EnrichedItem {
  title?: string;
  subtitle?: string;
  excerpt?: string;
  tags: string[];
  category?: string | null;
}

@Injectable()
export class HarvesterService implements OnModuleInit {
  private readonly logger = new Logger(HarvesterService.name);
  private isRunning = false;

  constructor(
    private prisma: PrismaService,
    private elasticsearchService: ElasticsearchService,
  ) {}

  onModuleInit() {
    if (process.env.HARVESTER_ENABLED === 'false') return;
    const pollMinutes = parseInt(process.env.HARVESTER_POLL_MINUTES || '5', 10);
    this.logger.log(`Cosechador de noticias activo (poll cada ${pollMinutes} min)`);
    setTimeout(() => this.pollDueSources(), 30_000).unref();
    setInterval(() => this.pollDueSources(), pollMinutes * 60_000).unref();
  }

  // ==================== FUENTES (CRUD) ====================

  async findAllSources() {
    return this.prisma.newsSource.findMany({
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createSource(dto: CreateNewsSourceDto) {
    const feedUrl = dto.feedUrl.trim();
    if (!/^https?:\/\//i.test(feedUrl)) {
      throw new BadRequestException('feedUrl debe ser una URL http(s)');
    }
    const existing = await this.prisma.newsSource.findUnique({ where: { feedUrl } });
    if (existing) {
      throw new BadRequestException('Ya existe una fuente con ese feed URL');
    }
    return this.prisma.newsSource.create({
      data: {
        name: dto.name.trim(),
        feedUrl,
        websiteUrl: dto.websiteUrl?.trim(),
        categoryId: dto.categoryId,
        fetchIntervalMinutes: dto.fetchIntervalMinutes ?? 60,
        maxItemsPerRun: dto.maxItemsPerRun ?? 5,
        autoPublish: dto.autoPublish ?? false,
        enabled: dto.enabled ?? true,
      },
    });
  }

  async updateSource(id: string, dto: UpdateNewsSourceDto) {
    const source = await this.prisma.newsSource.findUnique({ where: { id } });
    if (!source) throw new NotFoundException('Fuente no encontrada');
    return this.prisma.newsSource.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        feedUrl: dto.feedUrl?.trim(),
        websiteUrl: dto.websiteUrl?.trim(),
        categoryId: dto.categoryId,
        fetchIntervalMinutes: dto.fetchIntervalMinutes,
        maxItemsPerRun: dto.maxItemsPerRun,
        autoPublish: dto.autoPublish,
        enabled: dto.enabled,
      },
    });
  }

  async removeSource(id: string) {
    const source = await this.prisma.newsSource.findUnique({ where: { id } });
    if (!source) throw new NotFoundException('Fuente no encontrada');
    await this.prisma.newsSource.delete({ where: { id } });
    return { id };
  }

  async getLogs(limit: number = 20) {
    return this.prisma.harvestLog.findMany({
      orderBy: { startedAt: 'desc' },
      take: Math.min(limit, 100),
    });
  }

  // ==================== COSECHA ====================

  async runAll(): Promise<Record<string, unknown>> {
    const sources = await this.prisma.newsSource.findMany({ where: { enabled: true } });
    const results: unknown[] = [];
    for (const source of sources) {
      results.push(await this.runSource(source.id));
    }
    return { sourcesProcessed: results.length, results };
  }

  async runSource(sourceId: string, opts?: { force?: boolean }) {
    const source = await this.prisma.newsSource.findUnique({
      where: { id: sourceId },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });
    if (!source) throw new NotFoundException('Fuente no encontrada');
    if (!source.enabled && !opts?.force) {
      return { sourceId, skipped: true, reason: 'disabled' };
    }

    const log = await this.prisma.harvestLog.create({
      data: { sourceId: source.id, sourceName: source.name, status: 'RUNNING' },
    });

    let itemsFound = 0;
    let itemsImported = 0;
    let itemsSkipped = 0;

    try {
      const parser = new Parser({
        headers: {
          'User-Agent': 'DiarioNoticiaHarvester/1.0 (+diario-noticia)',
        },
        timeout: 20_000,
        maxRedirects: 5,
      });

      const feed = await parser.parseURL(source.feedUrl);
      itemsFound = feed.items?.length || 0;
      const items = (feed.items || []).slice(0, source.maxItemsPerRun);

      for (const item of items) {
        const link = item.link?.trim();
        if (!link) {
          itemsSkipped++;
          continue;
        }
        if (await this.existsBySource(link)) {
          itemsSkipped++;
          continue;
        }
        try {
          await this.importItem(source, item);
          itemsImported++;
        } catch (err: any) {
          itemsSkipped++;
          this.logger.warn(`Fallo al importar ${link}: ${err?.message}`);
        }
      }

      await this.prisma.newsSource.update({
        where: { id: source.id },
        data: { lastFetchedAt: new Date() },
      });
      await this.prisma.harvestLog.update({
        where: { id: log.id },
        data: { status: 'SUCCESS', itemsFound, itemsImported, itemsSkipped, finishedAt: new Date() },
      });

      return { sourceId: source.id, itemsFound, itemsImported, itemsSkipped };
    } catch (err: any) {
      await this.prisma.harvestLog.update({
        where: { id: log.id },
        data: {
          status: 'FAILED',
          itemsFound,
          itemsImported,
          itemsSkipped,
          error: (err?.message || 'Error desconocido').substring(0, 500),
          finishedAt: new Date(),
        },
      });
      throw err;
    }
  }

  async testSource(sourceId: string) {
    const source = await this.prisma.newsSource.findUnique({ where: { id: sourceId } });
    if (!source) throw new NotFoundException('Fuente no encontrada');
    try {
      const parser = new Parser({
        headers: { 'User-Agent': 'DiarioNoticiaHarvester/1.0 (+diario-noticia)' },
        timeout: 20_000,
        maxRedirects: 5,
      });
      const feed = await parser.parseURL(source.feedUrl);
      return {
        ok: true,
        feedTitle: feed.title || source.name,
        totalItems: feed.items?.length || 0,
        sample: (feed.items || [])
          .slice(0, 5)
          .map((i) => ({ title: i.title, link: i.link, pubDate: i.isoDate || i.pubDate })),
      };
    } catch (err: any) {
      return { ok: false, error: (err?.message || 'Error al leer el feed').substring(0, 300) };
    }
  }

  // ==================== IMPORTACIÓN DE ITEMS ====================

  private async importItem(source: any, item: Parser.Item) {
    const link = (item.link || '').trim();
    const rawContent = this.extractRawContent(item);
    const plainText = this.stripHtml(rawContent).trim();
    const baseTitle = (item.title || '').trim();
    if (!baseTitle && !plainText) {
      throw new Error('Ítem vacío (sin título ni contenido)');
    }

    const enriched = await this.enrichItem({
      title: baseTitle,
      content: plainText.substring(0, 4000),
      link,
    });

    const title = enriched?.title?.trim() || baseTitle || 'Sin título';
    const subtitle = enriched?.subtitle?.trim() || undefined;
    const excerpt =
      enriched?.excerpt?.trim() || plainText.substring(0, 200).trim() || subtitle || title;

    const categoryId = await this.resolveCategoryId(enriched?.category || null, source.categoryId);
    const author = await this.getBotAuthor();
    const slug = await this.makeUniqueSlug(title);

    const paragraphs = plainText
      .split(/\n{2,}|\r?\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0)
      .slice(0, 60);

    const status: ArticleStatus = source.autoPublish ? 'PUBLISHED' : 'IN_REVIEW';

    const article = await this.prisma.article.create({
      data: {
        title,
        slug,
        subtitle,
        excerpt,
        content: this.buildTipTapContent(paragraphs),
        sourceUrl: link || null,
        sourceName: source.name,
        canonicalUrl: link || null,
        status,
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
        authorId: author.id,
        categoryId,
        readTimeMinutes: Math.max(1, Math.ceil(plainText.length / 800)),
      },
    });

    if (enriched?.tags?.length) {
      const tagIds: string[] = [];
      for (const rawTag of enriched.tags.slice(0, 5)) {
        const name = rawTag.trim();
        if (!name) continue;
        const slug = generateSlug(name);
        if (!slug) continue;
        const tag = await this.prisma.tag.upsert({
          where: { slug },
          update: {},
          create: { name: name.substring(0, 100), slug },
        });
        tagIds.push(tag.id);
      }
      if (tagIds.length > 0) {
        await this.prisma.article.update({
          where: { id: article.id },
          data: { tags: { connect: tagIds.map((id) => ({ id })) } },
        });
      }
    }

    if (status === 'PUBLISHED') {
      await this.indexInEs(article.id);
    }

    await this.prisma.newsSource.update({
      where: { id: source.id },
      data: { lastItemAt: new Date() },
    });

    return article;
  }

  private extractRawContent(item: any): string {
    const candidates = [
      item['content:encoded'],
      item.content,
      item.summary,
      item.contentSnippet,
      item.description,
    ];
    return candidates.find((c) => c && String(c).trim().length > 40) || candidates.find((c) => c) || '';
  }

  private stripHtml(html: string): string {
    if (!html) return '';
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<\/(p|div|li|h[1-6]|section|article|blockquote|tr|br)>/gi, '\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#0?39;/gi, "'")
      .replace(/[ \t]+/g, ' ')
      .replace(/\n[ \t]+/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  private buildTipTapContent(paragraphs: string[]) {
    return {
      type: 'doc',
      content: paragraphs.map((text) => ({
        type: 'paragraph',
        content: [{ type: 'text', text }],
      })),
    };
  }

  private tiptapToText(content: any): string {
    if (!content?.content) return '';
    return content.content
      .map((node: any) =>
        node.content
          ? node.content.map((inline: any) => inline.text || '').join('')
          : '',
      )
      .join(' ');
  }

  private async makeUniqueSlug(title: string): Promise<string> {
    const base = generateSlug(title) || `articulo-${Date.now()}`;
    let slug = base;
    let counter = 1;
    while (await this.prisma.article.findUnique({ where: { slug } })) {
      slug = `${base}-${counter++}`;
    }
    return slug;
  }

  private async existsBySource(url: string): Promise<boolean> {
    if (!url) return false;
    return Boolean(await this.prisma.article.findUnique({ where: { sourceUrl: url } }));
  }

  private async getBotAuthor(): Promise<{ id: string }> {
    const email = process.env.HARVESTER_BOT_EMAIL || 'harvester@diario-noticia.local';
    let user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      const role =
        (await this.prisma.role.findFirst({
          where: { name: { in: ['EDITOR', 'AUTHOR', 'JOURNALIST'] } },
        })) ||
        (await this.prisma.role.findFirst({ where: { name: 'EDITOR' } }));
      if (!role) {
        throw new Error('No hay un rol disponible para el usuario cosechador');
      }
      user = await this.prisma.user.create({
        data: {
          email,
          firstName: 'Cosechador',
          lastName: 'Automático',
          roleId: role.id,
          isActive: true,
        },
      });
    }
    return { id: user.id };
  }

  private async resolveCategoryId(
    suggestedName: string | null,
    defaultCategoryId: string | null,
  ): Promise<string | null> {
    if (defaultCategoryId) {
      const exists = await this.prisma.category.findUnique({ where: { id: defaultCategoryId } });
      if (exists) return exists.id;
    }
    if (suggestedName) {
      const slug = generateSlug(suggestedName);
      const match = await this.prisma.category.findFirst({
        where: {
          isActive: true,
          OR: [
            { name: { equals: suggestedName, mode: 'insensitive' } },
            { slug: { equals: slug, mode: 'insensitive' } },
          ],
        },
      });
      if (match) return match.id;
    }
    return null;
  }

  private async indexInEs(articleId: string) {
    try {
      const article = await this.prisma.article.findUnique({
        where: { id: articleId },
        include: {
          author: { select: { firstName: true, lastName: true } },
          category: { select: { slug: true } },
          tags: { select: { slug: true } },
        },
      });
      if (!article || article.status !== 'PUBLISHED' || !article.publishedAt) return;
      await this.elasticsearchService.indexDocument(ARTICLE_INDEX, article.id, {
        title: article.title,
        subtitle: article.subtitle,
        bajada: article.bajada,
        copete: article.copete,
        excerpt: article.excerpt,
        content: this.tiptapToText(article.content),
        slug: article.slug,
        categoryId: article.categoryId,
        categorySlug: article.category?.slug,
        subcategoryId: article.subcategoryId,
        authorId: article.authorId,
        authorName: `${article.author?.firstName || ''} ${article.author?.lastName || ''}`.trim(),
        tagSlugs: (article.tags || []).map((t: any) => t.slug),
        status: article.status,
        isFeatured: article.isFeatured,
        isSticky: article.isSticky,
        publishedAt: article.publishedAt,
        viewCount: article.viewCount,
      });
    } catch (err: any) {
      this.logger.warn(`Fallo al indexar en ES ${articleId}: ${err?.message}`);
    }
  }

  // ==================== IA (opcional, usa OPENAI_API_KEY de env) ====================

  private async getApiKey(): Promise<string | null> {
    if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY;
    const setting = await this.prisma.systemConfig.findUnique({ where: { key: 'openaiApiKey' } });
    return setting ? String(setting.value) : null;
  }

  private async getModel(): Promise<string> {
    if (process.env.OPENAI_MODEL) return process.env.OPENAI_MODEL;
    const setting = await this.prisma.systemConfig.findUnique({ where: { key: 'openaiModel' } });
    return setting ? String(setting.value) : 'gpt-4';
  }

  private async enrichItem(raw: RawItem): Promise<EnrichedItem | null> {
    const apiKey = await this.getApiKey();
    if (!apiKey) return null;

    try {
      const openai = new OpenAI({ apiKey });
      const completion = await openai.chat.completions.create({
        model: await this.getModel(),
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'Eres un editor de un diario digital. Recibes una noticia cruda de una agencia o feed externo. ' +
              'Reescribe el titular para el estilo del diario (objetivo, informativo, sin clickbait), ' +
              'crea un subtítulo de 1 línea, un resumen de máximo 180 caracteres, sugiere 3-6 etiquetas ' +
              'y la categoría más probable de esta lista: Política, Economía, Deportes, Cultura, Tecnología, ' +
              'Ciencia, Internacional, Sociedad, Espectáculos, Salud. ' +
              'Responde SOLO con JSON válido con las claves: title, subtitle, excerpt, tags (array de strings), category (string).',
          },
          {
            role: 'user',
            content: `Titular original: ${raw.title}\n\nContenido:\n${raw.content}`,
          },
        ],
        temperature: 0.4,
        max_tokens: 700,
      });

      const text = completion.choices[0]?.message?.content || '{}';
      const parsed = JSON.parse(text);
      return {
        title: typeof parsed.title === 'string' ? parsed.title : undefined,
        subtitle: typeof parsed.subtitle === 'string' ? parsed.subtitle : undefined,
        excerpt: typeof parsed.excerpt === 'string' ? parsed.excerpt : undefined,
        tags: Array.isArray(parsed.tags) ? parsed.tags.map(String) : [],
        category: typeof parsed.category === 'string' ? parsed.category : null,
      };
    } catch (err: any) {
      this.logger.warn(`IA de cosecha no disponible: ${err?.message}`);
      return null;
    }
  }

  // ==================== SCHEDULER ====================

  private async pollDueSources() {
    if (this.isRunning) return;
    this.isRunning = true;
    try {
      const sources = await this.prisma.newsSource.findMany({ where: { enabled: true } });
      const now = Date.now();
      for (const source of sources) {
        const due =
          !source.lastFetchedAt ||
          now - source.lastFetchedAt.getTime() >= source.fetchIntervalMinutes * 60_000;
        if (due) {
          try {
            await this.runSource(source.id);
          } catch (err: any) {
            this.logger.error(`Fuente "${source.name}": ${err?.message}`);
          }
        }
      }
    } finally {
      this.isRunning = false;
    }
  }
}
