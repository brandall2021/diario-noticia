import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsInt, Min, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export enum NewsSortBy {
  CREATED_AT = 'createdAt',
  PUBLISHED_AT = 'publishedAt',
  TITLE = 'title',
  VIEW_COUNT = 'viewCount',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class QueryNewsDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  subcategoryId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  tag?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  authorId?: string;

  @ApiPropertyOptional({ enum: ['DRAFT', 'IN_REVIEW', 'CORRECTION', 'APPROVED', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED'] })
  @IsEnum(['DRAFT', 'IN_REVIEW', 'CORRECTION', 'APPROVED', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED'])
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

  @ApiPropertyOptional({ enum: NewsSortBy })
  @IsEnum(NewsSortBy)
  @IsOptional()
  sortBy?: NewsSortBy;

  @ApiPropertyOptional({ enum: SortOrder })
  @IsEnum(SortOrder)
  @IsOptional()
  sortOrder?: SortOrder;

  @ApiPropertyOptional({ minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 50 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number;
}
