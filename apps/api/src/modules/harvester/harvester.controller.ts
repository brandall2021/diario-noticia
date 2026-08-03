import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { HarvesterService } from './harvester.service';
import { CreateNewsSourceDto } from './dto/create-source.dto';
import { UpdateNewsSourceDto } from './dto/update-source.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Harvester')
@Controller('harvester')
@ApiBearerAuth()
export class HarvesterController {
  constructor(private readonly harvesterService: HarvesterService) {}

  @Get('sources')
  @Roles('ADMIN', 'EDITOR_GENERAL')
  @ApiOperation({ summary: 'List harvest sources' })
  @ApiResponse({ status: 200, description: 'List of news sources' })
  findAllSources() {
    return this.harvesterService.findAllSources();
  }

  @Post('sources')
  @Roles('ADMIN', 'EDITOR_GENERAL')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a harvest source (RSS/Atom feed)' })
  @ApiResponse({ status: 201, description: 'Source created' })
  @ApiResponse({ status: 400, description: 'Invalid feed URL or duplicate' })
  createSource(@Body() dto: CreateNewsSourceDto) {
    return this.harvesterService.createSource(dto);
  }

  @Put('sources/:id')
  @Roles('ADMIN', 'EDITOR_GENERAL')
  @ApiOperation({ summary: 'Update a harvest source' })
  @ApiResponse({ status: 200, description: 'Source updated' })
  @ApiResponse({ status: 404, description: 'Source not found' })
  updateSource(@Param('id') id: string, @Body() dto: UpdateNewsSourceDto) {
    return this.harvesterService.updateSource(id, dto);
  }

  @Delete('sources/:id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a harvest source' })
  @ApiResponse({ status: 200, description: 'Source deleted' })
  @ApiResponse({ status: 404, description: 'Source not found' })
  removeSource(@Param('id') id: string) {
    return this.harvesterService.removeSource(id);
  }

  @Post('run')
  @Roles('ADMIN', 'EDITOR_GENERAL')
  @ApiOperation({ summary: 'Run harvesting on all enabled sources now' })
  @ApiResponse({ status: 201, description: 'Harvesting triggered' })
  runAll() {
    return this.harvesterService.runAll();
  }

  @Post('run/:id')
  @Roles('ADMIN', 'EDITOR_GENERAL')
  @ApiOperation({ summary: 'Run harvesting on a single source now (even if disabled)' })
  @ApiResponse({ status: 201, description: 'Harvesting triggered' })
  runSource(@Param('id') id: string) {
    return this.harvesterService.runSource(id, { force: true });
  }

  @Post('test/:id')
  @Roles('ADMIN', 'EDITOR_GENERAL')
  @ApiOperation({ summary: 'Test a source feed without importing' })
  @ApiResponse({ status: 201, description: 'Feed info' })
  testSource(@Param('id') id: string) {
    return this.harvesterService.testSource(id);
  }

  @Get('logs')
  @Roles('ADMIN', 'EDITOR_GENERAL')
  @ApiOperation({ summary: 'Harvesting run logs' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of harvest logs' })
  getLogs(@Query('limit') limit?: string) {
    return this.harvesterService.getLogs(parseInt(limit || '20', 10));
  }
}
