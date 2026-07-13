import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({ example: 'Argentina' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @ApiPropertyOptional({ description: 'Auto-generated from name if not provided' })
  @IsString()
  @IsOptional()
  slug?: string;
}
