import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { QueryTagDto } from './dto/query-tag.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all tags with pagination' })
  @ApiResponse({ status: 200, description: 'List of tags' })
  findAll(@Query() query: QueryTagDto) {
    return this.tagsService.findAll(query);
  }

  @Public()
  @Get('popular')
  @ApiOperation({ summary: 'Get popular tags by article count' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Popular tags' })
  findPopular(@Query('limit') limit?: number) {
    return this.tagsService.findPopular(limit);
  }

  @Public()
  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get tag by slug with articles' })
  @ApiResponse({ status: 200, description: 'Tag with articles' })
  findBySlug(@Param('slug') slug: string) {
    return this.tagsService.findBySlug(slug);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get tag by ID' })
  @ApiResponse({ status: 200, description: 'Tag details' })
  findOne(@Param('id') id: string) {
    return this.tagsService.findOne(id);
  }

  @Post()
  @Roles('ADMIN', 'EDITOR_GENERAL', 'EDITOR', 'JOURNALIST')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new tag' })
  @ApiResponse({ status: 201, description: 'Tag created' })
  create(@Body() dto: CreateTagDto) {
    return this.tagsService.create(dto);
  }

  @Post('bulk')
  @Roles('ADMIN', 'EDITOR_GENERAL', 'EDITOR', 'JOURNALIST')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create multiple tags at once' })
  @ApiResponse({ status: 201, description: 'Tags created' })
  createMany(@Body('names') names: string[]) {
    return this.tagsService.createMany(names);
  }

  @Delete(':id')
  @Roles('ADMIN', 'EDITOR_GENERAL')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete tag (only if no articles)' })
  @ApiResponse({ status: 200, description: 'Tag deleted' })
  remove(@Param('id') id: string) {
    return this.tagsService.remove(id);
  }
}
