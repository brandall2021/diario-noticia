import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { QueryCommentsDto } from './dto/query-comments.dto';
import { CommentStatus, Prisma } from '@prisma/client';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async create(createCommentDto: CreateCommentDto, userId?: string) {
    const { articleId, parentId, guestName, guestEmail, content } = createCommentDto;

    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
      select: { id: true, allowComments: true },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (!article.allowComments) {
      throw new ForbiddenException('Comments are disabled for this article');
    }

    if (parentId) {
      const parentComment = await this.prisma.comment.findUnique({
        where: { id: parentId },
        select: { id: true, articleId: true },
      });

      if (!parentComment || parentComment.articleId !== articleId) {
        throw new NotFoundException('Parent comment not found');
      }
    }

    return this.prisma.comment.create({
      data: {
        content,
        articleId,
        parentId,
        authorId: userId,
        guestName: userId ? undefined : guestName,
        guestEmail: userId ? undefined : guestEmail,
        status: userId ? CommentStatus.APPROVED : CommentStatus.PENDING,
      },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
        _count: { select: { likes: true, replies: true } },
      },
    });
  }

  async findAll(query: QueryCommentsDto) {
    const { articleId, status, limit = 20, offset = 0 } = query;

    const where: Prisma.CommentWhereInput = {
      ...(articleId && { articleId }),
      ...(status && { status }),
      parentId: null,
    };

    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
        where,
        include: {
          author: {
            select: { id: true, firstName: true, lastName: true, avatar: true },
          },
          replies: {
            include: {
              author: {
                select: { id: true, firstName: true, lastName: true, avatar: true },
              },
              _count: { select: { likes: true } },
            },
            orderBy: { createdAt: 'asc' },
          },
          _count: { select: { likes: true, replies: true, reports: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      this.prisma.comment.count({ where }),
    ]);

    return { comments, total, limit, offset };
  }

  async findOne(id: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
        replies: {
          include: {
            author: {
              select: { id: true, firstName: true, lastName: true, avatar: true },
            },
            _count: { select: { likes: true } },
          },
        },
        _count: { select: { likes: true, replies: true, reports: true } },
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }

  async update(id: string, updateCommentDto: UpdateCommentDto, userId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      select: { id: true, authorId: true },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    return this.prisma.comment.update({
      where: { id },
      data: { content: updateCommentDto.content },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
      },
    });
  }

  async remove(id: string, userId: string, isAdmin: boolean) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      select: { id: true, authorId: true },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (!isAdmin && comment.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.prisma.comment.delete({ where: { id } });
    return { message: 'Comment deleted successfully' };
  }

  async moderate(id: string, status: CommentStatus) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return this.prisma.comment.update({
      where: { id },
      data: { status },
    });
  }

  async like(id: string, userId?: string, ipAddress?: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const existingLike = await this.prisma.commentLike.findFirst({
      where: {
        commentId: id,
        OR: [
          ...(userId ? [{ userId }] : []),
          ...(ipAddress ? [{ ipAddress }] : []),
        ],
      },
    });

    if (existingLike) {
      throw new ForbiddenException('You have already liked this comment');
    }

    return this.prisma.commentLike.create({
      data: {
        commentId: id,
        userId,
        ipAddress,
      },
    });
  }

  async unlike(id: string, userId?: string, ipAddress?: string) {
    const like = await this.prisma.commentLike.findFirst({
      where: {
        commentId: id,
        OR: [
          ...(userId ? [{ userId }] : []),
          ...(ipAddress ? [{ ipAddress }] : []),
        ],
      },
    });

    if (!like) {
      throw new NotFoundException('Like not found');
    }

    await this.prisma.commentLike.delete({ where: { id: like.id } });
    return { message: 'Like removed successfully' };
  }

  async report(id: string, reason: string, details?: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return this.prisma.commentReport.create({
      data: {
        commentId: id,
        reason,
        details,
      },
    });
  }
}
