import { Controller, Get, Param, Post, Header } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SocialService } from './social.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('social')
@Controller()
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @Get('social/opengraph/:slug')
  @Public()
  @ApiOperation({ summary: 'Get Open Graph meta tags for an article' })
  async getOpenGraph(@Param('slug') slug: string) {
    const baseUrl = process.env.APP_URL || 'http://localhost:3001';
    return this.socialService.getOpenGraphMeta(slug, baseUrl);
  }

  @Get('social/twitter-card/:slug')
  @Public()
  @ApiOperation({ summary: 'Get Twitter Card meta tags for an article' })
  async getTwitterCard(@Param('slug') slug: string) {
    const baseUrl = process.env.APP_URL || 'http://localhost:3001';
    return this.socialService.getTwitterCardMeta(slug, baseUrl);
  }

  @Get('social/share/:slug')
  @Public()
  @ApiOperation({ summary: 'Get social sharing URLs for an article' })
  async getShareUrls(@Param('slug') slug: string) {
    const baseUrl = process.env.APP_URL || 'http://localhost:3001';
    return this.socialService.getShareUrls(slug, baseUrl);
  }

  @Post('social/share/:slug/track')
  @Public()
  @ApiOperation({ summary: 'Track a share and increment share count' })
  async trackShare(@Param('slug') slug: string) {
    return this.socialService.incrementShareCount(slug);
  }
}
