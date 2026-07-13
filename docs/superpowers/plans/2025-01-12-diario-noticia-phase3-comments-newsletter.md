# Phase 3: Comments, Newsletter, Subscriptions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Comments module (with moderation), Newsletter subscription, and Subscription/Payment management for the Diario Noticia backend API.

**Architecture:** Three new NestJS modules following the existing patterns (controller → service → Prisma). Comments support guest/authenticated users, threaded replies, likes, and moderation. Newsletter handles subscription/unsubscription with token-based verification. Subscriptions manage plans and payments.

**Tech Stack:** NestJS, Prisma ORM, PostgreSQL, class-validator, class-transformer, JWT (for authenticated routes)

## Global Constraints
- Follow existing code patterns from auth/users/categories modules
- Use Prisma for all database operations
- Apply class-validator for DTO validation
- Use `@Public()` decorator for unauthenticated endpoints
- Use `@CurrentUser()` decorator for user context
- All endpoints must have proper error handling
- Commit after each task

---

## File Structure

### Phase 3 Files

| File | Responsibility |
|------|----------------|
| `src/modules/comments/comments.module.ts` | Comments module definition |
| `src/modules/comments/comments.controller.ts` | Comments REST endpoints |
| `src/modules/comments/comments.service.ts` | Comments business logic |
| `src/modules/comments/dto/create-comment.dto.ts` | Create comment validation |
| `src/modules/comments/dto/update-comment.dto.ts` | Update comment validation |
| `src/modules/comments/dto/query-comments.dto.ts` | Query/filter validation |
| `src/modules/comments/dto/moderate-comment.dto.ts` | Moderation action validation |
| `src/modules/newsletter/newsletter.module.ts` | Newsletter module definition |
| `src/modules/newsletter/newsletter.controller.ts` | Newsletter REST endpoints |
| `src/modules/newsletter/newsletter.service.ts` | Newsletter business logic |
| `src/modules/newsletter/dto/subscribe-newsletter.dto.ts` | Subscribe validation |
| `src/modules/subscriptions/subscriptions.module.ts` | Subscriptions module definition |
| `src/modules/subscriptions/subscriptions.controller.ts` | Subscriptions REST endpoints |
| `src/modules/subscriptions/subscriptions.service.ts` | Subscriptions business logic |
| `src/modules/subscriptions/dto/create-subscription.dto.ts` | Create subscription validation |
| `src/modules/subscriptions/dto/create-payment.dto.ts` | Create payment validation |

---

## Tasks

### Task 1: Comments Module - Core CRUD

**Files:**
- Create: `src/modules/comments/comments.module.ts`
- Create: `src/modules/comments/comments.controller.ts`
- Create: `src/modules/comments/comments.service.ts`
- Create: `src/modules/comments/dto/create-comment.dto.ts`
- Create: `src/modules/comments/dto/update-comment.dto.ts`
- Create: `src/modules/comments/dto/query-comments.dto.ts`
- Modify: `src/app.module.ts`

**Interfaces:**
- Consumes: PrismaService, JwtAuthGuard, RolesGuard
- Produces: CommentsModule, CommentsController, CommentsService

- [ ] **Step 1: Create CommentsModule**

```typescript
// src/modules/comments/comments.module.ts
import { Module } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
```

- [ ] **Step 2: Create CreateCommentDto**

```typescript
// src/modules/comments/dto/create-comment.dto.ts
import { IsString, IsOptional, IsEmail, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ example: 'Great article!' })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content: string;

  @ApiProperty({ example: 'article-slug-or-id' })
  @IsString()
  articleId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  guestName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  guestEmail?: string;
}
```

- [ ] **Step 3: Create UpdateCommentDto**

```typescript
// src/modules/comments/dto/update-comment.dto.ts'
import { PartialType } from '@nestjs/swagger';
import { CreateCommentDto } from './create-comment.dto';

export class UpdateCommentDto extends PartialType(CreateCommentDto) {}
```

- [ ] **Step 4: Create QueryCommentsDto**

```typescript
// src/modules/comments/dto/query-comments.dto.ts'
import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CommentStatus } from '@prisma/client';

export class QueryCommentsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  articleId?: string;

  @ApiPropertyOptional({ enum: CommentStatus })
  @IsOptional()
  @IsEnum(CommentStatus)
  status?: CommentStatus;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ minimum: 0, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;
}
```

- [ ] **Step 5: Create CommentsService**

