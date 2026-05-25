import { ApiPropertyOptional } from '@nestjs/swagger';

import { IsArray, IsOptional, ValidateNested }  from 'class-validator';
import { Transform, Type, plainToInstance }     from 'class-transformer';
import { KitFileConfigDto }                     from '@kits/dto/kit-file-config.dto';


export class UploadKitFilesDto {

	@ApiPropertyOptional( {
		description : 'Arreglo con la configuración de metadatos de los archivos (JSON stringified)',
		type        : 'string',
		example     : '[{"alt":"Vista frontal","isMain":true,"order":0}]',
	} )
	@IsOptional()
	@Transform( ( { value } ) => {
		if ( typeof value === 'string' ) {
			try {
				const parsed = JSON.parse( value );
				return plainToInstance( KitFileConfigDto, parsed );
			} catch ( error ) {
				return [];
			}
		}
		return plainToInstance( KitFileConfigDto, value );
	} )
	@IsArray()
	@ValidateNested( { each : true } )
	@Type( () => KitFileConfigDto )
	filesInfo?: KitFileConfigDto[];

}
