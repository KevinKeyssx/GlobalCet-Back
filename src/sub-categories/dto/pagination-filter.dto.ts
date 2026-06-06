import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsOptional,
    IsString,
    IsBoolean,
    IsEnum,
    Matches,
    Length
}                       from 'class-validator';
import { Transform }    from 'class-transformer';

import { PaginationDto } from '@common/dto/pagination.dto';


export enum SubCategoryOrderField {
	NAME       = 'name',
	CREATED_AT = 'createdAt',
	UPDATED_AT = 'updatedAt',
}

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
		description	: 'Filter by category ID (ULID)',
		example		: '01ARZ3NDEKTSV4RRFFQ6KHNQZS',
	} )
	@IsOptional()
	@IsString()
	@Matches( /^[0-9A-HJKMNP-TV-Z]{26}$/, {
		message	: 'categoryId must be a valid ULID (26 characters, uppercase)',
	} )
	@Length( 26, 26 )
	categoryId?: string;


	@ApiPropertyOptional( {
		description	: 'Include category details in the response',
		example		: false,
	} )
	@IsOptional()
	@IsBoolean()
	@Transform( ( { value } ) => ( value === 'true' || value === true ) )
	includeCategory?: boolean;


	@ApiPropertyOptional( {
		description	: 'Field to order by',
		enum		: SubCategoryOrderField,
		default		: SubCategoryOrderField.NAME,
	} )
	@IsOptional()
	@IsEnum( SubCategoryOrderField )
	order?: SubCategoryOrderField = SubCategoryOrderField.NAME;


	@ApiPropertyOptional( {
		description	: 'Order type direction',
		enum		: OrderType,
		default		: OrderType.ASC,
	} )
	@IsOptional()
	@IsEnum( OrderType )
	typeOrder?: OrderType = OrderType.ASC;

}
