import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
	IsString,
	IsNotEmpty,
	IsBoolean,
	IsOptional,
	Length,
}                       from 'class-validator';
import { Transform }    from 'class-transformer';


export class BaseCategoryDto {

	@ApiProperty( {
		description : 'Nombre único de la categoría',
		example     : 'Química Avanzada',
		required    : true,
	} )
	@IsString()
	@IsNotEmpty()
	@Length( 3, 100 )
	name: string;

	@ApiPropertyOptional( {
		description : 'Estado de activación de la categoría',
		example     : true,
		default     : true,
	} )
	@IsOptional()
	@IsBoolean()
	@Transform( ( { value } ) => value === 'true' || value === true )
	active?: boolean;

}
