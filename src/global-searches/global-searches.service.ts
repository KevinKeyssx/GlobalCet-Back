import { Injectable } from '@nestjs/common';

import { PrismaException }  from '@prisma/prisma-catch';
import { PrismaService }    from '@prisma/prisma.service';
import { Prisma }           from '@prisma/client';
import {
	GlobalSearchQueryDto,
	GlobalSearchFilterType
} from '@global-searches/dto/global-search-query.dto';
import {
	IGlobalKit,
	IGlobalMobileLab,
	IGlobalProduct,
	IGlobalSearchResponse,
	IGlobalSearchTotalsResponse
} from '@global-searches/interfaces/global-search-result.interface';
import {
	normalizeText,
	searchProductIds,
	searchKitIds,
	searchMobileLabIds
} from '@common/utils/search.utils';



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
				// where  : { isMain : true },
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
			createdAt   : true,
			updatedAt   : true,
			files       : {
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
            products: {
                select : {
                    quantity  : true,
                    product : {
                        select : {
                            id    : true,
                            name  : true,
                            sku   : true,
                        }
                    }
                }
            }
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
            kits : {
                select: {
                    id: true,
                    quantity: true,
                    kit: {
                        select: {
                            id: true,
                            name: true,
                            sku: true,
                        }
                    }
                }
            },
            products : {
                select : {
                    id : true,
                    quantity : true,
                    product : {
                        select : {
                            id : true,
                            name : true,
                            sku : true,
                        }
                    }
                }
            }
		};
	}


	async search( queryDto: GlobalSearchQueryDto ): Promise<IGlobalSearchResponse> {
		try {
			const {
				query         = '',
				suggestion    = true,
				page          = 1,
				size          = 10,
				order         = 'asc',
				orderBy       = 'name',
				filter,
				categories    = [],
				subcategories = [],
				materialIds   = [],
			} = queryDto;

			const cleanQuery = ( query ?? '' ).trim();
			const skip       = ( page - 1 ) * size;
			const take       = size;

			// Mapear los campos de ordenamiento por defecto
			const prismaOrder = { [ orderBy ] : order };

			let products   : IGlobalProduct[]   = [];
			let kits       : IGlobalKit[]       = [];
			let mobileLabs : IGlobalMobileLab[] = [];

			let totalProducts   = 0;
			let totalKits       = 0;
			let totalMobileLabs = 0;
			let isSuggestion    = false;

			// Determinar qué entidades buscar según el filtro y las reglas de negocio
			let shouldSearchProducts   = true;
			let shouldSearchKits       = true;
			let shouldSearchMobileLabs = true;

			if ( filter ) {
				shouldSearchProducts   = filter === GlobalSearchFilterType.PRODUCTS;
				shouldSearchKits       = filter === GlobalSearchFilterType.KITS;
				shouldSearchMobileLabs = filter === GlobalSearchFilterType.MOBILE_LABS;
			}

			// Reglas de negocio sobreescribiendo prioridades:
			// "cuando viene un subcategory la prop filter siempre debe venir como products" -> si vienen subcategories o materialIds, solo buscamos productos
			if ( subcategories.length > 0 || materialIds.length > 0 ) {
				shouldSearchProducts   = true;
				shouldSearchKits       = false;
				shouldSearchMobileLabs = false;
			}

			// "cuando vengan categories la prop filter siempre puede ser kits o mobileLabs" -> si vienen categories (y no subcategories/materialIds), excluimos productos si no se forzó products
			if ( categories.length > 0 && subcategories.length === 0 && materialIds.length === 0 ) {
				if ( !filter || filter !== GlobalSearchFilterType.PRODUCTS ) {
					shouldSearchProducts = false;
				}
			}

			// Construcción de filtros base WHERE para cada entidad
			const whereProductBase : Prisma.ProductWhereInput = {
				active : true,
				...( subcategories.length > 0 && { subcategoryId : { in : subcategories } } ),
				...( materialIds.length > 0 && { materialId : { in : materialIds } } ),
			};

			const whereKitBase : Prisma.KitWhereInput = {
				active : true,
				...( categories.length > 0 && { categoryId : { in : categories } } ),
			};

			const whereMobileLabBase : Prisma.MobileLabWhereInput = {
				active : true,
				...( categories.length > 0 && { categoryId : { in : categories } } ),
			};

			if ( !cleanQuery ) {
				// Buscar sin texto de consulta (solo filtros de listas e ID y paginación)
				const promises : Promise<any>[] = [];

				if ( shouldSearchProducts ) {
					promises.push(
						this.prisma.product.count( { where : whereProductBase } ),
						this.prisma.product.findMany( {
							where   : whereProductBase,
							skip,
							take,
							select  : this.#getProductSelect(),
							orderBy : prismaOrder,
						} )
					);
				}

				if ( shouldSearchKits ) {
					promises.push(
						this.prisma.kit.count( { where : whereKitBase } ),
						this.prisma.kit.findMany( {
							where   : whereKitBase,
							skip,
							take,
							select  : this.#getKitSelect(),
							orderBy : prismaOrder,
						} )
					);
				}

				if ( shouldSearchMobileLabs ) {
					promises.push(
						this.prisma.mobileLab.count( { where : whereMobileLabBase } ),
						this.prisma.mobileLab.findMany( {
							where   : whereMobileLabBase,
							skip,
							take,
							select  : this.#getMobileLabSelect(),
							orderBy : prismaOrder,
						} )
					);
				}

				const results = await Promise.all( promises );
				let resultIdx = 0;

				if ( shouldSearchProducts ) {
					totalProducts = results[ resultIdx++ ];
					products      = results[ resultIdx++ ] as unknown as IGlobalProduct[];
				}
				if ( shouldSearchKits ) {
					totalKits = results[ resultIdx++ ];
					kits      = results[ resultIdx++ ] as unknown as IGlobalKit[];
				}
				if ( shouldSearchMobileLabs ) {
					totalMobileLabs = results[ resultIdx++ ];
					mobileLabs      = results[ resultIdx++ ] as unknown as IGlobalMobileLab[];
				}
			} else {
				// Búsqueda inteligente con texto
				const isSkuQuery = cleanQuery.toUpperCase().startsWith( this.SKU_PREFIX );
				const normalized = normalizeText( cleanQuery );
				const pattern    = `%${ normalized }%`;

				const executeSearch = async ( isSku : boolean ) : Promise< void > => {
					const promises : Promise< any >[] = [];

					let matchedProductIds   : string[] = [];
					let matchedKitIds       : string[] = [];
					let matchedMobileLabIds : string[] = [];

					const queries : Promise< any >[] = [];

					if ( shouldSearchProducts ) {
						queries.push(
							searchProductIds( this.prisma, pattern, isSku ).then( ( ids ) => {
								matchedProductIds = ids;
							} )
						);
					}

					if ( shouldSearchKits ) {
						queries.push(
							searchKitIds( this.prisma, pattern, isSku ).then( ( ids ) => {
								matchedKitIds = ids;
							} )
						);
					}

					if ( shouldSearchMobileLabs ) {
						queries.push(
							searchMobileLabIds( this.prisma, pattern, isSku ).then( ( ids ) => {
								matchedMobileLabIds = ids;
							} )
						);
					}

					await Promise.all( queries );

					if ( shouldSearchProducts ) {
						const where : Prisma.ProductWhereInput = {
							...whereProductBase,
							id : { in : matchedProductIds },
						};
						promises.push(
							this.prisma.product.count( { where : where } ),
							this.prisma.product.findMany( {
								where   : where,
								skip    : skip,
								take    : take,
								select  : this.#getProductSelect( ),
								orderBy : prismaOrder,
							} )
						);
					}

					if ( shouldSearchKits ) {
						const where : Prisma.KitWhereInput = {
							...whereKitBase,
							id : { in : matchedKitIds },
						};
						promises.push(
							this.prisma.kit.count( { where : where } ),
							this.prisma.kit.findMany( {
								where   : where,
								skip    : skip,
								take    : take,
								select  : this.#getKitSelect( ),
								orderBy : prismaOrder,
							} )
						);
					}

					if ( shouldSearchMobileLabs ) {
						const where : Prisma.MobileLabWhereInput = {
							...whereMobileLabBase,
							id : { in : matchedMobileLabIds },
						};
						promises.push(
							this.prisma.mobileLab.count( { where : where } ),
							this.prisma.mobileLab.findMany( {
								where   : where,
								skip    : skip,
								take    : take,
								select  : this.#getMobileLabSelect( ),
								orderBy : prismaOrder,
							} )
						);
					}

					const results = await Promise.all( promises );
					let resultIdx = 0;

					if ( shouldSearchProducts ) {
						totalProducts = results[ resultIdx++ ];
						products      = results[ resultIdx++ ] as unknown as IGlobalProduct[];
					} else {
						totalProducts = 0;
						products      = [];
					}

					if ( shouldSearchKits ) {
						totalKits = results[ resultIdx++ ];
						kits      = results[ resultIdx++ ] as unknown as IGlobalKit[];
					} else {
						totalKits = 0;
						kits      = [];
					}

					if ( shouldSearchMobileLabs ) {
						totalMobileLabs = results[ resultIdx++ ];
						mobileLabs      = results[ resultIdx++ ] as unknown as IGlobalMobileLab[];
					} else {
						totalMobileLabs = 0;
						mobileLabs      = [];
					}
				};

				if ( isSkuQuery ) {
					await executeSearch( true );
				}

				const hasNoResults = products.length === 0 && kits.length === 0 && mobileLabs.length === 0;

				if ( !isSkuQuery || hasNoResults ) {
					await executeSearch( false );
				}
			}

			let suggestions : {
				products   : IGlobalProduct[];
				kits       : IGlobalKit[];
				mobileLabs : IGlobalMobileLab[];
			} | undefined = undefined;

			const finalHasNoResults = products.length === 0 && kits.length === 0 && mobileLabs.length === 0;

			if ( finalHasNoResults && suggestion ) {
				isSuggestion = true;
				suggestions  = {
					products   : [],
					kits       : [],
					mobileLabs : [],
				};

				const promises : Promise< any >[] = [];

				if ( shouldSearchProducts ) {
					promises.push(
						this.prisma.product.findMany( {
							where   : { active : true },
							take    : 5,
							select  : this.#getProductSelect(),
							orderBy : { createdAt : 'desc' },
						} )
					);
				}

				if ( shouldSearchKits ) {
					promises.push(
						this.prisma.kit.findMany( {
							where   : { active : true },
							take    : 5,
							select  : this.#getKitSelect(),
							orderBy : { createdAt : 'desc' },
						} )
					);
				}

				if ( shouldSearchMobileLabs ) {
					promises.push(
						this.prisma.mobileLab.findMany( {
							where   : { active : true },
							take    : 5,
							select  : this.#getMobileLabSelect(),
							orderBy : { createdAt : 'desc' },
						} )
					);
				}

				const results = await Promise.all( promises );
				let resultIdx = 0;

				if ( shouldSearchProducts ) {
					suggestions.products = results[ resultIdx++ ] as unknown as IGlobalProduct[];
				}
				if ( shouldSearchKits ) {
					suggestions.kits = results[ resultIdx++ ] as unknown as IGlobalKit[];
				}
				if ( shouldSearchMobileLabs ) {
					suggestions.mobileLabs = results[ resultIdx++ ] as unknown as IGlobalMobileLab[];
				}
			}

			return {
				products,
				kits,
				mobileLabs,
				meta       : {
					totalProducts,
					totalKits,
					totalMobileLabs,
					isSuggestion,
				},
				...( suggestions && { suggestions } ),
			};
		} catch ( error ) {
			throw PrismaException.catch( error );
		}
	}


	async getTotals(): Promise< IGlobalSearchTotalsResponse > {
		try {
			const [
				activeProducts,
				inactiveProducts,
				activeSubcategories,
				inactiveSubcategories,
				activeCategories,
				inactiveCategories,
				activeMaterials,
				inactiveMaterials,
				activeKits,
				inactiveKits,
				activeKitCategories,
				inactiveKitCategories,
				activeMobileLabs,
				inactiveMobileLabs,
				activeLabCategories,
				inactiveLabCategories,
			] = await Promise.all( [
				this.prisma.product.count( { where : { active : true } } ),
				this.prisma.product.count( { where : { active : false } } ),
				this.prisma.subcategory.count( { where : { active : true } } ),
				this.prisma.subcategory.count( { where : { active : false } } ),
				this.prisma.category.count( { where : { active : true } } ),
				this.prisma.category.count( { where : { active : false } } ),
				this.prisma.material.count( { where : { active : true } } ),
				this.prisma.material.count( { where : { active : false } } ),
				this.prisma.kit.count( { where : { active : true } } ),
				this.prisma.kit.count( { where : { active : false } } ),
				this.prisma.kitCategory.count( { where : { active : true } } ),
				this.prisma.kitCategory.count( { where : { active : false } } ),
				this.prisma.mobileLab.count( { where : { active : true } } ),
				this.prisma.mobileLab.count( { where : { active : false } } ),
				this.prisma.labCategory.count( { where : { active : true } } ),
				this.prisma.labCategory.count( { where : { active : false } } ),
			] );

			return {
				products : {
					catalog       : { active : activeProducts, inactive : inactiveProducts },
					subCategories : { active : activeSubcategories, inactive : inactiveSubcategories },
					categories    : { active : activeCategories, inactive : inactiveCategories },
					materials     : { active : activeMaterials, inactive : inactiveMaterials },
				},
				kits : {
					catalog    : { active : activeKits, inactive : inactiveKits },
					categories : { active : activeKitCategories, inactive : inactiveKitCategories },
				},
				mobileLabs : {
					catalog    : { active : activeMobileLabs, inactive : inactiveMobileLabs },
					categories : { active : activeLabCategories, inactive : inactiveLabCategories },
				},
			};
		} catch ( error ) {
			throw PrismaException.catch( error );
		}
	}

}

