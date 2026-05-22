import { ApiPropertyOptional }                 from '@nestjs/swagger';

import { IsArray, IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Transform, Type }                     from 'class-transformer';


export class MobileLabPaginationFilterDto {

	@ApiPropertyOptional( {
		description : 'Número de página para la paginación',
		example     : 1,
		default     : 1,
	} )
	@IsOptional()
	@IsInt()
	@Min( 1 )
	@Type( () => Number )
	page?: number = 1;

	@ApiPropertyOptional( {
		description : 'Tamaño de elementos por página',
		example     : 10,
		default     : 10,
	} )
	@IsOptional()
	@IsInt()
	@Min( 1 )
	@Type( () => Number )
	size?: number = 10;

	@ApiPropertyOptional( {
		description : 'Filtrar por nombre del laboratorio móvil (búsqueda parcial)',
		example     : 'Laboratorio de Bioquímica',
	} )
	@IsOptional()
	@IsString()
	name?: string;

	@ApiPropertyOptional( {
		description : 'Filtrar por SKU del laboratorio móvil (búsqueda parcial)',
		example     : 'LAB-BIO-001',
	} )
	@IsOptional()
	@IsString()
	sku?: string;

	@ApiPropertyOptional( {
		description : 'Filtrar por estado activo/inactivo',
		example     : true,
	} )
	@IsOptional()
	@IsBoolean()
	@Transform( ( { value } ) => value === 'true' || value === true )
	active?: boolean;

	@ApiPropertyOptional( {
		description : 'Filtrar por múltiples IDs de categorías de laboratorios (LabCategory)',
		type        : [ String ],
		example     : [ '01ARZ3NDEKTSV4RRFFQ6KHNQZS' ],
	} )
	@IsOptional()
	@Transform( ( { value } ) => ( typeof value === 'string' ? [ value ] : value ) )
	@IsArray()
	@IsString( { each : true } )
	categories?: string[];

	@ApiPropertyOptional( {
		description : 'Incluir todos los archivos adjuntos en el resultado',
		example     : false,
		default     : false,
	} )
	@IsOptional()
	@IsBoolean()
	@Transform( ( { value } ) => value === 'true' || value === true )
	includeFiles?: boolean = false;

	@ApiPropertyOptional( {
		description : 'Incluir la relación de productos en el resultado',
		example     : false,
		default     : false,
	} )
	@IsOptional()
	@IsBoolean()
	@Transform( ( { value } ) => value === 'true' || value === true )
	includeProducts?: boolean = false;

	@ApiPropertyOptional( {
		description : 'Incluir la relación de kits en el resultado',
		example     : false,
		default     : false,
	} )
	@IsOptional()
	@IsBoolean()
	@Transform( ( { value } ) => value === 'true' || value === true )
	includeKits?: boolean = false;

}
