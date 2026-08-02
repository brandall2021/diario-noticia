import { ConflictException } from '@nestjs/common';
import { NewsService } from './news.service';

describe('NewsService', () => {
  let service: NewsService;
  let prisma: any;
  let es: any;

  const createdArticle = {
    id: 'article-1',
    title: 'Mi noticia de prueba',
    slug: 'mi-noticia-de-prueba',
    subtitle: 'Subtítulo',
    bajada: 'Bajada',
    status: 'PUBLISHED',
    publishedAt: new Date('2026-07-01T10:00:00Z'),
    content: {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'hola mundo de prueba' }] }],
    },
    excerpt: 'hola mundo de prueba',
    categoryId: 'cat-1',
    authorId: 'user-1',
    isFeatured: false,
    isSticky: false,
    viewCount: 0,
    author: { firstName: 'Admin', lastName: 'User' },
    category: { slug: 'politica' },
    tags: [],
  };

  const noConflictFindUnique = () =>
    jest.fn().mockImplementation(({ where }: any) => {
      if (where.slug) return Promise.resolve(null);
      return Promise.resolve(createdArticle);
    });

  beforeEach(() => {
    prisma = {
      article: {
        findUnique: noConflictFindUnique(),
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn().mockResolvedValue(createdArticle),
        update: jest.fn().mockResolvedValue(createdArticle),
      },
      articleRelation: {
        createMany: jest.fn().mockResolvedValue({ count: 0 }),
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
      tag: {
        upsert: jest.fn().mockImplementation(({ create }: any) => Promise.resolve({ id: 't1', ...create })),
      },
    };

    es = {
      createIndex: jest.fn().mockResolvedValue(true),
      indexDocument: jest.fn().mockResolvedValue(true),
      deleteDocument: jest.fn().mockResolvedValue(true),
      bulkIndex: jest.fn().mockResolvedValue({ success: 1, failed: 0 }),
      search: jest.fn().mockResolvedValue({ hits: [], total: 0, maxScore: 0, took: 0 }),
    };

    service = new NewsService(prisma, es);
  });

  describe('create', () => {
    it('throws ConflictException when the slug already exists', async () => {
      prisma.article.findUnique = jest
        .fn()
        .mockImplementation(({ where }: any) =>
          where.slug ? Promise.resolve(createdArticle) : Promise.resolve(null),
        );

      await expect(
        service.create(
          { title: 'Mi noticia de prueba', slug: 'mi-noticia-de-prueba' } as any,
          'user-1',
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('creates an article and indexes it in Elasticsearch', async () => {
      const result = await service.create(
        {
          title: 'Mi noticia de prueba',
          subtitle: 'Subtítulo',
          content: createdArticle.content,
          categoryId: 'cat-1',
        } as any,
        'user-1',
      );

      expect(prisma.article.create).toHaveBeenCalled();
      expect(es.indexDocument).toHaveBeenCalledWith(
        'articles',
        'article-1',
        expect.objectContaining({
          title: 'Mi noticia de prueba',
          status: 'PUBLISHED',
          categorySlug: 'politica',
        }),
      );
      expect(result.id).toBe('article-1');
    });

    it('does not index drafts', async () => {
      prisma.article.create = jest.fn().mockResolvedValue({
        ...createdArticle,
        status: 'DRAFT',
        publishedAt: null,
      });
      prisma.article.findUnique = jest
        .fn()
        .mockImplementation(({ where }: any) => {
          if (where.slug) return Promise.resolve(null);
          return Promise.resolve({ ...createdArticle, status: 'DRAFT', publishedAt: null });
        });

      await service.create({ title: 'Borrador sin publicar' } as any, 'user-1');

      expect(es.indexDocument).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('uses Prisma when there is no search term', async () => {
      await service.findAll({} as any);

      expect(es.search).not.toHaveBeenCalled();
      expect(prisma.article.findMany).toHaveBeenCalled();
      expect(prisma.article.count).toHaveBeenCalled();
    });

    it('returns ES results ordered by relevance when search matches', async () => {
      const a2 = { ...createdArticle, id: 'a2', title: 'Segunda' };
      const a1 = { ...createdArticle, id: 'a1', title: 'Primera' };
      es.search.mockResolvedValue({
        hits: [{ id: 'a1', score: 2 }, { id: 'a2', score: 1 }],
        total: 2,
        maxScore: 2,
        took: 3,
      });
      prisma.article.findMany = jest.fn().mockResolvedValue([a2, a1]);

      const result = await service.findAll({ search: 'noticia' } as any);

      expect(es.search).toHaveBeenCalledWith(
        expect.objectContaining({ index: 'articles', query: 'noticia' }),
      );
      expect(prisma.article.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ id: { in: ['a1', 'a2'] } }) }),
      );
      expect(result.data.map((a: any) => a.id)).toEqual(['a1', 'a2']);
      expect(result.meta.total).toBe(2);
    });

    it('falls back to Prisma contains search when ES has no matches', async () => {
      es.search.mockResolvedValue({ hits: [], total: 0, maxScore: 0, took: 0 });

      await service.findAll({ search: 'inflacion' } as any);

      expect(prisma.article.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { title: { contains: 'inflacion', mode: 'insensitive' } },
              { subtitle: { contains: 'inflacion', mode: 'insensitive' } },
              { bajada: { contains: 'inflacion', mode: 'insensitive' } },
            ],
          }),
        }),
      );
    });
  });

  describe('reindex', () => {
    it('bulk indexes all published articles', async () => {
      prisma.article.findMany = jest.fn().mockResolvedValue([createdArticle, { ...createdArticle, id: 'a2' }]);

      const result = await service.reindex();

      expect(es.bulkIndex).toHaveBeenCalledWith(
        'articles',
        expect.arrayContaining([
          expect.objectContaining({ id: 'article-1' }),
        ]),
      );
      expect(result).toEqual({ success: 1, failed: 0 });
    });
  });

  describe('remove', () => {
    it('archives the article and deletes it from Elasticsearch', async () => {
      prisma.article.findUnique = jest.fn().mockImplementation(({ where }: any) => {
        if (where.slug) return Promise.resolve(null);
        return Promise.resolve(createdArticle);
      });

      await service.remove('article-1', 'user-1', 'ADMIN');

      expect(prisma.article.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ status: 'ARCHIVED' }) }),
      );
      expect(es.deleteDocument).toHaveBeenCalledWith('articles', 'article-1');
    });
  });
});
