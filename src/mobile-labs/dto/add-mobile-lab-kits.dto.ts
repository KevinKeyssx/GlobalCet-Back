import { ApiProperty }             from '@nestjs/swagger';

import { IsArray, ValidateNested }   from 'class-validator';
import { Type }                      from 'class-transformer';
import { MobileLabKitDto }           from './mobile-lab-kit.dto';


export class AddMobileLabKitsDto {

	@ApiProperty( {
		description : 'Arreglo de kits con sus cantidades a asociar al laboratorio móvil',
		type        : [ MobileLabKitDto ],
	} )
	@IsArray()
	@ValidateNested( { each : true } )
	@Type( () => MobileLabKitDto )
	kits: MobileLabKitDto[];

}
