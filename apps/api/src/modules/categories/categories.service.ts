import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { generateSlug } from '../../common/helpers/slug.helper';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(includeInactive: boolean = false) {
    return this.prisma.category.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        subcategories: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: { articles: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        subcategories: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: { articles: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        subcategories: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
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

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async create(dto: CreateCategoryDto) {
    const slug = dto.slug || generateSlug(dto.name);

    const existing = await this.prisma.category.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new ConflictException('Category with this slug already exists');
    }

    return this.prisma.category.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        color: dto.color,
        icon: dto.icon,
        image: dto.image,
        sortOrder: dto.sortOrder || 0,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    let slug = dto.slug;
    if (dto.name && dto.name !== category.name && !dto.slug) {
      slug = generateSlug(dto.name);
    }

    if (slug && slug !== category.slug) {
      const existing = await this.prisma.category.findUnique({
        where: { slug },
      });

      if (existing) {
        throw new ConflictException('Category with this slug already exists');
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(slug && { slug }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.color !== undefined && { color: dto.color }),
        ...(dto.icon !== undefined && { icon: dto.icon }),
        ...(dto.image !== undefined && { image: dto.image }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  async remove(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { articles: true } } },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category._count.articles > 0) {
      return this.prisma.category.update({
        where: { id },
        data: { isActive: false },
      });
    }

    return this.prisma.category.delete({ where: { id } });
  }

  async reorder(ids: string[]) {
    const updates = ids.map((id, index) =>
      this.prisma.category.update({
        where: { id },
        data: { sortOrder: index },
      }),
    );

    await this.prisma.$transaction(updates);
    return { message: 'Categories reordered successfully' };
  }
}
