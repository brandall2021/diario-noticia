import { PartialType } from '@nestjs/swagger';
import { CreateNewsSourceDto } from './create-source.dto';

export class UpdateNewsSourceDto extends PartialType(CreateNewsSourceDto) {}
