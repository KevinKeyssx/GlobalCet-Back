import {
	Controller,
	Get,
	Param,
	Query,
	UseGuards,
}                   from '@nestjs/common';
import {
	ApiHeader,
	ApiOperation,
	ApiParam,
	ApiResponse,
	ApiTags,
}                   from '@nestjs/swagger';

import { SecretGuard }              from '@common/guards/secret.guard';
import { PriceHistoryService }      from './price-history.service';
import { GetPriceHistoryQueryDto }  from './dto/get-price-history.dto';
import { IPriceHistoryResponse }    from './interfaces/price-history-response.interface';


@ApiTags( 'Price History' )
@UseGuards( SecretGuard )
@Controller( 'price-history' )
@ApiHeader( {
	name        : 'x-secret',
	description : 'Secret key to authenticate requests',
	required    : true,
} )
export class PriceHistoryController {

	constructor(
		private readonly priceHistoryService: PriceHistoryService
	) {}


	@Get( ':id' )
	@ApiOperation( { summary : 'Obtener el historial de precios de un ítem por su ID y tipo' } )
	@ApiParam( { name : 'id', description : 'ID del ítem (ULID)' } )
	@ApiResponse( { status : 200, description : 'Historial obtenido exitosamente.' } )
	@ApiResponse( { status : 404, description : 'Ítem no encontrado.' } )
	findOne(
		@Param( 'id' ) id: string,
		@Query() query: GetPriceHistoryQueryDto,
	): Promise<IPriceHistoryResponse[]> {
		return this.priceHistoryService.findOne( id, query.type );
	}

}
