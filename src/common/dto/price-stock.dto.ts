import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber } from "class-validator";


export class PriceStock {

    @ApiProperty( {
		description : 'Product price',
		example     : 10,
	} )
	@IsNumber()
	@Type( () => Number )
	currentPrice?: number;

	@ApiProperty( {
		description : 'Product current stock',
		example     : 1,
	} )
	@IsNumber()
	@Type( () => Number )
	currentStock?: number;

    @ApiProperty( {
		description : 'Product min stock',
		example     : 1,
	} )
	@IsNumber()
	@Type( () => Number )
    minStock?: number;

    @ApiProperty( {
		description : 'Product max stock',
		example     : 1,
	} )
	@IsNumber()
	@Type( () => Number )
    maxStock?: number;

}
