import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { QueryTagDto } from './dto/query-tag.dto';
import { generateSlug } from '../../common/helpers/slug.helper';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryTagDto) {
    const { search, page = 1, limit = 50 } = query;

    const where: any = {};

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [tags, total] = await Promise.all([
      this.prisma.tag.findMany({
        where,
        include: {
          _count: {
            select: { articles: true },
          },
        },
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.tag.count({ where }),
    ]);

    return {
      data: tags,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findPopular(limit: number = 10) {
    return this.prisma.tag.findMany({
      include: {
        _count: {
          select: { articles: true },
        },
      },
      orderBy: {
        articles: { _count: 'desc' },
      },
      take: limit,
    });
  }

  async findOne(id: string) {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    return tag;
  }

  async findBySlug(slug: string) {
    const tag = await this.prisma.tag.findUnique({
      where: { slug },
      include: {
        articles: {
          where: { status: 'PUBLISHED' },
          take: 12,
          orderBy: { publishedAt: 'desc' },
          include: {
            author: {
              select: { id: true, firstName: true, lastName: true, avatar: true },
            },
            category: true,
          },
        },
      },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    return tag;
  }

  async create(dto: CreateTagDto) {
    const slug = dto.slug || generateSlug(dto.name);

    const existing = await this.prisma.tag.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new ConflictException('Tag with this slug already exists');
    }

    return this.prisma.tag.create({
      data: { name: dto.name, slug },
    });
  }

  async createMany(names: string[]) {
    const tags = await Promise.all(
      names.map(async (name) => {
        const slug = generateSlug(name);
        return this.prisma.tag.upsert({
          where: { slug },
          update: {},
          create: { name, slug },
        });
      }),
    );

    return tags;
  }

  async remove(id: string) {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
      include: { _count: { select: { articles: true } } },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    if (tag._count.articles > 0) {
      throw new ConflictException('Cannot delete tag with associated articles');
    }

    return this.prisma.tag.delete({ where: { id } });
  }
}
