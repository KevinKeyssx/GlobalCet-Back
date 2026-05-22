import { ApiPropertyOptional }              from '@nestjs/swagger';

import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Transform, Type }                  from 'class-transformer';


export class MobileLabFileConfigDto {

	@ApiPropertyOptional( {
		description : 'Texto alternativo para el archivo',
		example     : 'Vista frontal del laboratorio móvil',
	} )
	@IsOptional()
	@IsString()
	alt?: string;

	@ApiPropertyOptional( {
		description : 'Determina si el archivo es el principal (solo visuales)',
		example     : true,
		default     : false,
	} )
	@IsOptional()
	@IsBoolean()
	@Transform( ( { value } ) => value === 'true' || value === true )
	isMain?: boolean = false;

	@ApiPropertyOptional( {
		description : 'Orden de visualización del archivo (solo visuales)',
		example     : 0,
	} )
	@IsOptional()
	@IsInt()
	@Min( 0 )
	@Type( () => Number )
	order?: number;

}
