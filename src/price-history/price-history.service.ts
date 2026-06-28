import { Injectable }               from '@nestjs/common';

import { PrismaException }          from '@prisma/prisma-catch';
import { PrismaService }            from '@prisma/prisma.service';
import { PriceHistoryType }         from './dto/get-price-history.dto';
import { IPriceHistoryResponse }    from './interfaces/price-history-response.interface';


@Injectable()
export class PriceHistoryService {

	constructor(
		private readonly prisma: PrismaService,
	) {}


	async findOne( id: string, type: PriceHistoryType ): Promise<IPriceHistoryResponse[]> {
		try {
			// 1. Validar la existencia del ítem según el tipo (arroja 404 si no existe)
			if ( type === PriceHistoryType.PRODUCT ) {
				await this.prisma.product.findUniqueOrThrow( { where : { id } } );
			} else if ( type === PriceHistoryType.KIT ) {
				await this.prisma.kit.findUniqueOrThrow( { where : { id } } );
			} else if ( type === PriceHistoryType.MOBILE_LAB ) {
				await this.prisma.mobileLab.findUniqueOrThrow( { where : { id } } );
			}

			// 2. Construir la consulta del historial de precios
			const where: any = {};

			if ( type === PriceHistoryType.PRODUCT ) {
				where.productId = id;
			} else if ( type === PriceHistoryType.KIT ) {
				where.kitId = id;
			} else if ( type === PriceHistoryType.MOBILE_LAB ) {
				where.mobileLabId = id;
			}

			// 3. Buscar y ordenar el historial por fecha cronológica (asc)
			const histories = await this.prisma.priceHistory.findMany( {
				where,
				orderBy : { validFrom : 'asc' },
			} );

			// 4. Mapear al formato de respuesta (un arreglo plano de registros de historial)
			return histories.map( ( h ) => ( {
				id        : h.id,
				price     : h.price.toNumber(),
				validFrom : h.validFrom,
			} ) );
		} catch ( error ) {
			throw PrismaException.catch( error, 'Price History' );
		}
	}

}
