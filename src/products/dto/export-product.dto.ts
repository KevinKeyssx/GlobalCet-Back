import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

import { ExportFileDto } from '@common/dto/file-type.dto';
import { ProductFieldsFilterDto } from '@products/dto/fields-product.dto';


export class ExportProductDto extends IntersectionType( ExportFileDto, ProductFieldsFilterDto ) {

	@ApiPropertyOptional( {
		description : 'Listado de IDs de subcategorías',
		isArray     : true,
	} )
	@IsOptional( )
	@IsArray( )
	@IsString( { each : true } )
	@Transform( ( { value } ) => ( Array.isArray( value ) ? value : [ value ] ) )
	subcategories?: string[];

	@ApiPropertyOptional( {
		description : 'Búsqueda parcial por nombre o SKU',
	} )
	@IsOptional( )
	@IsString( )
	query?: string;

	@ApiPropertyOptional( {
		description : 'Obtener sin filtrar por estado activo',
		default     : false,
	} )
	@IsOptional( )
	@IsBoolean( )
	@Transform( ( { value } ) => value === 'true' || value === true )
	getAllStatus?: boolean = false;

}
