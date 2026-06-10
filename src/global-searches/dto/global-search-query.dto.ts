import { ApiPropertyOptional } from '@nestjs/swagger';

import {
	IsOptional,
	IsString,
	IsBoolean,
	IsEnum,
	IsArray
}                                 from 'class-validator';
import { Transform }              from 'class-transformer';
import { PaginationDto }          from '@common/dto/pagination.dto';


export enum GlobalSearchFilterType {
	PRODUCTS    = 'products',
	KITS        = 'kits',
	MOBILE_LABS = 'mobileLabs',
}


export class GlobalSearchQueryDto extends PaginationDto {

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
		description : 'Filtro por tipo de entidad',
		required    : false,
		enum        : GlobalSearchFilterType,
	} )
	@IsOptional()
	@IsEnum( GlobalSearchFilterType )
	filter? : GlobalSearchFilterType;


	@ApiPropertyOptional( {
		description : 'Filtro por lista de IDs de categorías',
		required    : false,
		type        : [ String ],
	} )
	@IsOptional()
	@Transform( ( { value } ) => Array.isArray( value ) ? value : typeof value === 'string' ? value.split( ',' ) : [] )
	@IsArray()
	@IsString( { each : true } )
	categories? : string[];


	@ApiPropertyOptional( {
		description : 'Filtro por lista de IDs de subcategorías',
		required    : false,
		type        : [ String ],
	} )
	@IsOptional()
	@Transform( ( { value } ) => Array.isArray( value ) ? value : typeof value === 'string' ? value.split( ',' ) : [] )
	@IsArray()
	@IsString( { each : true } )
	subcategories? : string[];


	@ApiPropertyOptional( {
		description : 'Filtro por lista de IDs de materiales',
		required    : false,
		type        : [ String ],
	} )
	@IsOptional()
	@Transform( ( { value } ) => Array.isArray( value ) ? value : typeof value === 'string' ? value.split( ',' ) : [] )
	@IsArray()
	@IsString( { each : true } )
	materialIds? : string[];

}

