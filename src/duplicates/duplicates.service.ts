import { Injectable }       from '@nestjs/common';
import { Prisma }           from '@prisma/client';
import { ulid }             from 'ulid';

import { PrismaException }    from '@prisma/prisma-catch';
import { PrismaService }      from '@prisma/prisma.service';
import { IKit }               from '@kits/models/kit.interface';
import { IMobileLab }         from '@mobile-labs/models/mobile-lab.interface';
import { IProduct }           from '@products/models/product.interface';
import { getProductSelect }   from '@products/utils/product-select.utils';
import { getKitSelect }       from '@kits/utils/kit-select.utils';
import { getMobileLabSelect } from '@mobile-labs/utils/mobile-lab-select.utils';


@Injectable()
export class DuplicatesService {

	constructor( private readonly prisma: PrismaService ) {}

	async duplicateProduct( id: string ): Promise< IProduct > {
		try {
			const original = await this.prisma.product.findUniqueOrThrow( {
				where : { id }
			} );

			const suffix = ulid().slice( -6 ).toUpperCase();
			const newName = `${ original.name } COPIA ${ suffix }`;
			const newSku = `${ original.sku }-copia-${ suffix }`;

			return await this.prisma.product.create( {
				data : {
					name            : newName,
					sku             : newSku,
					description     : original.description,
					technical_specs : original.technical_specs ?? {},
					active          : false,
					subcategoryId   : original.subcategoryId,
					materialId      : original.materialId
				},
				select : getProductSelect( true, false, false )
			} ) as unknown as IProduct;
		} catch ( error ) {
			throw PrismaException.catch( error, 'Product' );
		}
	}


	async duplicateKit( id: string ): Promise< IKit > {
		try {
			const original = await this.prisma.kit.findUniqueOrThrow( {
				where   : { id },
				include : { products : true }
			} );

			const suffix = ulid().slice( -6 ).toUpperCase();
			const newName = `${ original.name } COPIA ${ suffix }`;
			const newSku = `${ original.sku }-copia-${ suffix }`;

			return await this.prisma.kit.create( {
				data : {
					name        : newName,
					sku         : newSku,
					description : original.description,
					active      : false,
					categoryId  : original.categoryId,
					products    : {
						create : original.products.map( ( kp ) => ( {
							productId : kp.productId,
							quantity  : kp.quantity
						} ) )
					}
				},
				select : getKitSelect( true, true )
			} ) as unknown as IKit;
		} catch ( error ) {
			throw PrismaException.catch( error, 'Kit' );
		}
	}


	async duplicateMobileLab( id: string ): Promise< IMobileLab > {
		try {
			const original = await this.prisma.mobileLab.findUniqueOrThrow( {
				where   : { id },
				include : {
					products : true,
					kits     : true
				}
			} );

			const suffix = ulid().slice( -6 ).toUpperCase();
			const newName = `${ original.name } COPIA ${ suffix }`;
			const newSku = `${ original.sku }-copia-${ suffix }`;

			return await this.prisma.mobileLab.create( {
				data : {
					name        : newName,
					sku         : newSku,
					description : original.description,
					dimensions  : original.dimensions,
					active      : false,
					categoryId  : original.categoryId,
					products    : {
						create : original.products.map( ( mlp ) => ( {
							productId : mlp.productId,
							quantity  : mlp.quantity
						} ) )
					},
					kits        : {
						create : original.kits.map( ( mlk ) => ( {
							kitId    : mlk.kitId,
							quantity : mlk.quantity
						} ) )
					}
				},
				select : getMobileLabSelect( true, true, true )
			} ) as unknown as IMobileLab;
		} catch ( error ) {
			throw PrismaException.catch( error, 'Mobile Lab' );
		}
	}

}
