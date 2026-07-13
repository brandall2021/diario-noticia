import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { NewsletterController } from './newsletter.controller';
import { NewsletterService } from './newsletter.service';
import { NewsletterProcessor } from './newsletter.processor';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: 'newsletter-emails',
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    }),
  ],
  controllers: [NewsletterController],
  providers: [NewsletterService, NewsletterProcessor],
  exports: [NewsletterService],
})
export class NewsletterModule {}
