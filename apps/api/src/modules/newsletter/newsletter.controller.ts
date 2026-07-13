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