```typescript
// src/modules/comments/comments.service.ts'
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

    // Verify article exists and allows comments
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

    // Verify parent comment exists if provided
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
      parentId: null, // Only top-level comments
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

    // Check for existing like
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
```

- [ ] **Step 6: Create CommentsController**

```typescript
// src/modules/comments/comments.controller.ts'
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { QueryCommentsDto } from './dto/query-comments.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CommentStatus } from '@prisma/client';

@ApiTags('comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @Public()
  @ApiOperation({ summary: 'Create a new comment' })
  create(
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() user?: any,
  ) {
    return this.commentsService.create(createCommentDto, user?.id);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all comments (top-level with replies)' })
  findAll(@Query() query: QueryCommentsDto) {
    return this.commentsService.findAll(query);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get comment by ID' })
  findOne(@Param('id') id: string) {
    return this.commentsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update comment (owner only)' })
  update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.commentsService.update(id, updateCommentDto, userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete comment (owner or admin)' })
  remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.commentsService.remove(id, userId, role === 'ADMIN');
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Like a comment' })
  like(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.commentsService.like(id, userId);
  }

  @Delete(':id/like')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unlike a comment' })
  unlike(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.commentsService.unlike(id, userId);
  }

  @Post(':id/report')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Report a comment' })
  report(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Body('details') details?: string,
  ) {
    return this.commentsService.report(id, reason, details);
  }

  @Put(':id/moderate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'EDITOR')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Moderate comment status (admin/editor only)' })
  moderate(
    @Param('id') id: string,
    @Body('status') status: CommentStatus,
  ) {
    return this.commentsService.moderate(id, status);
  }
}
```

- [ ] **Step 7: Register CommentsModule in AppModule**

```typescript
// src/app.module.ts - Add to imports
import { CommentsModule } from './modules/comments/comments.module';

@Module({
  imports: [
    // ... existing imports
    CommentsModule,
  ],
})
```

- [ ] **Step 8: Test the implementation**

Run: `npm run start:dev`
Expected: Server starts without errors

- [ ] **Step 9: Commit**

```bash
git add apps/api/src/modules/comments apps/api/src/app.module.ts
git commit -m "feat(api): implement comments module with CRUD, likes, and moderation"
```

---

### Task 2: Newsletter Module

**Files:**
- Create: `src/modules/newsletter/newsletter.module.ts`
- Create: `src/modules/newsletter/newsletter.controller.ts`
- Create: `src/modules/newsletter/newsletter.service.ts`
- Create: `src/modules/newsletter/dto/subscribe-newsletter.dto.ts`
- Modify: `src/app.module.ts`

**Interfaces:**
- Consumes: PrismaService
- Produces: NewsletterModule, NewsletterController, NewsletterService

- [ ] **Step 1: Create NewsletterModule**

```typescript
// src/modules/newsletter/newsletter.module.ts'
import { Module } from '@nestjs/common';
import { NewsletterController } from './newsletter.controller';
import { NewsletterService } from './newsletter.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [NewsletterController],
  providers: [NewsletterService],
  exports: [NewsletterService],
})
export class NewsletterModule {}
```

- [ ] **Step 2: Create SubscribeNewsletterDto**

```typescript
// src/modules/newsletter/dto/subscribe-newsletter.dto.ts'
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubscribeNewsletterDto {
  @ApiProperty({ example: 'subscriber@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  name?: string;
}
```

- [ ] **Step 3: Create NewsletterService**

```typescript
// src/modules/newsletter/newsletter.service.ts'
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class NewsletterService {
  constructor(private prisma: PrismaService) {}

  async subscribe(dto: SubscribeNewsletterDto, userId?: string) {
    const existing = await this.prisma.newsletterSubscriber.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      if (existing.isActive) {
        throw new ConflictException('Email is already subscribed');
      }
      // Reactivate subscription
      return this.prisma.newsletterSubscriber.update({
        where: { id: existing.id },
        data: { isActive: true, token: uuidv4() },
      });
    }

    return this.prisma.newsletterSubscriber.create({
      data: {
        email: dto.email,
        name: dto.name,
        token: uuidv4(),
        userId,
      },
    });
  }

  async unsubscribe(token: string) {
    const subscriber = await this.prisma.newsletterSubscriber.findUnique({
      where: { token },
    });

    if (!subscriber) {
      throw new NotFoundException('Invalid unsubscribe token');
    }

    return this.prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: { isActive: false },
    });
  }

  async findAll() {
    return this.prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStats() {
    const [total, active] = await Promise.all([
      this.prisma.newsletterSubscriber.count(),
      this.prisma.newsletterSubscriber.count({ where: { isActive: true } }),
    ]);

    return { total, active, inactive: total - active };
  }
}
```

