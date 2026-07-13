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
