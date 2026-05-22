import { ApiProperty }               from '@nestjs/swagger';

import { IsArray, ValidateNested }   from 'class-validator';
import { Type }                      from 'class-transformer';
import { UpdateKitFileDto }          from './update-kit-file.dto';


export class UpdateKitFilesDto {

	@ApiProperty( {
		description : 'Arreglo con la configuración de metadatos de archivos a actualizar',
		type        : [ UpdateKitFileDto ],
	} )
	@IsArray()
	@ValidateNested( { each : true } )
	@Type( () => UpdateKitFileDto )
	filesInfo: UpdateKitFileDto[];

}
