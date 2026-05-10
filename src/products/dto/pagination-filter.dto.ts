import { ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsOptional,
	IsString,
	IsBoolean,
	IsArray
} from 'class-validator';
import { Transform } from 'class-transformer';

import { PaginationDto } from '@common/dto/pagination.dto';


export class ProductPaginationFilterDto extends PaginationDto {

	// @ApiPropertyOptional({ description: 'Buscar por nombre (parcial)' })
	// @IsOptional()
	// @IsString()
	// name?: string;

	// @ApiPropertyOptional({ description: 'Buscar por SKU (parcial inteligente)' })
	// @IsOptional()
	// @IsString()
	// sku?: string;

	@ApiPropertyOptional({ description: 'Buscar por material (parcial)' })
	@IsOptional()
	@IsString()
	material?: string;

	@ApiPropertyOptional({ description: 'Filtrar activos/inactivos' })
	@IsOptional()
	@IsBoolean()
	@Transform( ({ value }) => value === 'true' || value === true )
	active?: boolean;

	@ApiPropertyOptional({ description: 'Listado de IDs de subcategorías', isArray: true })
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	@Transform( ({ value }) => ( Array.isArray( value ) ? value : [ value ] ) )
	subcategories?: string[];

	@ApiPropertyOptional({ description: 'Incluir imágenes asociadas' })
	@IsOptional()
	@IsBoolean()
	@Transform( ({ value }) => value === 'true' || value === true )
	includeImages?: boolean = false;

	@ApiPropertyOptional({ description: 'Incluir kits asociados' })
	@IsOptional()
	@IsBoolean()
	@Transform( ({ value }) => value === 'true' || value === true )
	includeKits?: boolean = false;

	@ApiPropertyOptional({ description: 'Incluir laboratorios móviles asociados' })
	@IsOptional()
	@IsBoolean()
	@Transform( ({ value }) => value === 'true' || value === true )
	includeMobileLabs?: boolean = false;

}
