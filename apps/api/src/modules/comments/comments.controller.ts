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
