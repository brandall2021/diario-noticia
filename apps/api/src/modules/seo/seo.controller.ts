import { Controller, Get, Header, Put, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SeoService } from './seo.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('seo')
@Controller()
export class SeoController {
  constructor(private readonly seoService: SeoService) {}

  @Get('sitemap.xml')
  @Public()
  @Header('Content-Type', 'application/xml')
  @ApiOperation({ summary: 'Generate sitemap XML' })
  async getSitemap() {
    const baseUrl = process.env.APP_URL || 'http://localhost:3001';
    return this.seoService.generateSitemap(baseUrl);
  }

  @Get('robots.txt')
  @Public()
  @Header('Content-Type', 'text/plain')
  @ApiOperation({ summary: 'Generate robots.txt' })
  async getRobotsTxt() {
    const baseUrl = process.env.APP_URL || 'http://localhost:3001';
    return this.seoService.generateRobotsTxt(baseUrl);
  }

  @Get('admin/seo/settings')
  @ApiOperation({ summary: 'Get SEO settings' })
  async getSeoSettings() {
    return this.seoService.getSeoSettings();
  }

  @Put('admin/seo/settings')
  @ApiOperation({ summary: 'Update SEO settings' })
  async updateSeoSettings(@Body() settings: Record<string, any>) {
    return this.seoService.updateSeoSettings(settings);
  }
}
