import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AiService } from './ai.service';

@ApiTags('ai')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('suggest-content')
  @ApiOperation({ summary: 'Get content suggestions' })
  async suggestContent(
    @Body('topic') topic: string,
    @Body('count') count?: number,
  ) {
    return this.aiService.generateContentSuggestions(topic, count);
  }

  @Post('summarize')
  @ApiOperation({ summary: 'Generate content summary' })
  async summarize(
    @Body('content') content: string,
    @Body('maxLength') maxLength?: number,
  ) {
    return this.aiService.generateSummary(content, maxLength);
  }

  @Post('moderate')
  @ApiOperation({ summary: 'Moderate content' })
  async moderate(@Body('content') content: string) {
    return this.aiService.moderateContent(content);
  }

  @Post('meta-description')
  @ApiOperation({ summary: 'Generate meta description' })
  async generateMetaDescription(@Body('content') content: string) {
    return this.aiService.generateMetaDescription(content);
  }

  @Post('suggest-tags')
  @ApiOperation({ summary: 'Suggest tags for content' })
  async suggestTags(@Body('content') content: string) {
    return this.aiService.suggestTags(content);
  }
}
