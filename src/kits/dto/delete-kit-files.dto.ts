import { ApiProperty }        from '@nestjs/swagger';

import { IsArray, IsString }  from 'class-validator';


export class DeleteKitFilesDto {

	@ApiProperty( {
		description : 'Arreglo con los IDs de archivos a eliminar',
		type        : [ String ],
		example     : [ '01ARZ3NDEKTSV4RRFFQ6KHNQZS' ],
	} )
	@IsArray()
	@IsString( { each : true } )
	files: string[];

}
