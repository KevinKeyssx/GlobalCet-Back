import { ApiProperty }             from '@nestjs/swagger';

import { IsNotEmpty, IsString, Length } from 'class-validator';
import { MobileLabFileConfigDto }   from './mobile-lab-file-config.dto';


export class UpdateMobileLabFileDto extends MobileLabFileConfigDto {

	@ApiProperty( {
		description : 'ID único del archivo del laboratorio (ULID)',
		example     : '01ARZ3NDEKTSV4RRFFQ6KHNQZS',
	} )
	@IsString()
	@IsNotEmpty()
	@Length( 26, 26 )
	id: string;

}
