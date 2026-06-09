import {
	IsOptional,
	IsString,
	IsInt,
	Min,
	IsBoolean,
	IsEnum
}                              from 'class-validator';
import { Type, Transform }     from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';


export enum GlobalSearchSortBy {
	CREATED_AT = 'createdAt',
	NAME       = 'name',
}


export enum GlobalSearchSortOrder {
	ASC  = 'asc',
	DESC = 'desc',
}


export class GlobalSearchQueryDto {

	@ApiPropertyOptional( {
		description : 'Término de búsqueda',
		required    : false,
		type        : 'string',
		example     : 'Silla',
	} )
	@IsOptional()
	@IsString()
	query? : string;

	@ApiPropertyOptional( {
		description : 'Número de resultados por entidad',
		required    : false,
		type        : 'number',
		example     : 10,
		default     : 10,
	} )
	@IsOptional()
	@Type( () => Number )
	@IsInt()
	@Min( 1 )
	limitPerEntity? : number = 10;

	@ApiPropertyOptional( {
		description : 'Indica si se debe sugerir la búsqueda',
		required    : false,
		type        : 'boolean',
		example     : false,
		default     : true,
	} )
	@IsOptional()
	@Transform( ( { value } ) => value === 'true' || value === true )
	@IsBoolean()
	suggestion? : boolean = true;

	@ApiPropertyOptional( {
		description : 'Campo por el cual ordenar los resultados',
		required    : false,
		enum        : GlobalSearchSortBy,
		default     : GlobalSearchSortBy.CREATED_AT,
	} )
	@IsOptional()
	@IsEnum( GlobalSearchSortBy )
	orderBy? : GlobalSearchSortBy = GlobalSearchSortBy.CREATED_AT;

	@ApiPropertyOptional( {
		description : 'Orden de clasificación',
		required    : false,
		enum        : GlobalSearchSortOrder,
		default     : GlobalSearchSortOrder.ASC,
	} )
	@IsOptional()
	@IsEnum( GlobalSearchSortOrder )
	order? : GlobalSearchSortOrder = GlobalSearchSortOrder.ASC;

}
