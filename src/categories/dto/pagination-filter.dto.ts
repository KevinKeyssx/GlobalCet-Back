import { ApiPropertyOptional } from '@nestjs/swagger';

import {
    IsOptional,
    IsString,
    IsBoolean
}                       from 'class-validator';
import { Transform }    from 'class-transformer';

import { PaginationDto } from '@common/dto/pagination.dto';


export class CategoryPaginationFilterDto extends PaginationDto {

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
		description	: 'Include subcategories in the response',
		example		: false,
	} )
	@IsOptional()
	@IsBoolean()
	@Transform( ( { value } ) => ( value === 'true' || value === true ) )
	includeSubcategories?: boolean;

}
