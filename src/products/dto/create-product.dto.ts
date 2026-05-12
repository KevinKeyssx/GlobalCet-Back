import { ApiProperty, ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';

import {
	IsOptional,
	IsObject,
	IsString,
	IsNotEmpty,
	Length,
}                       from 'class-validator';
import { Transform }    from 'class-transformer';

import { NameDto }                  from '@common/dto/name.dto';
import { IncludesItemsDto }         from '@products/dto/includes-items.dto';
import { ProductFieldsFilterDto }   from '@products/dto/fields-product.dto';


export class CreateProductDto extends IntersectionType(
	NameDto,
	IncludesItemsDto,
	ProductFieldsFilterDto
) {

	@ApiPropertyOptional( {
		description : 'Product description',
		example     : 'This is a description of the product'
	} )
	@IsString()
	@IsOptional()
	description?     : string;

	@ApiPropertyOptional( {
		description : 'Technical specifications in JSON format',
		example     : { color : 'red', size : 'L' }
	} )
	@IsObject()
	@IsOptional()
	@Transform( ( { value } ) => ( typeof value === 'string' ? JSON.parse( value ) : value ) )
	technical_specs? : Record<string, any>;

	@ApiProperty( {
		description : 'Subcategory ID (ULID)',
		example     : '01ARZ3NDEKTSV4RRFFQ6KHNQZS'
	} )
	@IsString()
	@IsNotEmpty()
	@Length( 26, 26 )
	subcategoryId    : string;

}
