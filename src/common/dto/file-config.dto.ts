import { ApiPropertyOptional } from '@nestjs/swagger';

import {
	IsBoolean,
	IsEnum,
	IsInt,
	IsOptional,
	IsString,
	Min,
}                           from 'class-validator';
import { Transform, Type }  from 'class-transformer';
import { AttachmentType }   from '@prisma/client';


export class FileConfigDto {

	@ApiPropertyOptional( {
		description : 'Texto alternativo o leyenda del archivo',
		example     : 'Visa frontal del recurso',
	})
	@IsOptional()
	@IsString()
	alt?: string;

	@ApiPropertyOptional({
		description : 'Determina si el archivo es el principal (solo visuales)',
		example     : true,
		default     : false,
	})
	@IsOptional()
	@IsBoolean()
	@Transform( ( { value } ) => value === 'true' || value === true )
	isMain?: boolean = false;

	@ApiPropertyOptional({
		description : 'Orden de visualización del archivo (solo visuales)',
		example     : 0,
	})
	@IsOptional()
	@IsInt()
	@Min( 0 )
	@Type( ( ) => Number )
	order?: number;

	@ApiPropertyOptional({
		description : 'Nombre original del archivo',
		example     : 'archivo.jpg',
	})
	@IsOptional()
	@IsString()
	name?: string;

	@ApiPropertyOptional({
		description : 'Tipo de adjunto',
		enum        : AttachmentType,
		example     : 'IMAGE',
	})
	@IsOptional()
	@IsEnum( AttachmentType )
	attachmentType?: AttachmentType;

}
