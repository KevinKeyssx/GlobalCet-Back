import { ApiPropertyOptional }                 from '@nestjs/swagger';

import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Transform, Type }                     from 'class-transformer';
import { KitFileConfigDto }                    from './kit-file-config.dto';


export class UploadKitFilesDto {

	@ApiPropertyOptional( {
		description : 'Arreglo con la configuración de metadatos de los archivos (JSON stringified)',
		type        : 'string',
		example     : '[{"alt":"Vista frontal","isMain":true,"order":0}]',
	} )
	@IsOptional()
	@Transform( ( { value } ) => ( typeof value === 'string' ? JSON.parse( value ) : value ) )
	@IsArray()
	@ValidateNested( { each : true } )
	@Type( () => KitFileConfigDto )
	filesInfo?: KitFileConfigDto[];

}
