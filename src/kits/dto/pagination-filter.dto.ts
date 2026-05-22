import { ApiPropertyOptional } from '@nestjs/swagger';

import {
	IsOptional,
	IsString,
	IsBoolean,
	IsArray,
}                       from 'class-validator';
import { Transform }    from 'class-transformer';
import { PaginationDto } from '@common/dto/pagination.dto';


export class KitPaginationFilterDto extends PaginationDto {

	@ApiPropertyOptional( {
		description : 'Filtrar por nombre parcial del kit',
		example     : 'Kit de Bioquímica',
	} )
	@IsOptional()
	@IsString()
	name?: string;

	@ApiPropertyOptional( {
		description : 'Filtrar por SKU parcial del kit',
		example     : 'KIT-BIO-001',
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
		description : 'Filtrar por IDs de categorías de kits (ULID)',
		type        : [ String ],
		example     : [ '01ARZ3NDEKTSV4RRFFQ6KHNQZS' ],
	} )
	@IsOptional()
	@IsArray()
	@IsString( { each : true } )
	@Transform( ( { value } ) => ( Array.isArray( value ) ? value : [ value ] ) )
	categories?: string[];

	@ApiPropertyOptional( {
		description : 'Incluir archivos asociados al kit',
		example     : false,
		default     : false,
	} )
	@IsOptional()
	@IsBoolean()
	@Transform( ( { value } ) => value === 'true' || value === true )
	includeFiles?: boolean = false;

	@ApiPropertyOptional( {
		description : 'Incluir productos asociados al kit',
		example     : false,
		default     : false,
	} )
	@IsOptional()
	@IsBoolean()
	@Transform( ( { value } ) => value === 'true' || value === true )
	includeProducts?: boolean = false;

}
