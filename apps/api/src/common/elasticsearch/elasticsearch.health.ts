import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { ElasticsearchService } from './elasticsearch.service';

@Injectable()
export class ElasticsearchHealthIndicator extends HealthIndicator {
  constructor(private readonly elasticsearchService: ElasticsearchService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const isAlive = await this.elasticsearchService.ping();
    return this.getStatus(key, isAlive, { message: isAlive ? 'Elasticsearch is responding' : 'Elasticsearch is not responding' });
  }
}
