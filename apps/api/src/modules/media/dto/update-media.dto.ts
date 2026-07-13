import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class UpdateMediaDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  alt?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  caption?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  credit?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  folderId?: string;
}
