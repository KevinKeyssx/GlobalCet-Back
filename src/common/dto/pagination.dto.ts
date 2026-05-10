import { ApiPropertyOptional } from '@nestjs/swagger';

import {
    IsOptional,
	IsInt,
	Min
}               from 'class-validator';
import { Type } from 'class-transformer';


export class PaginationDto {

	@ApiPropertyOptional({
		description : 'Página actual',
		default     : 1,
		example     : 1,
	})
	@IsOptional()
	@IsInt()
	@Min( 1 )
	@Type( () => Number )
	page? : number = 1;

	@ApiPropertyOptional({
		description : 'Tamaño de la página',
		default     : 10,
		example     : 10,
	})
	@IsOptional()
	@IsInt()
	@Min( 1 )
	@Type( () => Number )
	size? : number = 10;

}
