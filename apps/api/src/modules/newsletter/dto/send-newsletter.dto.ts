import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendNewsletterDto {
  @ApiProperty({ example: 'Noticias de la semana' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  subject: string;

  @ApiProperty({ example: '<h1>Hola</h1><p>Contenido del newsletter...</p>' })
  @IsString()
  @MinLength(1)
  htmlContent: string;

  @ApiPropertyOptional({ example: 'Resumen de las noticias más importantes' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  previewText?: string;
}

export class SendDigestDto {
  @ApiProperty({ example: '2025-01-06' })
  @IsString()
  weekStart: string;

  @ApiPropertyOptional({ example: 'Las noticias más leídas de la semana' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  previewText?: string;
}
