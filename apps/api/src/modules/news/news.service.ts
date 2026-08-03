import { Injectable, NotFoundException, ConflictException, ForbiddenException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { QueryNewsDto } from './dto/query-news.dto';
import { generateSlug } from '../../common/helpers/slug.helper';
import { ArticleStatus } from '@prisma/client';
import { ElasticsearchService } from '../../common/elasticsearch/elasticsearch.service';

const ARTICLE_INDEX = 'articles';

const ARTICLE_MAPPINGS = {
  properties: {
    title: { type: 'text' },
    subtitle: { type: 'text' },
    bajada: { type: 'text' },
    copete: { type: 'text' },
    excerpt: { type: 'text' },
    content: { type: 'text' },
    slug: { type: 'keyword' },
    categoryId: { type: 'keyword' },
    categorySlug: { type: 'keyword' },
    subcategoryId: { type: 'keyword' },
    authorId: { type: 'keyword' },
    authorName: { type: 'text' },
    tagSlugs: { type: 'keyword' },
    status: { type: 'keyword' },
    isFeatured: { type: 'boolean' },
    isSticky: { type: 'boolean' },
    publishedAt: { type: 'date' },
    viewCount: { type: 'integer' },
  },
};

@Injectable()
export class NewsService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private elasticsearchService: ElasticsearchService,
  ) {}

  async onModuleInit() {
    await this.elasticsearchService.createIndex(ARTICLE_INDEX, ARTICLE_MAPPINGS);
  }

  async reindex() {
    const articles = await this.prisma.article.findMany({
      where: { status: 'PUBLISHED', publishedAt: { not: null } },
      include: {
        author: { select: { firstName: true, lastName: true } },
        category: { select: { slug: true } },
        tags: { select: { slug: true } },
      },
    });

    const documents = articles.map((a) => ({
      id: a.id,
      body: this.buildDocument(a),
    }));

    return this.elasticsearchService.bulkIndex(ARTICLE_INDEX, documents);
  }

  async create(dto: CreateNewsDto, authorId: string) {
    const slug = dto.slug || generateSlug(dto.title);

    const existing = await this.prisma.article.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new ConflictException('Article with this slug already exists');
    }

    const readTimeMinutes = this.calculateReadTime(dto.content);

    const article = await this.prisma.article.create({
      data: {
        title: dto.title,
        slug,
        subtitle: dto.subtitle,
        bajada: dto.bajada,
        copete: dto.copete,
        content: dto.content,
        excerpt: this.generateExcerpt(dto.content),
        metaTitle: dto.metaTitle,
        metaDescription: dto.metaDescription,
        canonicalUrl: dto.canonicalUrl,
        ogImage: dto.ogImage,
        status: (dto.status as ArticleStatus) || ArticleStatus.DRAFT,
        publishedAt: dto.status === 'PUBLISHED' ? new Date() : null,
        isFeatured: dto.isFeatured || false,
        isSticky: dto.isSticky || false,
        allowComments: dto.allowComments ?? true,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        priority: dto.priority || 0,
        readTimeMinutes,
        authorId,
        categoryId: dto.categoryId,
        subcategoryId: dto.subcategoryId,
      },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
        category: true,
        subcategory: true,
        tags: true,
      },
    });

    if (dto.tags && dto.tags.length > 0) {
      const tags = await this.connectOrCreateTags(dto.tags);
      await this.prisma.article.update({
        where: { id: article.id },
        data: {
          tags: { connect: tags.map((t) => ({ id: t.id })) },
        },
      });
    }

    if (dto.relatedArticleIds && dto.relatedArticleIds.length > 0) {
      await this.prisma.articleRelation.createMany({
        data: dto.relatedArticleIds.map((relatedId) => ({
          baseArticleId: article.id,
          relatedArticleId: relatedId,
        })),
      });
    }

    const indexable = await this.getIndexableArticle(article.id);
    await this.indexArticle(indexable);

    return this.findOne(article.id);
  }

  async findAll(query: QueryNewsDto, includeDrafts: boolean = false) {
    const {
      search,
      categoryId,
      subcategoryId,
      tag,
      authorId,
      status,
      isFeatured,
      isSticky,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 12,
    } = query;

    const where: any = {};

    if (!includeDrafts) {
      where.status = 'PUBLISHED';
      where.publishedAt = { not: null };
    } else if (status) {
      where.status = status;
    }

    if (categoryId) where.categoryId = categoryId;
    if (subcategoryId) where.subcategoryId = subcategoryId;
    if (authorId) where.authorId = authorId;
    if (isFeatured !== undefined) where.isFeatured = isFeatured;
    if (isSticky !== undefined) where.isSticky = isSticky;

    if (tag) {
      where.tags = {
        some: {
          slug: tag,
        },
      };
    }

    const include = {
      author: {
        select: { id: true, firstName: true, lastName: true, avatar: true },
      },
      category: {
        select: { id: true, name: true, slug: true, color: true },
      },
      subcategory: {
        select: { id: true, name: true, slug: true },
      },
      tags: {
        select: { id: true, name: true, slug: true },
      },
      _count: {
        select: { comments: true },
      },
    };

    if (search) {
      const esResult = await this.elasticsearchService.search({
        index: ARTICLE_INDEX,
        query: search,
        fields: ['title^3', 'subtitle^2', 'bajada^1.5', 'copete', 'excerpt', 'content'],
        from: (page - 1) * limit,
        size: limit,
      });

      if (esResult.total > 0) {
        const ids = esResult.hits.map((hit) => hit.id);
        const articles = await this.prisma.article.findMany({
          where: { ...where, id: { in: ids } },
          include,
        });

        const byId = new Map(articles.map((a) => [a.id, a]));
        const data = esResult.hits
          .map((hit) => byId.get(hit.id))
          .filter((a): a is NonNullable<typeof a> => Boolean(a));

        return {
          data,
          meta: {
            total: esResult.total,
            page,
            limit,
            totalPages: Math.ceil(esResult.total / limit),
          },
        };
      }

      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { subtitle: { contains: search, mode: 'insensitive' } },
        { bajada: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [articles, total] = await Promise.all([
      this.prisma.article.findMany({
        where,
        include,
        orderBy: [
          { isSticky: 'desc' },
          { isFeatured: 'desc' },
          { [sortBy]: sortOrder },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.article.count({ where }),
    ]);

    return {
      data: articles,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findFeatured(limit: number = 5) {
    return this.prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        isFeatured: true,
        publishedAt: { not: null },
      },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
        category: {
          select: { id: true, name: true, slug: true, color: true },
        },
        tags: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });
  }

  async findLatest(limit: number = 10) {
    return this.prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        publishedAt: { not: null },
      },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
        category: {
          select: { id: true, name: true, slug: true, color: true },
        },
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });
  }

  async findMostRead(limit: number = 10) {
    return this.prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        publishedAt: { not: null },
      },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
        category: {
          select: { id: true, name: true, slug: true, color: true },
        },
      },
      orderBy: { viewCount: 'desc' },
      take: limit,
    });
  }

  async findOne(id: string) {
    const article = await this.prisma.article.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, avatar: true, bio: true },
        },
        category: true,
        subcategory: true,
        tags: true,
        media: true,
        comments: {
          where: { status: 'APPROVED', parentId: null },
          include: {
            author: {
              select: { id: true, firstName: true, lastName: true, avatar: true },
            },
            replies: {
              where: { status: 'APPROVED' },
              include: {
                author: {
                  select: { id: true, firstName: true, lastName: true, avatar: true },
                },
              },
              orderBy: { createdAt: 'asc' },
            },
            _count: {
              select: { likes: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        relatedTo: {
          include: {
            relatedArticle: {
              select: {
                id: true,
                title: true,
                slug: true,
                ogImage: true,
                publishedAt: true,
                category: {
                  select: { id: true, name: true, slug: true },
                },
              },
            },
          },
        },
        _count: {
          select: { comments: true },
        },
      },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    await this.prisma.article.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return article;
  }

  async findBySlug(slug: string) {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, avatar: true, bio: true },
        },
        category: true,
        subcategory: true,
        tags: true,
        media: true,
        comments: {
          where: { status: 'APPROVED', parentId: null },
          include: {
            author: {
              select: { id: true, firstName: true, lastName: true, avatar: true },
            },
            replies: {
              where: { status: 'APPROVED' },
              include: {
                author: {
                  select: { id: true, firstName: true, lastName: true, avatar: true },
                },
              },
              orderBy: { createdAt: 'asc' },
            },
            _count: {
              select: { likes: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        relatedTo: {
          include: {
            relatedArticle: {
              select: {
                id: true,
                title: true,
                slug: true,
                ogImage: true,
                publishedAt: true,
                category: {
                  select: { id: true, name: true, slug: true },
                },
              },
            },
          },
        },
        _count: {
          select: { comments: true },
        },
      },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    await this.prisma.article.update({
      where: { slug },
      data: { viewCount: { increment: 1 } },
    });

    return article;
  }

  async update(id: string, dto: UpdateNewsDto, userId: string, userRole: string) {
    const article = await this.prisma.article.findUnique({
      where: { id },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (article.authorId !== userId && !['ADMIN', 'EDITOR_GENERAL', 'EDITOR'].includes(userRole)) {
      throw new ForbiddenException('You can only edit your own articles');
    }

    let slug = dto.slug;
    if (dto.title && dto.title !== article.title && !dto.slug) {
      slug = generateSlug(dto.title);
    }

    if (slug && slug !== article.slug) {
      const existing = await this.prisma.article.findUnique({
        where: { slug },
      });

      if (existing) {
        throw new ConflictException('Article with this slug already exists');
      }
    }

    let readTimeMinutes = article.readTimeMinutes;
    if (dto.content) {
      readTimeMinutes = this.calculateReadTime(dto.content);
    }

    const updated = await this.prisma.article.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(slug && { slug }),
        ...(dto.subtitle !== undefined && { subtitle: dto.subtitle }),
        ...(dto.bajada !== undefined && { bajada: dto.bajada }),
        ...(dto.copete !== undefined && { copete: dto.copete }),
        ...(dto.content && {
          content: dto.content,
          excerpt: this.generateExcerpt(dto.content),
          readTimeMinutes,
        }),
        ...(dto.metaTitle !== undefined && { metaTitle: dto.metaTitle }),
        ...(dto.metaDescription !== undefined && { metaDescription: dto.metaDescription }),
        ...(dto.canonicalUrl !== undefined && { canonicalUrl: dto.canonicalUrl }),
        ...(dto.ogImage !== undefined && { ogImage: dto.ogImage }),
        ...(dto.status && { status: dto.status as ArticleStatus }),
        ...(dto.isFeatured !== undefined && { isFeatured: dto.isFeatured }),
        ...(dto.isSticky !== undefined && { isSticky: dto.isSticky }),
        ...(dto.allowComments !== undefined && { allowComments: dto.allowComments }),
        ...(dto.scheduledAt && { scheduledAt: new Date(dto.scheduledAt) }),
        ...(dto.expiresAt !== undefined && { expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null }),
        ...(dto.priority !== undefined && { priority: dto.priority }),
      },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
        category: true,
        subcategory: true,
        tags: true,
      },
    });

    if (dto.tags !== undefined) {
      await this.prisma.article.update({
        where: { id },
        data: {
          tags: { set: [] },
        },
      });

      if (dto.tags.length > 0) {
        const tags = await this.connectOrCreateTags(dto.tags);
        await this.prisma.article.update({
          where: { id },
          data: {
            tags: { connect: tags.map((t) => ({ id: t.id })) },
          },
        });
      }
    }

    if (dto.relatedArticleIds !== undefined) {
      await this.prisma.articleRelation.deleteMany({
        where: { baseArticleId: id },
      });

      if (dto.relatedArticleIds.length > 0) {
        await this.prisma.articleRelation.createMany({
          data: dto.relatedArticleIds.map((relatedId) => ({
            baseArticleId: id,
            relatedArticleId: relatedId,
          })),
        });
      }
    }

    const indexable = await this.getIndexableArticle(id);
    await this.indexArticle(indexable);

    return this.findOne(id);
  }

  async publish(id: string, userId: string, userRole: string) {
    const article = await this.prisma.article.findUnique({
      where: { id },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (!['ADMIN', 'EDITOR_GENERAL', 'EDITOR'].includes(userRole)) {
      throw new ForbiddenException('You do not have permission to publish articles');
    }

    const published = await this.prisma.article.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
        category: true,
        tags: true,
      },
    });

    await this.indexArticle(published);

    return published;
  }

  async remove(id: string, userId: string, userRole: string) {
    const article = await this.prisma.article.findUnique({
      where: { id },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (article.authorId !== userId && !['ADMIN', 'EDITOR_GENERAL'].includes(userRole)) {
      throw new ForbiddenException('You do not have permission to delete this article');
    }

    const archived = await this.prisma.article.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });

    await this.elasticsearchService.deleteDocument(ARTICLE_INDEX, id);

    return archived;
  }

  async getRelated(id: string, limit: number = 5) {
    const article = await this.prisma.article.findUnique({
      where: { id },
      include: {
        tags: { select: { id: true } },
        category: { select: { id: true } },
      },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const related = await this.prisma.article.findMany({
      where: {
        id: { not: id },
        status: 'PUBLISHED',
        OR: [
          { categoryId: article.categoryId },
          { tags: { some: { id: { in: article.tags.map((t) => t.id) } } } },
        ],
      },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
        category: {
          select: { id: true, name: true, slug: true, color: true },
        },
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });

    return related;
  }

  private async connectOrCreateTags(tagNames: string[]) {
    return Promise.all(
      tagNames.map(async (name) => {
        const slug = generateSlug(name);
        return this.prisma.tag.upsert({
          where: { slug },
          update: {},
          create: { name, slug },
        });
      }),
    );
  }

  private calculateReadTime(content: any): number {
    if (!content || !content.content) return 1;

    const text = this.extractTextFromContent(content);
    const wordCount = text.split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / 200));
  }

  private extractTextFromContent(content: any): string {
    if (!content || !content.content) return '';

    return content.content
      .map((node: any) => {
        if (node.content) {
          return this.extractTextFromContent(node);
        }
        if (node.type === 'text') {
          return node.text || '';
        }
        return '';
      })
      .join(' ');
  }

  private generateExcerpt(content: any): string {
    const text = this.extractTextFromContent(content);
    return text.substring(0, 200).trim() + (text.length > 200 ? '...' : '');
  }

  private async getIndexableArticle(id: string) {
    return this.prisma.article.findUnique({
      where: { id },
      include: {
        author: { select: { firstName: true, lastName: true } },
        category: { select: { slug: true } },
        tags: { select: { slug: true } },
      },
    });
  }

  private buildDocument(article: any) {
    return {
      title: article.title,
      subtitle: article.subtitle,
      bajada: article.bajada,
      copete: article.copete,
      excerpt: article.excerpt,
      content: this.extractTextFromContent(article.content),
      slug: article.slug,
      categoryId: article.categoryId,
      categorySlug: article.category?.slug,
      subcategoryId: article.subcategoryId,
      authorId: article.authorId,
      authorName: article.author
        ? `${article.author.firstName || ''} ${article.author.lastName || ''}`.trim()
        : undefined,
      tagSlugs: (article.tags || []).map((t: any) => t.slug),
      status: article.status,
      isFeatured: article.isFeatured,
      isSticky: article.isSticky,
      publishedAt: article.publishedAt,
      viewCount: article.viewCount,
    };
  }

  private async indexArticle(article: any) {
    if (!article || article.status !== 'PUBLISHED' || !article.publishedAt) return;
    await this.elasticsearchService.indexDocument(
      ARTICLE_INDEX,
      article.id,
      this.buildDocument(article),
    );
  }
}
