import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

import { PaginationDto } from '@common/dto/pagination.dto';


export class MaterialPaginationFilterDto extends PaginationDto {

	@ApiPropertyOptional( {
		description	: 'Filter by name (partial match, case-insensitive)',
		example		: 'steel',
	} )
	@IsOptional()
	@IsString()
	name?: string;


	@ApiPropertyOptional( {
		description	: 'Filter by autoclavable status',
		example		: true,
	} )
	@IsOptional()
	@IsBoolean()
	@Transform( ( { value } ) => ( value === 'true' || value === true ) )
	autoclavable?: boolean;


	@ApiPropertyOptional( {
		description	: 'Filter by active status',
		example		: true,
	} )
	@IsOptional()
	@IsBoolean()
	@Transform( ( { value } ) => ( value === 'true' || value === true ) )
	active?: boolean;

}
