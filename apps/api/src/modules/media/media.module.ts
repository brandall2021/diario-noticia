import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { FileStorageService } from '../../common/services/file-storage.service';

@Module({
  imports: [PrismaModule],
  controllers: [MediaController],
  providers: [MediaService, FileStorageService],
  exports: [MediaService],
})
export class MediaModule {}
