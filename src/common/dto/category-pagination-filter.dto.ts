import { ApiPropertyOptional } from '@nestjs/swagger';

import {
	IsOptional,
	IsString,
	IsBoolean,
}                       from 'class-validator';
import { Transform }    from 'class-transformer';
import { PaginationDto } from '@common/dto/pagination.dto';


export class CategoryPaginationFilterDto extends PaginationDto {

	@ApiPropertyOptional( {
		description : 'Buscar por nombre (parcial)',
		example     : 'Química',
	} )
	@IsOptional()
	@IsString()
	name?: string;

	@ApiPropertyOptional( {
		description : 'Filtrar activos o inactivos',
		example     : true,
	} )
	@IsOptional()
	@IsBoolean()
	@Transform( ( { value } ) => value === 'true' || value === true )
	active?: boolean;

}
