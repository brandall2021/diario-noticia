import { BadRequestException, NotFoundException } from '@nestjs/common';
import { HarvesterService } from './harvester.service';

describe('HarvesterService', () => {
  let service: HarvesterService;
  let prisma: any;
  let es: any;

  const source = {
    id: 'src-1',
    name: 'BBC Mundo',
    feedUrl: 'https://feeds.bbci.co.uk/mundo/rss.xml',
    categoryId: null,
    fetchIntervalMinutes: 60,
    maxItemsPerRun: 5,
    autoPublish: false,
    enabled: true,
  };

  const item = {
    title: 'Titular de ejemplo',
    link: 'https://example.com/articulo-1',
    content: '<p>Primer párrafo de la noticia.</p><p>Segundo párrafo con más detalle.</p>',
  };

  beforeEach(() => {
    prisma = {
      newsSource: {
        findUnique: jest.fn().mockResolvedValue(source),
        findMany: jest.fn().mockResolvedValue([]),
        create: jest.fn().mockResolvedValue(source),
        update: jest.fn().mockResolvedValue(source),
        delete: jest.fn().mockResolvedValue(source),
      },
      harvestLog: {
        create: jest.fn().mockResolvedValue({ id: 'log-1' }),
        update: jest.fn().mockResolvedValue({ id: 'log-1' }),
        findMany: jest.fn().mockResolvedValue([]),
      },
      article: {
        findUnique: jest.fn().mockImplementation(({ where }: any) => {
          if (where.slug) return Promise.resolve(null);
          return Promise.resolve(null);
        }),
        create: jest.fn().mockImplementation(({ data }: any) =>
          Promise.resolve({ id: 'a1', ...data }),
        ),
        update: jest.fn().mockImplementation(({ data }: any) => Promise.resolve({ id: 'a1', ...data })),
      },
      user: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'bot-1' }),
      },
      role: {
        findFirst: jest.fn().mockResolvedValue({ id: 'role-1' }),
      },
      category: {
        findUnique: jest.fn().mockResolvedValue(null),
        findFirst: jest.fn().mockResolvedValue(null),
      },
      tag: {
        upsert: jest.fn().mockImplementation(({ create }: any) =>
          Promise.resolve({ id: 't1', ...create }),
        ),
      },
      systemConfig: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
    };

    es = {
      indexDocument: jest.fn().mockResolvedValue(true),
    };

    service = new HarvesterService(prisma, es);
  });

  describe('createSource', () => {
    it('rejects feed URLs that are not http(s)', async () => {
      await expect(
        service.createSource({ name: 'x', feedUrl: 'ftp://nope' } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects duplicate feed URLs', async () => {
      prisma.newsSource.findUnique = jest.fn().mockResolvedValue(source);
      await expect(
        service.createSource({ name: 'x', feedUrl: 'https://feeds.bbci.co.uk/mundo/rss.xml' } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('creates a source with defaults', async () => {
      prisma.newsSource.findUnique = jest.fn().mockResolvedValue(null);
      await service.createSource({ name: 'Fuente', feedUrl: 'https://example.com/rss.xml' } as any);
      expect(prisma.newsSource.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          fetchIntervalMinutes: 60,
          maxItemsPerRun: 5,
          autoPublish: false,
          enabled: true,
        }),
      });
    });
  });

  describe('removeSource', () => {
    it('throws NotFound when source does not exist', async () => {
      prisma.newsSource.findUnique = jest.fn().mockResolvedValue(null);
      await expect(service.removeSource('nope')).rejects.toThrow(NotFoundException);
    });

    it('deletes the source', async () => {
      const result = await service.removeSource('src-1');
      expect(prisma.newsSource.delete).toHaveBeenCalledWith({ where: { id: 'src-1' } });
      expect(result).toEqual({ id: 'src-1' });
    });
  });

  describe('importItem (via runSource internals)', () => {
    it('creates the article in IN_REVIEW with cleaned TipTap content', async () => {
      await (service as any).importItem(source, item);

      const call = prisma.article.create.mock.calls[0][0];
      expect(call.data).toEqual(
        expect.objectContaining({
          title: 'Titular de ejemplo',
          status: 'IN_REVIEW',
          publishedAt: null,
          sourceUrl: 'https://example.com/articulo-1',
          sourceName: 'BBC Mundo',
        }),
      );
      expect(call.data.content.content).toHaveLength(2);
      expect(call.data.content.content[0].content[0].text).toBe('Primer párrafo de la noticia.');
      expect(es.indexDocument).not.toHaveBeenCalled();
    });

    it('publishes automatically and indexes in ES when autoPublish is enabled', async () => {
      const autoSource = { ...source, autoPublish: true };
      const createdArticle = {
        id: 'a1',
        title: 'Titular de ejemplo',
        slug: 'titular-de-ejemplo',
        status: 'PUBLISHED',
        publishedAt: new Date(),
        author: { firstName: 'Cosechador', lastName: 'Automático' },
        category: null,
        tags: [],
        content: { content: [] },
      };
      prisma.article.create = jest.fn().mockResolvedValue(createdArticle);
      prisma.article.findUnique = jest.fn().mockImplementation(({ where }: any) => {
        if (where.slug) return Promise.resolve(null);
        return Promise.resolve(createdArticle);
      });

      await (service as any).importItem(autoSource, item);

      expect(prisma.article.create.mock.calls[0][0].data.status).toBe('PUBLISHED');
      expect(es.indexDocument).toHaveBeenCalledWith(
        'articles',
        'a1',
        expect.objectContaining({ title: 'Titular de ejemplo', status: 'PUBLISHED' }),
      );
    });

    it('deduplicates by sourceUrl (skips known links)', async () => {
      prisma.article.findUnique = jest.fn().mockImplementation(({ where }: any) => {
        if (where.sourceUrl) return Promise.resolve({ id: 'old' });
        if (where.slug) return Promise.resolve(null);
        return Promise.resolve(null);
      });

      const exists = await (service as any).existsBySource('https://example.com/articulo-1');
      expect(exists).toBe(true);
    });
  });
});
