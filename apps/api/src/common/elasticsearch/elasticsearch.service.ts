import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@elastic/elasticsearch';

export interface SearchOptions {
  index: string;
  query: string;
  fields?: string[];
  from?: number;
  size?: number;
  highlight?: boolean;
}

export interface SearchHit<T = any> {
  id: string;
  score: number;
  source: T;
  highlight?: Record<string, string[]>;
}

export interface SearchResult<T = any> {
  hits: SearchHit<T>[];
  total: number;
  maxScore: number;
  took: number;
}

@Injectable()
export class ElasticsearchService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ElasticsearchService.name);
  private client: Client;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const node = this.configService.get<string>('ELASTICSEARCH_NODE') || 'http://localhost:9200';
    const username = this.configService.get<string>('ELASTICSEARCH_USERNAME');
    const password = this.configService.get<string>('ELASTICSEARCH_PASSWORD');

    const clientConfig: any = { node };

    if (username && password) {
      clientConfig.auth = { username, password };
    }

    this.client = new Client(clientConfig);

    try {
      await this.client.ping();
      this.logger.log('Elasticsearch connected successfully');
    } catch (error) {
      this.logger.warn('Elasticsearch connection failed - running without search');
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.close();
    }
  }

  async ping(): Promise<boolean> {
    try {
      await this.client.ping();
      return true;
    } catch {
      return false;
    }
  }

  async healthCheck(): Promise<{ status: string; cluster?: string; version?: string }> {
    try {
      const info = await this.client.info();
      return {
        status: 'connected',
        cluster: info.cluster_name,
        version: info.version.number,
      };
    } catch {
      return { status: 'disconnected' };
    }
  }

  async createIndex(index: string, mappings?: Record<string, any>): Promise<boolean> {
    try {
      const exists = await this.client.indices.exists({ index });
      if (exists) {
        this.logger.log(`Index ${index} already exists`);
        return true;
      }

      const body: any = {};
      if (mappings) {
        body.mappings = mappings;
      }

      await this.client.indices.create({ index, body });
      this.logger.log(`Index ${index} created`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to create index ${index}: ${error.message}`);
      return false;
    }
  }

  async deleteIndex(index: string): Promise<boolean> {
    try {
      const exists = await this.client.indices.exists({ index });
      if (!exists) {
        this.logger.log(`Index ${index} does not exist`);
        return true;
      }

      await this.client.indices.delete({ index });
      this.logger.log(`Index ${index} deleted`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete index ${index}: ${error.message}`);
      return false;
    }
  }

  async indexExists(index: string): Promise<boolean> {
    return this.client.indices.exists({ index });
  }

  async indexDocument(index: string, id: string, document: Record<string, any>): Promise<boolean> {
    try {
      await this.client.index({
        index,
        id,
        document,
        refresh: true,
      });
      return true;
    } catch (error) {
      this.logger.error(`Failed to index document ${id} in ${index}: ${error.message}`);
      return false;
    }
  }

  async updateDocument(index: string, id: string, partial: Record<string, any>): Promise<boolean> {
    try {
      await this.client.update({
        index,
        id,
        doc: partial,
        doc_as_upsert: true,
        refresh: true,
      });
      return true;
    } catch (error) {
      this.logger.error(`Failed to update document ${id} in ${index}: ${error.message}`);
      return false;
    }
  }

  async deleteDocument(index: string, id: string): Promise<boolean> {
    try {
      await this.client.delete({
        index,
        id,
        refresh: true,
      });
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete document ${id} from ${index}: ${error.message}`);
      return false;
    }
  }

  async getDocument<T = any>(index: string, id: string): Promise<T | null> {
    try {
      const result = await this.client.get<T>({ index, id });
      return result._source || null;
    } catch (error) {
      if ((error as any).meta?.statusCode === 404) {
        return null;
      }
      this.logger.error(`Failed to get document ${id} from ${index}: ${error.message}`);
      return null;
    }
  }

  async bulkIndex(index: string, documents: Array<{ id: string; body: Record<string, any> }>): Promise<{ success: number; failed: number }> {
    const operations = documents.flatMap((doc) => [
      { index: { _index: index, _id: doc.id } },
      doc.body,
    ]);

    try {
      const result = await this.client.bulk({
        operations,
        refresh: true,
      });

      return {
        success: result.items.filter((item) => item.index?.result === 'created' || item.index?.result === 'updated').length,
        failed: result.items.filter((item) => item.index?.error).length,
      };
    } catch (error) {
      this.logger.error(`Bulk index failed for ${index}: ${error.message}`);
      return { success: 0, failed: documents.length };
    }
  }

  async search<T = any>(options: SearchOptions): Promise<SearchResult<T>> {
    const { index, query, fields, from = 0, size = 20, highlight = true } = options;

    const must: any[] = [];
    const highlightConfig: any = {};

    if (query && query.trim()) {
      must.push({
        multi_match: {
          query,
          fields: fields || ['title^3', 'content', 'subtitle^2', 'author^1.5'],
          type: 'best_fields',
          fuzziness: 'AUTO',
        },
      });

      if (highlight) {
        highlightConfig.fields = {
          title: {},
          content: { fragment_size: 200, number_of_fragments: 3 },
        };
      }
    } else {
      must.push({ match_all: {} });
    }

    const searchBody: any = {
      query: {
        bool: { must },
      },
      from,
      size,
      sort: [{ _score: { order: 'desc' } }, { publishedAt: { order: 'desc' } }],
    };

    if (Object.keys(highlightConfig).length > 0) {
      searchBody.highlight = highlightConfig;
    }

    try {
      const result = await this.client.search<T>({
        index,
        body: searchBody,
      });

      const hits = result.hits.hits.map((hit) => ({
        id: hit._id as string,
        score: hit._score as number,
        source: hit._source as T,
        highlight: hit.highlight as Record<string, string[]> | undefined,
      }));

      return {
        hits,
        total: typeof result.hits.total === 'number' ? result.hits.total : (result.hits.total as any)?.value || 0,
        maxScore: result.hits.max_score || 0,
        took: result.took,
      };
    } catch (error) {
      this.logger.error(`Search failed for index ${index}: ${error.message}`);
      return { hits: [], total: 0, maxScore: 0, took: 0 };
    }
  }
}
