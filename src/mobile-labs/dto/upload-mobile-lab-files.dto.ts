import { ApiPropertyOptional } from '@nestjs/swagger';

import { IsArray, IsOptional, ValidateNested }  from 'class-validator';
import { Transform, Type, plainToInstance }     from 'class-transformer';

import { FileConfigDto } from '@common/dto/file-config.dto';


export class UploadMobileLabFilesDto {

	@ApiPropertyOptional( {
		description : 'Arreglo con la configuración de metadatos de los archivos (JSON stringified)',
		type        : 'string',
		example     : '[{"alt":"Detalle interior","isMain":false,"order":1}]',
	} )
	@IsOptional()
	@Transform( ( { value } ) => {
		if ( typeof value === 'string' ) {
			try {
				const parsed = JSON.parse( value );
				return plainToInstance( FileConfigDto, parsed );
			} catch ( error ) {
				return [];
			}
		}
		return plainToInstance( FileConfigDto, value );
	} )
	@IsArray()
	@ValidateNested( { each : true } )
	@Type( ( ) => FileConfigDto )
	filesInfo?: FileConfigDto[];

}
