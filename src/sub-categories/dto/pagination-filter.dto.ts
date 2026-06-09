import { ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsOptional,
	IsString,
	IsBoolean,
	IsEnum,
	Matches,
	IsArray
}                       from 'class-validator';
import { Transform }    from 'class-transformer';

import { PaginationDto } from '@common/dto/pagination.dto';


export enum OrderType {
	ASC  = 'asc',
	DESC = 'desc',
}


export class SubCategoryPaginationFilterDto extends PaginationDto {

	@ApiPropertyOptional( {
		description	: 'Filter by name (partial match, case-insensitive)',
		example		: 'Electronics',
	} )
	@IsOptional()
	@IsString()
	name?: string;


	@ApiPropertyOptional( {
		description	: 'Filter by active status',
		example		: true,
	} )
	@IsOptional()
	@IsBoolean()
	@Transform( ( { value } ) => ( value === 'true' || value === true ) )
	active?: boolean;


	@ApiPropertyOptional( {
		description	: 'Filter by category IDs (ULIDs)',
		type		: [ String ],
		example		: [ '01ARZ3NDEKTSV4RRFFQ6KHNQZS' ],
	} )
	@IsOptional()
	@IsArray()
	@IsString( { each : true } )
	@Matches( /^[0-9A-HJKMNP-TV-Z]{26}$/, {
		each	: true,
		message	: 'Each categoryId must be a valid ULID (26 characters, uppercase)',
	} )
	@Transform( ( { value } ) => ( typeof value === 'string' ? [ value ] : value ) )
	categoryIds?: string[];


	@ApiPropertyOptional( {
		description	: 'Include category details in the response',
		example		: false,
	} )
	@IsOptional()
	@IsBoolean()
	@Transform( ( { value } ) => ( value === 'true' || value === true ) )
	includeCategory?: boolean;

}

