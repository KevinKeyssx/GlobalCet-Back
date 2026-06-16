import { ApiProperty }          from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

import { FileConfigDto } from '@common/dto/file-config.dto';


export class UpdateProductImageDto extends FileConfigDto {

	@ApiProperty( {
		description : 'ID of the image to update',
		example     : '01ARZ3NDEKTSV4RRFFQ6KHNQZS',
	} )
	@IsString()
	@IsNotEmpty()
	id: string;

}
