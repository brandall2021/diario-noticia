import { Module } from '@nestjs/common';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { TagsModule } from '../tags/tags.module';
import { ElasticsearchModule } from '../../common/elasticsearch/elasticsearch.module';

@Module({
  imports: [PrismaModule, TagsModule, ElasticsearchModule],
  controllers: [NewsController],
  providers: [NewsService],
  exports: [NewsService],
})
export class NewsModule {}
