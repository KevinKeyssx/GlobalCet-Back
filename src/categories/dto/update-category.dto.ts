import { PartialType } from '@nestjs/swagger';

import { CreateCategoryDto } from '@categories/dto/create-category.dto';


export class UpdateCategoryDto extends PartialType( CreateCategoryDto ) {}
