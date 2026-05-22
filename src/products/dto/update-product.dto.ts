import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';

import { IsBoolean, IsOptional }    from 'class-validator';
import { Transform }                from 'class-transformer';

import { CreateProductDto } from '@products/dto/create-product.dto';


export class UpdateProductDto extends PartialType( CreateProductDto ) {

    @ApiPropertyOptional( { description: 'Filtrar activos/inactivos' } )
	@IsOptional()
	@IsBoolean()
	@Transform( ({ value }) => value === 'true' || value === true )
	active?: boolean;

}
