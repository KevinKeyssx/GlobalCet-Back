import { ApiProperty }               from '@nestjs/swagger';

import { IsArray, ValidateNested }   from 'class-validator';
import { Type }                      from 'class-transformer';
import { KitProductDto }             from './kit-product.dto';


export class AddKitProductsDto {

	@ApiProperty( {
		description : 'Arreglo de productos con sus cantidades a asociar al kit',
		type        : [ KitProductDto ],
	} )
	@IsArray()
	@ValidateNested( { each : true } )
	@Type( () => KitProductDto )
	products: KitProductDto[];

}
