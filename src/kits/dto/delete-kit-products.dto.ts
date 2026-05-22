import { ApiProperty }        from '@nestjs/swagger';

import { IsArray, IsString }  from 'class-validator';


export class DeleteKitProductsDto {

	@ApiProperty( {
		description : 'Arreglo con los IDs de los registros KitProduct a eliminar',
		type        : [ String ],
		example     : [ '01ARZ3NDEKTSV4RRFFQ6KHNQZS' ],
	} )
	@IsArray()
	@IsString( { each : true } )
	ids: string[];

}
