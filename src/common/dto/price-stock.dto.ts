import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type }                 from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';


export class PriceStock {

	@ApiPropertyOptional( {
		description	: 'Product price',
		example		: 10,
	} )
	@IsNumber()
	@IsOptional()
	@Type( () => Number )
	currentPrice?: number;

	@ApiPropertyOptional( {
		description	: 'Product current stock',
		example		: 1,
	} )
	@IsNumber()
	@IsOptional()
	@Type( () => Number )
	currentStock?: number;

	@ApiPropertyOptional( {
		description	: 'Product min stock',
		example		: 1,
	} )
	@IsNumber()
	@IsOptional()
	@Type( () => Number )
	minStock?: number;

	@ApiPropertyOptional( {
		description	: 'Product max stock',
		example		: 1,
	} )
	@IsNumber()
	@IsOptional()
	@Type( () => Number )
	maxStock?: number;

}
