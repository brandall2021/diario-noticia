import { Module } from '@nestjs/common';
import { HarvesterController } from './harvester.controller';
import { HarvesterService } from './harvester.service';

@Module({
  controllers: [HarvesterController],
  providers: [HarvesterService],
})
export class HarvesterModule {}
