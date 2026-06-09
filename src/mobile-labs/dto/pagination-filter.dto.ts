import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';

import {
	IsArray,
	IsBoolean,
	IsOptional,
	IsString
}                           from 'class-validator';
import { Transform }        from 'class-transformer';

import { PaginationDto }          from '@common/dto/pagination.dto';
import { IncludesMobileLabDto }   from '@mobile-labs/dto/includes.dto';


export class MobileLabPaginationFilterDto extends IntersectionType(
	PaginationDto,
	IncludesMobileLabDto
) {

	@ApiPropertyOptional( {
		description : 'Filtrar por nombre o SKU del laboratorio móvil (búsqueda parcial)',
		example     : 'LAB-BIO-001 o Laboratorio',
	} )
	@IsOptional()
	@IsString()
	query?: string;

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

}
