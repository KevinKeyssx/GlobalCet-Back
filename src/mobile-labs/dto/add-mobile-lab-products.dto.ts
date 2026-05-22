import { ApiProperty }             from '@nestjs/swagger';

import { IsArray, ValidateNested }   from 'class-validator';
import { Type }                      from 'class-transformer';
import { MobileLabProductDto }       from './mobile-lab-product.dto';


export class AddMobileLabProductsDto {

	@ApiProperty( {
		description : 'Arreglo de productos con sus cantidades a asociar al laboratorio móvil',
		type        : [ MobileLabProductDto ],
	} )
	@IsArray()
	@ValidateNested( { each : true } )
	@Type( () => MobileLabProductDto )
	products: MobileLabProductDto[];

}
