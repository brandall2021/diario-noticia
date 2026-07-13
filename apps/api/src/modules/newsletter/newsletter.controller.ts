import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NewsletterService } from './newsletter.service';
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';
import { SendNewsletterDto, SendDigestDto } from './dto/send-newsletter.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

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
  @Roles('ADMIN', 'EDITOR')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all subscribers (admin)' })
  findAll() {
    return this.newsletterService.findAll();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get newsletter stats' })
  getStats() {
    return this.newsletterService.getStats();
  }

  @Post('send')
  @Roles('ADMIN', 'EDITOR')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send newsletter to all active subscribers' })
  sendNewsletter(@Body() dto: SendNewsletterDto) {
    return this.newsletterService.sendNewsletter(
      dto.subject,
      dto.htmlContent,
      dto.previewText,
    );
  }

  @Post('send-digest')
  @Roles('ADMIN', 'EDITOR')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send weekly digest email' })
  sendDigest(@Body() dto: SendDigestDto) {
    return this.newsletterService.sendWeeklyDigest(dto.weekStart, dto.previewText);
  }

  @Get('jobs/:jobId')
  @Roles('ADMIN', 'EDITOR')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get email job status' })
  getJobStatus(@Param('jobId') jobId: string) {
    return this.newsletterService.getJobStatus(jobId);
  }
}
