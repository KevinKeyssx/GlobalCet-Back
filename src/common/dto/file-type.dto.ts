import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';


export enum FileType {
	PDF   = 'pdf',
	EXCEL = 'excel',
}

export class ExportFileDto {

	@ApiProperty( {
		description : 'Tipo de archivo a generar (pdf o excel)',
		enum        : FileType,
		example     : FileType.EXCEL,
	} )
	@IsNotEmpty( )
	@IsEnum( FileType )
	fileType: FileType;

	@ApiPropertyOptional( {
		description : 'Nombre opcional personalizado para el archivo generado',
		example     : 'reporte_anual',
	} )
	@IsOptional( )
	@IsString( )
	filename?: string;

}
