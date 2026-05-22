import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
	IsInt,
	IsNotEmpty,
	IsOptional,
	IsString,
	Length,
	Min,
}                       from 'class-validator';
import { Type }         from 'class-transformer';


export class MobileLabProductDto {

	@ApiProperty( {
		description : 'ID del producto a asociar al laboratorio móvil (ULID)',
		example     : '01ARZ3NDEKTSV4RRFFQ6KHNQZS',
	} )
	@IsString()
	@IsNotEmpty()
	@Length( 26, 26 )
	productId: string;

	@ApiPropertyOptional( {
		description : 'Cantidad de unidades del producto dentro del laboratorio móvil',
		example     : 5,
		default     : 1,
	} )
	@IsOptional()
	@IsInt()
	@Min( 1 )
	@Type( () => Number )
	quantity?: number = 1;

}


export class UpdateMobileLabProductRelationDto {

	@ApiProperty( {
		description : 'Nueva cantidad de unidades del producto dentro del laboratorio móvil',
		example     : 10,
	} )
	@IsInt()
	@Min( 1 )
	@Type( () => Number )
	quantity: number;

}
