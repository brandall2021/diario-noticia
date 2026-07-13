import { IsNumber, IsEnum, IsOptional, IsString, IsObject, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';

export class CreatePaymentDto {
  @ApiProperty({ example: 9.99 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  externalId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
