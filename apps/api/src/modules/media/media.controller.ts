import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UploadedFile,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { MediaService } from './media.service';
import { UploadMediaDto } from './dto/upload-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { MediaType } from '@prisma/client';

@ApiTags('Media')
@ApiBearerAuth()
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @Roles('ADMIN', 'EDITOR_GENERAL', 'EDITOR', 'JOURNALIST', 'PHOTOGRAPHER')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a media file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        alt: { type: 'string' },
        caption: { type: 'string' },
        credit: { type: 'string' },
        folderId: { type: 'string', format: 'uuid' },
        articleId: { type: 'string', format: 'uuid' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Media uploaded successfully' })
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadMediaDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.mediaService.upload(file, dto, userId);
  }

  @Get()
  @Roles('ADMIN', 'EDITOR_GENERAL', 'EDITOR', 'JOURNALIST', 'PHOTOGRAPHER')
  @ApiOperation({ summary: 'Get all media files' })
  @ApiResponse({ status: 200, description: 'List of media files' })
  findAll(
    @Query('type') type?: MediaType,
    @Query('articleId') articleId?: string,
    @Query('folderId') folderId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.mediaService.findAll({ type, articleId, folderId, page, limit });
  }

  @Get('folders')
  @Roles('ADMIN', 'EDITOR_GENERAL', 'EDITOR', 'JOURNALIST', 'PHOTOGRAPHER')
  @ApiOperation({ summary: 'Get media folders' })
  @ApiResponse({ status: 200, description: 'List of folders' })
  getFolders() {
    return this.mediaService.getFolders();
  }

  @Get(':id')
  @Roles('ADMIN', 'EDITOR_GENERAL', 'EDITOR', 'JOURNALIST', 'PHOTOGRAPHER')
  @ApiOperation({ summary: 'Get media by ID' })
  @ApiResponse({ status: 200, description: 'Media details' })
  findOne(@Param('id') id: string) {
    return this.mediaService.findOne(id);
  }

  @Put(':id')
  @Roles('ADMIN', 'EDITOR_GENERAL', 'EDITOR', 'JOURNALIST', 'PHOTOGRAPHER')
  @ApiOperation({ summary: 'Update media metadata' })
  @ApiResponse({ status: 200, description: 'Media updated' })
  update(@Param('id') id: string, @Body() dto: UpdateMediaDto) {
    return this.mediaService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'EDITOR_GENERAL', 'EDITOR')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete media file' })
  @ApiResponse({ status: 200, description: 'Media deleted' })
  remove(@Param('id') id: string) {
    return this.mediaService.remove(id);
  }

  @Post('folders')
  @Roles('ADMIN', 'EDITOR_GENERAL', 'EDITOR')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a media folder' })
  @ApiResponse({ status: 201, description: 'Folder created' })
  createFolder(
    @Body('name') name: string,
    @Body('parentId') parentId?: string,
  ) {
    return this.mediaService.createFolder(name, parentId);
  }
}
