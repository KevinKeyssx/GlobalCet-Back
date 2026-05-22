import { ApiProperty }          from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';
import { KitFileConfigDto }     from './kit-file-config.dto';


export class UpdateKitFileDto extends KitFileConfigDto {

	@ApiProperty( {
		description : 'ID del archivo a actualizar (ULID)',
		example     : '01ARZ3NDEKTSV4RRFFQ6KHNQZS',
	} )
	@IsString()
	@IsNotEmpty()
	id: string;

}
