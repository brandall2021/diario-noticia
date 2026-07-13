import { Controller, Get, Param, Header } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RssService } from './rss.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('rss')
@Controller()
export class RssController {
  constructor(private readonly rssService: RssService) {}

  @Get('rss')
  @Public()
  @Header('Content-Type', 'application/rss+xml; charset=utf-8')
  @ApiOperation({ summary: 'Generate RSS feed' })
  async getRssFeed() {
    const baseUrl = process.env.APP_URL || 'http://localhost:3001';
    return this.rssService.generateRssFeed(baseUrl);
  }

  @Get('rss/categoria/:slug')
  @Public()
  @Header('Content-Type', 'application/rss+xml; charset=utf-8')
  @ApiOperation({ summary: 'Generate RSS feed for a category' })
  async getCategoryFeed(@Param('slug') slug: string) {
    const baseUrl = process.env.APP_URL || 'http://localhost:3001';
    return this.rssService.generateCategoryFeed(baseUrl, slug);
  }
}
