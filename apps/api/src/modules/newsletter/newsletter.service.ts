import { Injectable, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';
import {
  newsletterEmailTemplate,
  weeklyDigestTemplate,
} from './templates/email.templates';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class NewsletterService {
  private readonly logger = new Logger(NewsletterService.name);

  constructor(
    private prisma: PrismaService,
    @InjectQueue('newsletter-emails') private emailQueue: Queue,
  ) {}

  async subscribe(dto: SubscribeNewsletterDto, userId?: string) {
    const existing = await this.prisma.newsletterSubscriber.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      if (existing.isActive) {
        throw new ConflictException('Email is already subscribed');
      }
      return this.prisma.newsletterSubscriber.update({
        where: { id: existing.id },
        data: { isActive: true, token: uuidv4() },
      });
    }

    const subscriber = await this.prisma.newsletterSubscriber.create({
      data: {
        email: dto.email,
        name: dto.name,
        token: uuidv4(),
        userId,
      },
    });

    await this.sendWelcomeEmail(subscriber.email, subscriber.name || '');

    return subscriber;
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

  async sendWelcomeEmail(email: string, name: string) {
    const baseUrl = process.env.APP_URL || 'http://localhost:3001';
    const subscriber = await this.prisma.newsletterSubscriber.findUnique({
      where: { email },
    });
    const unsubscribeUrl = subscriber
      ? `${baseUrl}/api/newsletter/unsubscribe/${subscriber.token}`
      : `${baseUrl}/newsletter`;

    const { welcomeEmailTemplate } = await import('./templates/email.templates');
    const html = welcomeEmailTemplate(name, unsubscribeUrl);

    const job = await this.emailQueue.add('send-email', {
      to: email,
      subject: '¡Bienvenido a Diario Noticia!',
      html,
    });

    this.logger.log(`Welcome email queued for ${email}, job: ${job.id}`);
    return { jobId: job.id };
  }

  async sendNewsletter(subject: string, htmlContent: string, previewText?: string) {
    const subscribers = await this.prisma.newsletterSubscriber.findMany({
      where: { isActive: true },
      select: { email: true, name: true, token: true },
    });

    if (subscribers.length === 0) {
      this.logger.warn('No active subscribers found for newsletter');
      return { queued: 0 };
    }

    const baseUrl = process.env.APP_URL || 'http://localhost:3001';

    const job = await this.emailQueue.add(
      'send-bulk-emails',
      {
        recipients: subscribers,
        subject,
        htmlBuilder: (name: string, unsubscribeUrl: string) =>
          newsletterEmailTemplate(subject, htmlContent, previewText || '', unsubscribeUrl),
      },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
      },
    );

    this.logger.log(
      `Newsletter job queued: ${subscribers.length} recipients, job: ${job.id}`,
    );

    return { jobId: job.id, queued: subscribers.length };
  }

  async sendWeeklyDigest(weekStart: string, previewText?: string) {
    const startDate = new Date(weekStart);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);

    const articles = await this.prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        publishedAt: { gte: startDate, lt: endDate },
      },
      select: {
        title: true,
        excerpt: true,
        slug: true,
        category: { select: { name: true } },
      },
      orderBy: { publishedAt: 'desc' },
      take: 10,
    });

    if (articles.length === 0) {
      this.logger.warn('No articles found for weekly digest');
      return { queued: 0 };
    }

    const subscribers = await this.prisma.newsletterSubscriber.findMany({
      where: { isActive: true },
      select: { email: true, name: true, token: true },
    });

    if (subscribers.length === 0) {
      this.logger.warn('No active subscribers for weekly digest');
      return { queued: 0 };
    }

    const baseUrl = process.env.APP_URL || 'http://localhost:3001';

    const job = await this.emailQueue.add(
      'send-bulk-emails',
      {
        recipients: subscribers,
        subject: `Resumen semanal - Diario Noticia`,
        htmlBuilder: (name: string, unsubscribeUrl: string) => {
          const digestArticles = articles.map((a) => ({
            title: a.title,
            excerpt: a.excerpt || '',
            slug: a.slug,
            category: a.category?.name,
          }));
          return weeklyDigestTemplate(digestArticles, baseUrl, unsubscribeUrl);
        },
      },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
      },
    );

    this.logger.log(
      `Weekly digest queued: ${subscribers.length} recipients, ${articles.length} articles, job: ${job.id}`,
    );

    return { jobId: job.id, queued: subscribers.length, articles: articles.length };
  }

  async getJobStatus(jobId: string) {
    const job = await this.emailQueue.getJob(jobId);
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const state = await job.getState();
    return {
      id: job.id,
      state,
      progress: job.progress(),
      data: {
        subject: job.data.subject,
        recipientCount: job.data.recipients?.length || (job.data.to ? 1 : 0),
      },
      attemptsMade: job.attemptsMade,
      failedReason: job.failedReason,
      finishedOn: job.finishedOn,
      processedOn: job.processedOn,
    };
  }
}
