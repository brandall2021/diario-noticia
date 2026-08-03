import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateNewsSourceDto {
  @ApiProperty({ description: 'Nombre de la fuente' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'URL del feed RSS/Atom a cosechar' })
  @IsString()
  feedUrl: string;

  @ApiPropertyOptional({ description: 'URL del sitio web de la fuente' })
  @IsOptional()
  @IsString()
  websiteUrl?: string;

  @ApiPropertyOptional({ description: 'Categoría por defecto para los artículos cosechados' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ default: 60, description: 'Minutos entre cosechas' })
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(1440)
  fetchIntervalMinutes?: number;

  @ApiPropertyOptional({ default: 5, description: 'Máximo de artículos por cosecha' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  maxItemsPerRun?: number;

  @ApiPropertyOptional({ default: false, description: 'Publicar automáticamente (si no, queda en revisión)' })
  @IsOptional()
  @IsBoolean()
  autoPublish?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
