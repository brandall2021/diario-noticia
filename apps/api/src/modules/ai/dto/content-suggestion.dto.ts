import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ContentSuggestionDto {
  @ApiProperty({ description: 'Topic for content suggestions' })
  @IsString()
  topic: string;

  @ApiPropertyOptional({ description: 'Number of suggestions to generate', default: 5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20)
  count?: number;
}

export class SummarizeDto {
  @ApiProperty({ description: 'Content to summarize' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: 'Maximum length in characters', default: 200 })
  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(500)
  maxLength?: number;
}

export class ModerateDto {
  @ApiProperty({ description: 'Content to moderate' })
  @IsString()
  content: string;
}

export class MetaDescriptionDto {
  @ApiProperty({ description: 'Content to generate meta description for' })
  @IsString()
  content: string;
}

export class SuggestTagsDto {
  @ApiProperty({ description: 'Content to suggest tags for' })
  @IsString()
  content: string;
}
