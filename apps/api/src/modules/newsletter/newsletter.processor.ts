import { Process, Processor, OnQueueFailed, OnQueueCompleted } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import * as nodemailer from 'nodemailer';

export interface SendEmailJobData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface SendBulkEmailJobData {
  recipients: Array<{ email: string; name?: string; token: string }>;
  subject: string;
  htmlBuilder: (name: string, unsubscribeUrl: string) => string;
  text?: string;
}

@Processor('newsletter-emails')
export class NewsletterProcessor {
  private readonly logger = new Logger(NewsletterProcessor.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
          ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            }
          : undefined,
    });
  }

  @Process('send-email')
  async handleSendEmail(job: Job<SendEmailJobData>) {
    const { to, subject, html, text } = job.data;
    this.logger.log(`Processing email job ${job.id}: sending to ${to}`);

    const result = await this.transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@diarionoticia.com',
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    });

    this.logger.log(`Email sent successfully to ${to}: ${result.messageId}`);
    return { messageId: result.messageId, to };
  }

  @Process('send-bulk-emails')
  async handleSendBulkEmails(job: Job<SendBulkEmailJobData>) {
    const { recipients, subject, htmlBuilder, text } = job.data;
    const baseUrl = process.env.APP_URL || 'http://localhost:3001';
    const results: Array<{ email: string; messageId?: string; error?: string }> = [];

    this.logger.log(`Processing bulk email job ${job.id}: ${recipients.length} recipients`);

    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];
      const unsubscribeUrl = `${baseUrl}/api/newsletter/unsubscribe/${recipient.token}`;
      const html = htmlBuilder(recipient.name || '', unsubscribeUrl);

      try {
        const result = await this.transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@diarionoticia.com',
          to: recipient.email,
          subject,
          html,
          text: text || html.replace(/<[^>]*>/g, ''),
        });

        results.push({ email: recipient.email, messageId: result.messageId });
        this.logger.log(`[${i + 1}/${recipients.length}] Email sent to ${recipient.email}`);
      } catch (error) {
        results.push({ email: recipient.email, error: error.message });
        this.logger.error(`Failed to send email to ${recipient.email}: ${error.message}`);
      }

      job.progress(Math.round(((i + 1) / recipients.length) * 100));
    }

    const sent = results.filter((r) => !r.error).length;
    const failed = results.filter((r) => r.error).length;
    this.logger.log(`Bulk email job ${job.id} complete: ${sent} sent, ${failed} failed`);

    return { sent, failed, total: recipients.length, results };
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} failed: ${error.message}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: any) {
    this.logger.log(`Job ${job.id} completed: ${JSON.stringify(result)}`);
  }
}
