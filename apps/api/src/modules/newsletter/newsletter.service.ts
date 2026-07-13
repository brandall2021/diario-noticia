import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class NewsletterService {
  constructor(private prisma: PrismaService) {}

  async subscribe(dto: SubscribeNewsletterDto, userId?: string) {
    const existing = await this.prisma.newsletterSubscriber.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      if (existing.isActive) {
        throw new ConflictException('Email is already subscribed');
      }
      // Reactivate subscription
      return this.prisma.newsletterSubscriber.update({
        where: { id: existing.id },
        data: { isActive: true, token: uuidv4() },
      });
    }

    return this.prisma.newsletterSubscriber.create({
      data: {
        email: dto.email,
        name: dto.name,
        token: uuidv4(),
        userId,
      },
    });
  }

  async unsubscribe(token: string) {
    const subscriber = await this.prisma.newsletterSubscriber.findUnique({
      where: { token },
    });

    if (!subscriber) {
      throw new NotFoundException('Invalid unsubscribe token');
    }

    return this.prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: { isActive: false },
    });
  }

  async findAll() {
    return this.prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStats() {
    const [total, active] = await Promise.all([
      this.prisma.newsletterSubscriber.count(),
      this.prisma.newsletterSubscriber.count({ where: { isActive: true } }),
    ]);

    return { total, active, inactive: total - active };
  }
}
