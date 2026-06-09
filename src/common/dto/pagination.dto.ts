import { ApiPropertyOptional } from '@nestjs/swagger';

import {
	IsOptional,
	IsInt,
	Min,
	IsIn,
	IsEnum
}               from 'class-validator';
import { Type } from 'class-transformer';


export enum SubCategoryOrderField {
	NAME       = 'name',
	CREATED_AT = 'createdAt',
	UPDATED_AT = 'updatedAt',
}


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

	@ApiPropertyOptional( {
		description	: 'Dirección de ordenamiento',
		enum		: [ 'asc', 'desc' ],
		example		: 'asc',
	} )
	@IsOptional()
	@IsIn( [ 'asc', 'desc' ] )
	order? : 'asc' | 'desc';

	@ApiPropertyOptional( {
		description	: 'Field to order by',
		enum		: SubCategoryOrderField,
		default		: SubCategoryOrderField.NAME,
	} )
	@IsOptional()
	@IsEnum( SubCategoryOrderField )
	orderBy? : SubCategoryOrderField = SubCategoryOrderField.NAME;

}

