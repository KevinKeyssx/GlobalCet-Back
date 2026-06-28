import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

import { ExportFileDto } from '@common/dto/file-type.dto';


export class ExportMobileLabDto extends IntersectionType( ExportFileDto ) {

	@ApiPropertyOptional( {
		description : 'Listado de IDs de categorías',
		isArray     : true,
	} )
	@IsOptional( )
	@IsArray( )
	@IsString( { each : true } )
	@Transform( ( { value } ) => ( Array.isArray( value ) ? value : [ value ] ) )
	categories?: string[];

	@ApiPropertyOptional( {
		description : 'Búsqueda parcial por nombre o SKU',
	} )
	@IsOptional( )
	@IsString( )
	query?: string;

	@ApiPropertyOptional( {
		description : 'Filtrar por estado activo/inactivo',
		example     : true,
	} )
	@IsOptional( )
	@IsBoolean( )
	@Transform( ( { value } ) => value === 'true' || value === true )
	active?: boolean;

	@ApiPropertyOptional( {
		description : 'Obtener sin filtrar por estado activo',
		default     : false,
	} )
	@IsOptional( )
	@IsBoolean( )
	@Transform( ( { value } ) => value === 'true' || value === true )
	getAllStatus?: boolean = false;

}
