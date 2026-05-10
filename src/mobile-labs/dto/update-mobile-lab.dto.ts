import { PartialType } from '@nestjs/swagger';
import { CreateMobileLabDto } from './create-mobile-lab.dto';

export class UpdateMobileLabDto extends PartialType(CreateMobileLabDto) {}