- [ ] **Step 4: Create NewsletterController**

```typescript
// src/modules/newsletter/newsletter.controller.ts'
import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { NewsletterService } from './newsletter.service';
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('newsletter')
@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post('subscribe')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Subscribe to newsletter' })
  subscribe(
    @Body() dto: SubscribeNewsletterDto,
    @CurrentUser() user?: any,
  ) {
    return this.newsletterService.subscribe(dto, user?.id);
  }

  @Post('unsubscribe/:token')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unsubscribe from newsletter' })
  unsubscribe(@Param('token') token: string) {
    return this.newsletterService.unsubscribe(token);
  }

  @Get('subscribers')
  @ApiOperation({ summary: 'Get all subscribers (admin)' })
  findAll() {
    return this.newsletterService.findAll();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get newsletter stats' })
  getStats() {
    return this.newsletterService.getStats();
  }
}
```

- [ ] **Step 5: Register NewsletterModule in AppModule**

```typescript
// src/app.module.ts - Add to imports
import { NewsletterModule } from './modules/newsletter/newsletter.module';

@Module({
  imports: [
    // ... existing imports
    NewsletterModule,
  ],
})
```

- [ ] **Step 6: Test the implementation**

Run: `npm run start:dev`
Expected: Server starts without errors

- [ ] **Step 7: Commit**

```bash
git add apps/api/src/modules/newsletter apps/api/src/app.module.ts
git commit -m "feat(api): implement newsletter subscription module"
```

---

### Task 3: Subscriptions Module

**Files:**
- Create: `src/modules/subscriptions/subscriptions.module.ts`
- Create: `src/modules/subscriptions/subscriptions.controller.ts`
- Create: `src/modules/subscriptions/subscriptions.service.ts`
- Create: `src/modules/subscriptions/dto/create-subscription.dto.ts`
- Create: `src/modules/subscriptions/dto/create-payment.dto.ts`
- Modify: `src/app.module.ts`

**Interfaces:**
- Consumes: PrismaService
- Produces: SubscriptionsModule, SubscriptionsController, SubscriptionsService

- [ ] **Step 1: Create SubscriptionsModule**

```typescript
// src/modules/subscriptions/subscriptions.module.ts'
import { Module } from '@nestjs/common';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
```

- [ ] **Step 2: Create CreateSubscriptionDto**

```typescript
// src/modules/subscriptions/dto/create-subscription.dto.ts'
import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubscriptionPlan } from '@prisma/client';

export class CreateSubscriptionDto {
  @ApiProperty({ enum: SubscriptionPlan })
  @IsEnum(SubscriptionPlan)
  plan: SubscriptionPlan;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
```

- [ ] **Step 3: Create CreatePaymentDto**

```typescript
// src/modules/subscriptions/dto/create-payment.dto.ts'
import { IsNumber, IsEnum, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';

export class CreatePaymentDto {
  @ApiProperty({ example: 9.99 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  externalId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: Record<string, any>;
}
```

- [ ] **Step 4: Create SubscriptionsService**

```typescript
// src/modules/subscriptions/subscriptions.service.ts'
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { SubscriptionPlan, SubscriptionStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateSubscriptionDto) {
    // Check for existing active subscription
    const existing = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    if (existing) {
      throw new BadRequestException('User already has an active subscription');
    }

    return this.prisma.subscription.create({
      data: {
        userId,
        plan: dto.plan,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
      },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.subscription.findMany({
      where: { userId },
      include: {
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        payments: true,
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return subscription;
  }

  async cancel(id: string, userId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (subscription.userId !== userId) {
      throw new BadRequestException('Cannot cancel another user subscription');
    }

    if (subscription.status !== SubscriptionStatus.ACTIVE) {
      throw new BadRequestException('Subscription is not active');
    }

    return this.prisma.subscription.update({
      where: { id },
      data: {
        status: SubscriptionStatus.CANCELLED,
        cancelAt: new Date(),
      },
    });
  }

  async addPayment(subscriptionId: string, dto: CreatePaymentDto) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return this.prisma.payment.create({
      data: {
        subscriptionId,
        amount: dto.amount,
        currency: dto.currency || 'USD',
        method: dto.method,
        externalId: dto.externalId,
        metadata: dto.metadata,
        status: PaymentStatus.COMPLETED,
      },
    });
  }

  async getPayments(subscriptionId: string) {
    return this.prisma.payment.findMany({
      where: { subscriptionId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllSubscriptions() {
    return this.prisma.subscription.findMany({
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        _count: { select: { payments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStats() {
    const [total, active, byPlan] = await Promise.all([
      this.prisma.subscription.count(),
      this.prisma.subscription.count({ where: { status: SubscriptionStatus.ACTIVE } }),
      this.prisma.subscription.groupBy({
        by: ['plan'],
        _count: true,
        where: { status: SubscriptionStatus.ACTIVE },
      }),
    ]);

    return { total, active, byPlan };
  }
}
```

