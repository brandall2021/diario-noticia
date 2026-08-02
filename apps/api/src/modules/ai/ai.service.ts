import { Injectable, BadRequestException } from '@nestjs/common';
import OpenAI from 'openai';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AiService {
  constructor(private prisma: PrismaService) {}

  async getSettings(): Promise<Record<string, any>> {
    const settings = await this.prisma.systemConfig.findMany({
      where: { group: 'ai' },
    });

    return settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, any>);
  }

  async updateSettings(settings: Record<string, any>): Promise<void> {
    await Promise.all(
      Object.entries(settings).map(([key, value]) =>
        this.prisma.systemConfig.upsert({
          where: { key },
          update: { value, group: 'ai' },
          create: { key, value, group: 'ai' },
        }),
      ),
    );
  }

  private async getApiKeyOrNull(): Promise<string | null> {
    const settings = await this.getSettings();
    const key = settings.openaiApiKey || process.env.OPENAI_API_KEY;
    return key ? String(key) : null;
  }

  private async getApiKey(): Promise<string> {
    const key = await this.getApiKeyOrNull();
    if (!key) {
      throw new BadRequestException('OpenAI API key not configured');
    }
    return key;
  }

  private async getModel(): Promise<string> {
    const settings = await this.getSettings();
    return String(settings.openaiModel || 'gpt-4');
  }

  private async getOpenAI(): Promise<OpenAI> {
    return new OpenAI({ apiKey: await this.getApiKey() });
  }

  async generateContentSuggestions(topic: string, count: number = 5): Promise<string[]> {
    const openai = await this.getOpenAI();

    const completion = await openai.chat.completions.create({
      model: await this.getModel(),
      messages: [
        {
          role: 'system',
          content: 'Eres un editor de noticias experimentado. Genera sugerencias de titulares atractivos y informativos.',
        },
        {
          role: 'user',
          content: `Genera ${count} sugerencias de titulares para noticias sobre: ${topic}. Responde solo con los titulares, uno por línea.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const suggestions = completion.choices[0]?.message?.content || '';
    return suggestions.split('\n').filter((s) => s.trim());
  }

  async generateSummary(content: string, maxLength: number = 200): Promise<string> {
    const openai = await this.getOpenAI();

    const completion = await openai.chat.completions.create({
      model: await this.getModel(),
      messages: [
        {
          role: 'system',
          content: 'Eres un editor de noticias. Resume el contenido de manera concisa y objetiva.',
        },
        {
          role: 'user',
          content: `Resume el siguiente contenido en máximo ${maxLength} caracteres:\n\n${content}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 300,
    });

    return completion.choices[0]?.message?.content || '';
  }

  async moderateContent(content: string): Promise<{
    approved: boolean;
    reason?: string;
    suggestions?: string[];
  }> {
    const apiKey = await this.getApiKeyOrNull();
    if (!apiKey) {
      return { approved: true };
    }

    const completion = await new OpenAI({ apiKey }).chat.completions.create({
      model: await this.getModel(),
      messages: [
        {
          role: 'system',
          content: `Eres un moderador de contenido. Analiza el contenido y determina si es apropiado para un periódico.
          Responde con un JSON: { "approved": boolean, "reason": string, "suggestions": string[] }`,
        },
        {
          role: 'user',
          content: `Analiza este contenido:\n\n${content}`,
        },
      ],
      temperature: 0.1,
      max_tokens: 500,
    });

    try {
      const response = completion.choices[0]?.message?.content || '{}';
      return JSON.parse(response);
    } catch {
      return { approved: true };
    }
  }

  async generateMetaDescription(content: string): Promise<string> {
    const apiKey = await this.getApiKeyOrNull();
    if (!apiKey) {
      return content.substring(0, 160) + '...';
    }

    const completion = await new OpenAI({ apiKey }).chat.completions.create({
      model: await this.getModel(),
      messages: [
        {
          role: 'system',
          content: 'Genera una meta descripción SEO optimizada para el contenido dado. Máximo 155 caracteres.',
        },
        {
          role: 'user',
          content: `Genera una meta descripción para:\n\n${content.substring(0, 500)}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 200,
    });

    return completion.choices[0]?.message?.content || '';
  }

  async suggestTags(content: string): Promise<string[]> {
    const apiKey = await this.getApiKeyOrNull();
    if (!apiKey) {
      return [];
    }

    const completion = await new OpenAI({ apiKey }).chat.completions.create({
      model: await this.getModel(),
      messages: [
        {
          role: 'system',
          content: 'Sugiere 5-10 etiquetas relevantes para el contenido. Responde solo con las etiquetas, una por línea.',
        },
        {
          role: 'user',
          content: `Sugiere etiquetas para:\n\n${content.substring(0, 1000)}`,
        },
      ],
      temperature: 0.5,
      max_tokens: 200,
    });

    const tags = completion.choices[0]?.message?.content || '';
    return tags.split('\n').filter((t) => t.trim());
  }
}
