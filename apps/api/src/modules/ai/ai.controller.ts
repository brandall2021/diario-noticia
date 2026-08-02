import { Controller, Post, Get, Put, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AiService } from './ai.service';

@ApiTags('ai')
@Controller()
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('admin/ai/settings')
  @ApiOperation({ summary: 'Get AI settings' })
  async getAiSettings() {
    return this.aiService.getSettings();
  }

  @Put('admin/ai/settings')
  @ApiOperation({ summary: 'Update AI settings' })
  async updateAiSettings(@Body() settings: Record<string, any>) {
    return this.aiService.updateSettings(settings);
  }

  @Post('ai/suggest-content')
  @ApiOperation({ summary: 'Get content suggestions' })
  async suggestContent(
    @Body('topic') topic: string,
    @Body('count') count?: number,
  ) {
    return this.aiService.generateContentSuggestions(topic, count);
  }

  @Post('ai/summarize')
  @ApiOperation({ summary: 'Generate content summary' })
  async summarize(
    @Body('content') content: string,
    @Body('maxLength') maxLength?: number,
  ) {
    return this.aiService.generateSummary(content, maxLength);
  }

  @Post('ai/moderate')
  @ApiOperation({ summary: 'Moderate content' })
  async moderate(@Body('content') content: string) {
    return this.aiService.moderateContent(content);
  }

  @Post('ai/meta-description')
  @ApiOperation({ summary: 'Generate meta description' })
  async generateMetaDescription(@Body('content') content: string) {
    return this.aiService.generateMetaDescription(content);
  }

  @Post('ai/suggest-tags')
  @ApiOperation({ summary: 'Suggest tags for content' })
  async suggestTags(@Body('content') content: string) {
    return this.aiService.suggestTags(content);
  }
}
