import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';

import {
	IsOptional,
	IsString,
	IsArray
}                       from 'class-validator';
import { Transform }    from 'class-transformer';

import { PaginationDto }            from '@common/dto/pagination.dto';
import { IncludesItemsDto }         from '@products/dto/includes-items.dto';
import { ProductFieldsFilterDto }   from '@products/dto/fields-product.dto';


export class ProductPaginationFilterDto extends IntersectionType(
    PaginationDto,
    IncludesItemsDto,
    ProductFieldsFilterDto
) {

	@ApiPropertyOptional({ description: 'Listado de IDs de subcategorías', isArray: true })
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	@Transform( ({ value }) => ( Array.isArray( value ) ? value : [ value ] ) )
	subcategories?: string[];

}