- [ ] **Step 5: Create SubscriptionsController**

```typescript
// src/modules/subscriptions/subscriptions.controller.ts'
import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('subscriptions')
@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new subscription' })
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateSubscriptionDto,
  ) {
    return this.subscriptionsService.create(userId, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get current user subscriptions' })
  findMySubscriptions(@CurrentUser('id') userId: string) {
    return this.subscriptionsService.findByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get subscription by ID' })
  findOne(@Param('id') id: string) {
    return this.subscriptionsService.findOne(id);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel subscription' })
  cancel(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.subscriptionsService.cancel(id, userId);
  }

  @Post(':id/payments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add payment to subscription' })
  addPayment(
    @Param('id') id: string,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.subscriptionsService.addPayment(id, dto);
  }

  @Get(':id/payments')
  @ApiOperation({ summary: 'Get subscription payments' })
  getPayments(@Param('id') id: string) {
    return this.subscriptionsService.getPayments(id);
  }

  @Get('admin/all')
  @ApiOperation({ summary: 'Get all subscriptions (admin)' })
  getAllSubscriptions() {
    return this.subscriptionsService.getAllSubscriptions();
  }

  @Get('admin/stats')
  @ApiOperation({ summary: 'Get subscription stats (admin)' })
  getStats() {
    return this.subscriptionsService.getStats();
  }
}
```

- [ ] **Step 6: Register SubscriptionsModule in AppModule**

```typescript
// src/app.module.ts - Add to imports
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';

@Module({
  imports: [
    // ... existing imports
    SubscriptionsModule,
  ],
})
```

- [ ] **Step 7: Test the implementation**

Run: `npm run start:dev`
Expected: Server starts without errors

- [ ] **Step 8: Commit**

```bash
git add apps/api/src/modules/subscriptions apps/api/src/app.module.ts
git commit -m "feat(api): implement subscriptions and payments module"
```

---

### Task 4: API Documentation & Final Verification

**Files:**
- Modify: `src/main.ts` (if needed for Swagger config)

**Interfaces:**
- Consumes: All Phase 3 modules
- Produces: Updated Swagger documentation

- [ ] **Step 1: Verify Swagger documentation**

Run: `npm run start:dev`
Navigate to: `http://localhost:3000/api`
Expected: All new endpoints visible in Swagger UI

- [ ] **Step 2: Test all endpoints manually**

```bash
# Test comment creation
curl -X POST http://localhost:3000/api/comments \
  -H "Content-Type: application/json" \
  -d '{"content": "Test comment", "articleId": "test-id"}'

# Test newsletter subscription
curl -X POST http://localhost:3000/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "name": "Test User"}'

# Test subscription creation (with auth token)
curl -X POST http://localhost:3000/api/subscriptions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"plan": "PREMIUM"}'
```

- [ ] **Step 3: Commit final documentation**

```bash
git add .
git commit -m "docs(api): verify Phase 3 API documentation"
```

---

### Task 5: Update Progress Ledger

**Files:**
- Modify: `.superpowers/sdd/progress.md`

**Interfaces:**
- Consumes: Phase 3 completion status
- Produces: Updated progress ledger

- [ ] **Step 1: Update progress.md**

Add Phase 3 tasks to the progress ledger:

```markdown
## Phase 3: Comments, Newsletter, Subscriptions

| Task | Status | Commit |
|------|--------|--------|
| Comments Module - Core CRUD | ✅ | TBD |
| Newsletter Module | ✅ | TBD |
| Subscriptions Module | ✅ | TBD |
| API Documentation & Verification | ✅ | TBD |
| Update Progress Ledger | ✅ | TBD |
```

- [ ] **Step 2: Commit progress update**

```bash
git add .superpowers/sdd/progress.md
git commit -m "docs: update progress ledger for Phase 3 completion"
```
