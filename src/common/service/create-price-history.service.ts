import { Injectable }     from '@nestjs/common';

import { Prisma }         from '@prisma/client';

import { PrismaException } from '@prisma/prisma-catch';


@Injectable()
export class CreatePriceHistoryService {

	async execute(
		tx       : Prisma.TransactionClient,
		id       : string,
		oldPrice : Prisma.Decimal | number | null,
		newPrice : number | null | undefined,
		type     : 'product' | 'kit' | 'mobileLab'
	): Promise<void> {
		if ( newPrice === undefined || newPrice === null ) {
			return;
		}

		const oldPriceVal = oldPrice ? Number( oldPrice ) : null;
		const newPriceVal = Number( newPrice );

		if ( oldPriceVal !== newPriceVal ) {
			const fkField = type === 'product'
				? 'productId'
				: type === 'kit'
					? 'kitId'
					: 'mobileLabId';

			try {
				await tx.priceHistory.create( {
					data : {
						price       : newPriceVal,
						[ fkField ] : id,
						validFrom   : new Date(),
					},
				} );
			} catch ( error ) {
				throw PrismaException.catch( error, 'PriceHistory' );
			}
		}
	}

}
