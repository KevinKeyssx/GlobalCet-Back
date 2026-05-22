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


export class MobileLabKitDto {

	@ApiProperty( {
		description : 'ID del kit a asociar al laboratorio móvil (ULID)',
		example     : '01ARZ3NDEKTSV4RRFFQ6KHNQZS',
	} )
	@IsString()
	@IsNotEmpty()
	@Length( 26, 26 )
	kitId: string;

	@ApiPropertyOptional( {
		description : 'Cantidad de unidades del kit dentro del laboratorio móvil',
		example     : 3,
		default     : 1,
	} )
	@IsOptional()
	@IsInt()
	@Min( 1 )
	@Type( () => Number )
	quantity?: number = 1;

}


export class UpdateMobileLabKitRelationDto {

	@ApiProperty( {
		description : 'Nueva cantidad de unidades del kit dentro del laboratorio móvil',
		example     : 5,
	} )
	@IsInt()
	@Min( 1 )
	@Type( () => Number )
	quantity: number;

}
