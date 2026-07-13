import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { QueryNewsDto } from './dto/query-news.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('News')
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get published articles' })
  @ApiResponse({ status: 200, description: 'List of articles' })
  findAll(@Query() query: QueryNewsDto) {
    return this.newsService.findAll(query);
  }

  @Public()
  @Get('featured')
  @ApiOperation({ summary: 'Get featured articles' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Featured articles' })
  findFeatured(@Query('limit') limit?: number) {
    return this.newsService.findFeatured(limit);
  }

  @Public()
  @Get('latest')
  @ApiOperation({ summary: 'Get latest articles' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Latest articles' })
  findLatest(@Query('limit') limit?: number) {
    return this.newsService.findLatest(limit);
  }

  @Public()
  @Get('most-read')
  @ApiOperation({ summary: 'Get most read articles' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Most read articles' })
  findMostRead(@Query('limit') limit?: number) {
    return this.newsService.findMostRead(limit);
  }

  @Public()
  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get article by slug' })
  @ApiResponse({ status: 200, description: 'Article details' })
  findBySlug(@Param('slug') slug: string) {
    return this.newsService.findBySlug(slug);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get article by ID' })
  @ApiResponse({ status: 200, description: 'Article details' })
  findOne(@Param('id') id: string) {
    return this.newsService.findOne(id);
  }

  @Public()
  @Get(':id/related')
  @ApiOperation({ summary: 'Get related articles' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Related articles' })
  getRelated(@Param('id') id: string, @Query('limit') limit?: number) {
    return this.newsService.getRelated(id, limit);
  }

  @Post()
  @Roles('ADMIN', 'EDITOR_GENERAL', 'EDITOR', 'JOURNALIST')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new article' })
  @ApiResponse({ status: 201, description: 'Article created' })
  create(@Body() dto: CreateNewsDto, @CurrentUser('id') userId: string) {
    return this.newsService.create(dto, userId);
  }

  @Put(':id')
  @Roles('ADMIN', 'EDITOR_GENERAL', 'EDITOR', 'JOURNALIST')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update article' })
  @ApiResponse({ status: 200, description: 'Article updated' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateNewsDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.newsService.update(id, dto, userId, userRole);
  }

  @Put(':id/publish')
  @Roles('ADMIN', 'EDITOR_GENERAL', 'EDITOR')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish article' })
  @ApiResponse({ status: 200, description: 'Article published' })
  publish(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.newsService.publish(id, userId, userRole);
  }

  @Delete(':id')
  @Roles('ADMIN', 'EDITOR_GENERAL', 'EDITOR', 'JOURNALIST')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Archive article (soft delete)' })
  @ApiResponse({ status: 200, description: 'Article archived' })
  remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.newsService.remove(id, userId, userRole);
  }

  @Get('admin/all')
  @Roles('ADMIN', 'EDITOR_GENERAL', 'EDITOR')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all articles including drafts (admin)' })
  findAllAdmin(@Query() query: QueryNewsDto) {
    return this.newsService.findAll(query, true);
  }
}
