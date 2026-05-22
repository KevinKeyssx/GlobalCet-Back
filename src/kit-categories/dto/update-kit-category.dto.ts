import { PartialType } from '@nestjs/swagger';

import { CreateKitCategoryDto } from './create-kit-category.dto';


export class UpdateKitCategoryDto extends PartialType( CreateKitCategoryDto ) {}
