import { ApiProperty }             from '@nestjs/swagger';

import { IsArray, ValidateNested }   from 'class-validator';
import { Type }                      from 'class-transformer';
import { UpdateMobileLabFileDto }    from './update-mobile-lab-file.dto';


export class UpdateMobileLabFilesDto {

	@ApiProperty( {
		description : 'Arreglo con la información de metadatos actualizada de los archivos',
		type        : [ UpdateMobileLabFileDto ],
	} )
	@IsArray()
	@ValidateNested( { each : true } )
	@Type( () => UpdateMobileLabFileDto )
	filesInfo: UpdateMobileLabFileDto[];

}
