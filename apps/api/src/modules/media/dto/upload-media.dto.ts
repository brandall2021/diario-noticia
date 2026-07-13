import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class UploadMediaDto {
  @ApiPropertyOptional({ description: 'Alternative text for accessibility' })
  @IsString()
  @IsOptional()
  alt?: string;

  @ApiPropertyOptional({ description: 'Image/video caption' })
  @IsString()
  @IsOptional()
  caption?: string;

  @ApiPropertyOptional({ description: 'Photo/video credit' })
  @IsString()
  @IsOptional()
  credit?: string;

  @ApiPropertyOptional({ description: 'Folder ID to organize media' })
  @IsUUID()
  @IsOptional()
  folderId?: string;

  @ApiPropertyOptional({ description: 'Article ID to associate media with' })
  @IsUUID()
  @IsOptional()
  articleId?: string;
}
