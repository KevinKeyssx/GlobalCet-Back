import { ApiProperty } from '@nestjs/swagger';

import { IsArray, IsString, Length } from 'class-validator';


export class DeleteMobileLabRelationsDto {

	@ApiProperty( {
		description : 'Arreglo con los IDs de los registros de relación a eliminar (ULID)',
		example     : [ '01ARZ3NDEKTSV4RRFFQ6KHNQZS' ],
		type        : [ String ],
	} )
	@IsArray()
	@IsString( { each : true } )
	@Length( 26, 26, { each : true } )
	ids: string[];

}
