import { ApiPropertyOptional } from '@nestjs/swagger';

import {
	IsBoolean,
	IsNumber,
	IsOptional,
	IsString,
	Min,
}                       from 'class-validator';
import { Transform }    from 'class-transformer';


export class KitFileConfigDto {

	@ApiPropertyOptional( {
		description : 'Leyenda o texto alternativo del archivo',
		example     : 'Vista frontal del Kit',
	} )
	@IsString()
	@IsOptional()
	alt?: string;

	@ApiPropertyOptional( {
		description : '¿Es el archivo principal del kit?',
		example     : true,
	} )
	@IsBoolean()
	@IsOptional()
	@Transform( ( { value } ) => value === 'true' || value === true )
	isMain?: boolean;

	@ApiPropertyOptional( {
		description : 'Orden del archivo',
		example     : 1,
	} )
	@IsNumber()
	@Min( 0 )
	@IsOptional()
	@Transform( ( { value } ) => Number( value ) )
	order?: number;

}
