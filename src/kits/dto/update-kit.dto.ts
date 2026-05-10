import { PartialType } from '@nestjs/swagger';
import { CreateKitDto } from './create-kit.dto';

export class UpdateKitDto extends PartialType(CreateKitDto) {}
