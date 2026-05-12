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

	// @ApiPropertyOptional({ description: 'Buscar por nombre (parcial)' })
	// @IsOptional()
	// @IsString()
	// name?: string;

	// @ApiPropertyOptional({ description: 'Buscar por SKU (parcial inteligente)' })
	// @IsOptional()
	// @IsString()
	// sku?: string;

	// @ApiPropertyOptional({ description: 'Buscar por material (parcial)' })
	// @IsOptional()
	// @IsString()
	// material?: string;

	// @ApiPropertyOptional({ description: 'Filtrar activos/inactivos' })
	// @IsOptional()
	// @IsBoolean()
	// @Transform( ({ value }) => value === 'true' || value === true )
	// active?: boolean;

	@ApiPropertyOptional({ description: 'Listado de IDs de subcategorías', isArray: true })
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	@Transform( ({ value }) => ( Array.isArray( value ) ? value : [ value ] ) )
	subcategories?: string[];

}
