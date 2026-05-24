import { Injectable } from '@nestjs/common';

import { PrismaException }          from '@prisma/prisma-catch';
import { PrismaService }            from '@prisma/prisma.service';
import { Prisma }                   from '@prisma/client';
import { GlobalSearchQueryDto }     from './dto/global-search-query.dto';
import {
    IGlobalKit,
    IGlobalMobileLab,
    IGlobalProduct,
    IGlobalSearchResponse
}                                   from './interfaces/global-search-result.interface';


@Injectable()
export class GlobalSearchesService {

	private readonly SKU_PREFIX = 'C';


	constructor( private readonly prisma: PrismaService ) {}


	#getProductSelect(): Prisma.ProductSelect {
		return {
			id          : true,
			sku         : true,
			name        : true,
			description : true,
			active      : true,
			createdAt   : true,
			updatedAt   : true,
			files       : {
				where  : { isMain : true },
				select : {
					id             : true,
					url            : true,
					alt            : true,
					isMain         : true,
					order          : true,
					attachmentType : true,
				},
				orderBy : { order : 'asc' },
			},
			subcategory : {
				select : {
					id       : true,
					name     : true,
					category : {
						select : {
							id   : true,
							name : true,
						},
					},
				},
			},
			material : {
				select : {
					id   : true,
					name : true,
					slug : true,
				},
			},
		};
	}


	#getKitSelect(): Prisma.KitSelect {
		return {
			id          : true,
			sku         : true,
			name        : true,
			description : true,
			active      : true,
			categoryId  : true,
			createdAt   : true,
			updatedAt   : true,
			files       : {
				where  : { isMain : true },
				select : {
					id             : true,
					url            : true,
					alt            : true,
					isMain         : true,
					order          : true,
					attachmentType : true,
				},
				orderBy : { order : 'asc' },
			},
			category : {
				select : {
					id   : true,
					name : true,
				},
			},
		};
	}


	#getMobileLabSelect(): Prisma.MobileLabSelect {
		return {
			id          : true,
			sku         : true,
			name        : true,
			description : true,
			dimensions  : true,
			active      : true,
			createdAt   : true,
			updatedAt   : true,
			files       : {
				where  : { isMain : true },
				select : {
					id             : true,
					url            : true,
					alt            : true,
					isMain         : true,
					order          : true,
					attachmentType : true,
				},
				orderBy : { order : 'asc' },
			},
			category : {
				select : {
					id   : true,
					name : true,
				},
			},
		};
	}


	async search( queryDto: GlobalSearchQueryDto ): Promise<IGlobalSearchResponse> {
		try {
			const { query = '', limitPerEntity = 10, suggestion = true } = queryDto;
			const cleanQuery = query.trim();

			const isSkuQuery = cleanQuery.toUpperCase().startsWith( this.SKU_PREFIX );

			let products   : IGlobalProduct[]   = [];
			let kits       : IGlobalKit[]       = [];
			let mobileLabs : IGlobalMobileLab[] = [];

			let totalProducts   = 0;
			let totalKits       = 0;
			let totalMobileLabs = 0;
			let isSuggestion    = false;

			if ( cleanQuery ) {
				if ( isSkuQuery ) {
					const whereProduct : Prisma.ProductWhereInput = {
						sku    : { contains : cleanQuery, mode : 'insensitive' },
						active : true,
					};

					const whereKit : Prisma.KitWhereInput = {
						sku    : { contains : cleanQuery, mode : 'insensitive' },
						active : true,
					};

					const whereMobileLab : Prisma.MobileLabWhereInput = {
						sku    : { contains : cleanQuery, mode : 'insensitive' },
						active : true,
					};

					const [
						prodCount,
						prodData,
						kitCount,
						kitData,
						labCount,
						labData,
					] = await Promise.all( [
						this.prisma.product.count( { where : whereProduct } ),
						this.prisma.product.findMany( {
							where  : whereProduct,
							take   : limitPerEntity,
							select : this.#getProductSelect(),
						} ),
						this.prisma.kit.count( { where : whereKit } ),
						this.prisma.kit.findMany( {
							where  : whereKit,
							take   : limitPerEntity,
							select : this.#getKitSelect(),
						} ),
						this.prisma.mobileLab.count( { where : whereMobileLab } ),
						this.prisma.mobileLab.findMany( {
							where  : whereMobileLab,
							take   : limitPerEntity,
							select : this.#getMobileLabSelect(),
						} ),
					] );

					products   = prodData as unknown as IGlobalProduct[];
					kits       = kitData as unknown as IGlobalKit[];
					mobileLabs = labData as unknown as IGlobalMobileLab[];

					totalProducts   = prodCount;
					totalKits       = kitCount;
					totalMobileLabs = labCount;
				}

				const hasNoResults = products.length === 0 && kits.length === 0 && mobileLabs.length === 0;

				if ( !isSkuQuery || hasNoResults ) {
					const whereProduct : Prisma.ProductWhereInput = {
						name   : { contains : cleanQuery, mode : 'insensitive' },
						active : true,
					};

					const whereKit : Prisma.KitWhereInput = {
						name   : { contains : cleanQuery, mode : 'insensitive' },
						active : true,
					};

					const whereMobileLab : Prisma.MobileLabWhereInput = {
						name   : { contains : cleanQuery, mode : 'insensitive' },
						active : true,
					};

					const [
						prodCount,
						prodData,
						kitCount,
						kitData,
						labCount,
						labData,
					] = await Promise.all( [
						this.prisma.product.count( { where : whereProduct } ),
						this.prisma.product.findMany( {
							where  : whereProduct,
							take   : limitPerEntity,
							select : this.#getProductSelect(),
						} ),
						this.prisma.kit.count( { where : whereKit } ),
						this.prisma.kit.findMany( {
							where  : whereKit,
							take   : limitPerEntity,
							select : this.#getKitSelect(),
						} ),
						this.prisma.mobileLab.count( { where : whereMobileLab } ),
						this.prisma.mobileLab.findMany( {
							where  : whereMobileLab,
							take   : limitPerEntity,
							select : this.#getMobileLabSelect(),
						} ),
					] );

					products   = prodData as unknown as IGlobalProduct[];
					kits       = kitData as unknown as IGlobalKit[];
					mobileLabs = labData as unknown as IGlobalMobileLab[];

					totalProducts   = prodCount;
					totalKits       = kitCount;
					totalMobileLabs = labCount;
				}
			}

			const finalHasNoResults = products.length === 0 && kits.length === 0 && mobileLabs.length === 0;

			if ( finalHasNoResults && suggestion ) {
				isSuggestion = true;

				const [
					prodData,
					kitData,
					labData,
				] = await Promise.all( [
					this.prisma.product.findMany( {
						where   : { active : true },
						take    : 5,
						select  : this.#getProductSelect(),
						orderBy : { createdAt : 'desc' },
					} ),
					this.prisma.kit.findMany( {
						where   : { active : true },
						take    : 5,
						select  : this.#getKitSelect(),
						orderBy : { createdAt : 'desc' },
					} ),
					this.prisma.mobileLab.findMany( {
						where   : { active : true },
						take    : 5,
						select  : this.#getMobileLabSelect(),
						orderBy : { createdAt : 'desc' },
					} ),
				] );

				products   = prodData as unknown as IGlobalProduct[];
				kits       = kitData as unknown as IGlobalKit[];
				mobileLabs = labData as unknown as IGlobalMobileLab[];

				totalProducts   = products.length;
				totalKits       = kits.length;
				totalMobileLabs = mobileLabs.length;
			}

			return {
				products,
				kits,
				mobileLabs,
				meta : {
					totalProducts,
					totalKits,
					totalMobileLabs,
					isSuggestion,
				},
			};
		} catch ( error ) {
			throw PrismaException.catch( error );
		}
	}

}
