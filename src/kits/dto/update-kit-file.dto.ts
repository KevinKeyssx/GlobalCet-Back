import { ApiProperty }          from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';
import { FileConfigDto }        from '@common/dto/file-config.dto';


export class UpdateKitFileDto extends FileConfigDto {

	@ApiProperty( {
		description : 'ID del archivo a actualizar (ULID)',
		example     : '01ARZ3NDEKTSV4RRFFQ6KHNQZS',
	} )
	@IsString()
	@IsNotEmpty()
	id: string;

}
