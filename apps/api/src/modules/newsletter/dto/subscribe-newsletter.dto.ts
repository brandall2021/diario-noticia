import { IsEmail, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubscribeNewsletterDto {
  @ApiProperty({ example: 'subscriber@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  name?: string;
}
