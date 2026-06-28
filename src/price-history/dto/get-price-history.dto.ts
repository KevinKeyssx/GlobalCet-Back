import { ApiProperty }          from '@nestjs/swagger';
import { IsEnum, IsNotEmpty }   from 'class-validator';


export enum PriceHistoryType {
	PRODUCT    = 'product',
	KIT        = 'kit',
	MOBILE_LAB = 'mobileLab',
}


export class GetPriceHistoryQueryDto {

	@ApiProperty( {
		description : 'Tipo de ítem a consultar (product, kit o mobileLab)',
		enum        : PriceHistoryType,
		example     : PriceHistoryType.PRODUCT,
	} )
	@IsNotEmpty()
	@IsEnum( PriceHistoryType )
	type: PriceHistoryType;

}
