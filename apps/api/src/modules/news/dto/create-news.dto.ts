import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsArray,
  IsUUID,
  IsDateString,
  IsNumber,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateNewsDto {
  @ApiProperty({ example: 'Título de la noticia' })
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({ example: 'Subtítulo descriptivo' })
  @IsString()
  @IsOptional()
  @MaxLength(300)
  subtitle?: string;

  @ApiPropertyOptional({ example: 'Bajada o lead de la noticia' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  bajada?: string;

  @ApiPropertyOptional({ example: 'Copete para redes sociales' })
  @IsString()
  @IsOptional()
  @MaxLength(300)
  copete?: string;

  @ApiProperty({ description: 'Rich content in Tiptap/ProseMirror JSON format' })
  @IsOptional()
  content: any;

  @ApiPropertyOptional({ description: 'Category ID' })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Subcategory ID' })
  @IsUUID()
  @IsOptional()
  subcategoryId?: string;

  @ApiPropertyOptional({ description: 'Array of tag names' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ description: 'Main image URL' })
  @IsString()
  @IsOptional()
  ogImage?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  slug?: string;

  // SEO
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  metaTitle?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(160)
  metaDescription?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  canonicalUrl?: string;

  // Publishing
  @ApiPropertyOptional({ enum: ['DRAFT', 'IN_REVIEW', 'CORRECTION', 'APPROVED', 'SCHEDULED'] })
  @IsEnum(['DRAFT', 'IN_REVIEW', 'CORRECTION', 'APPROVED', 'SCHEDULED'])
  @IsOptional()
  status?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isSticky?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  allowComments?: boolean;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  scheduledAt?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  expiresAt?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  priority?: number;

  @ApiPropertyOptional({ description: 'Related article IDs' })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  relatedArticleIds?: string[];
}
