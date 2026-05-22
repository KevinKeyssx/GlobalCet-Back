import { ApiPropertyOptional }                 from '@nestjs/swagger';

import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Transform, Type }                     from 'class-transformer';
import { MobileLabFileConfigDto }              from './mobile-lab-file-config.dto';


export class UploadMobileLabFilesDto {

	@ApiPropertyOptional( {
		description : 'Arreglo con la configuración de metadatos de los archivos (JSON stringified)',
		type        : 'string',
		example     : '[{"alt":"Detalle interior","isMain":false,"order":1}]',
	} )
	@IsOptional()
	@Transform( ( { value } ) => ( typeof value === 'string' ? JSON.parse( value ) : value ) )
	@IsArray()
	@ValidateNested( { each : true } )
	@Type( () => MobileLabFileConfigDto )
	filesInfo?: MobileLabFileConfigDto[];

}
