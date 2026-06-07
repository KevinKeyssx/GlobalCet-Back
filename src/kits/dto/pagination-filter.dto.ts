import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';

import {
	IsOptional,
	IsString,
	IsBoolean,
	IsArray,
}                       from 'class-validator';
import { Transform }    from 'class-transformer';

import { PaginationDto }    from '@common/dto/pagination.dto';
import { IncludesKitDto }   from '@kits/dto/includes.dto';


export class KitPaginationFilterDto extends IntersectionType(
    PaginationDto,
    IncludesKitDto
) {

	@ApiPropertyOptional( {
		description	: 'Búsqueda inteligente por nombre o SKU',
		example		: 'Kit de Bioquímica',
	} )
	@IsOptional()
	@IsString()
	query?: string;

	@ApiPropertyOptional({
		description : 'Filtrar por estado activo/inactivo',
		example     : true,
	} )
	@IsOptional()
	@IsBoolean()
	@Transform(({ value }) => value === 'true' || value === true )
	active?: boolean;

	@ApiPropertyOptional({
		description : 'Filtrar por IDs de categorías de kits (ULID)',
		type        : [ String ],
		example     : [ '01ARZ3NDEKTSV4RRFFQ6KHNQZS' ],
	} )
	@IsOptional()
	@IsArray()
	@IsString({ each : true })
	@Transform(({ value }) => ( Array.isArray( value ) ? value : [ value ]))
	categories?: string[];

}
