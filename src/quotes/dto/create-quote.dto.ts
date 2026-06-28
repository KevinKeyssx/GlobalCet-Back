import { ApiProperty } from '@nestjs/swagger';

import {
	IsNotEmpty,
	ValidateNested
}               from 'class-validator';
import { Type } from 'class-transformer';

import { ItemsDto }         from './items.dto';
import { ClientDataDto }    from './client-data.dto';


export class CreateQuoteDto {

	@ApiProperty( {
		description : 'Información del cliente para la cotización',
	} )
	@IsNotEmpty()
	@ValidateNested()
	@Type( () => ClientDataDto )
	clientData : ClientDataDto;


	@ApiProperty( {
		description : 'Items incluidos en la cotización',
	} )
	@IsNotEmpty()
	@ValidateNested()
	@Type( () => ItemsDto )
	items : ItemsDto;

}
