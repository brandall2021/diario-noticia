import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NewsResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  slug: string;

  @ApiPropertyOptional()
  subtitle?: string;

  @ApiPropertyOptional()
  bajada?: string;

  @ApiProperty()
  excerpt: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  isFeatured: boolean;

  @ApiProperty()
  isSticky: boolean;

  @ApiProperty()
  allowComments: boolean;

  @ApiProperty()
  viewCount: number;

  @ApiProperty()
  readTimeMinutes: number;

  @ApiPropertyOptional()
  publishedAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  author: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };

  @ApiPropertyOptional()
  category?: {
    id: string;
    name: string;
    slug: string;
    color?: string;
  };

  @ApiPropertyOptional()
  subcategory?: {
    id: string;
    name: string;
    slug: string;
  };

  @ApiProperty()
  tags: Array<{
    id: string;
    name: string;
    slug: string;
  }>;

  @ApiPropertyOptional()
  ogImage?: string;
}
