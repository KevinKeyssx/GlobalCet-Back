import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';

import { Quote, QuoteStatus, Prisma } from '@prisma/client';

import {
    QuotePaginationFilterDto,
    QuoteOrderField
}                                   from '@quotes/dto/quote-pagination-filter.dto';
import {
    getQuoteStatusUpdateTemplate,
    getQuoteStatusConfig
}                                   from '@common/utils/templates/quote-status-update.template';
import { PaginatedResult }          from '@common/interfaces/paginated-result.interface';
import { getClientQuoteTemplate }   from '@common/utils/templates/client-quote.template';
import { getAdminQuoteTemplate }    from '@common/utils/templates/admin-quote.template';
import { ENVS }                     from '@config/envs';
import { EmailService }             from '@services/email/email.service';
import { PrismaService }            from '@prisma/prisma.service';
import { PrismaException }          from '@prisma/prisma-catch';
import { CreateQuoteDto }           from '@quotes/dto/create-quote.dto';
import { ClientDataDto }            from '@quotes/dto/client-data.dto';
import { ItemsDto, ItemDto }        from '@quotes/dto/items.dto';
import { UpdateQuoteDto }           from '@quotes/dto/update-quote.dto';
import { UpdateQuoteStatusDto }     from '@quotes/dto/update-quote-status.dto';
import { IQuoteItem }               from '@quotes/interfaces/quote-item.interface';
import { IQuoteStockResponse }      from '@quotes/interfaces/quote-stocks.interface';


@Injectable()
export class QuotesService {

	constructor(
		private readonly prisma       : PrismaService,
		private readonly emailService : EmailService,
	) {}


    async create( createQuoteDto: CreateQuoteDto ): Promise<any> {
		try {
			const { clientData, items } = createQuoteDto;

			const snapshotItems = await this.#buildSnapshotItems( items );

			const currentYear = new Date().getFullYear();
			const quotesThisYear = await this.prisma.quote.count( {
				where : {
					createdAt : {
						gte : new Date( `${ currentYear }-01-01T00:00:00.000Z` ),
					},
				},
			} );

			const nextSequence   = quotesThisYear;
			const paddedSequence = String( nextSequence ).padStart( 6, '0' );
			const quoteNumber    = `GC-${ currentYear }-${ paddedSequence }`;

			const newQuote = await this.prisma.quote.create( {
				data : {
					quoteNumber,
					clientData  : clientData as any,
					items       : snapshotItems as any,
					status      : QuoteStatus.PENDING,
				},
				select : {
					id          : true,
					quoteNumber : true,
					status      : true,
					createdAt   : true,
					updatedAt   : true,
				},
			} );

			this.#sendQuoteNotifications( quoteNumber, clientData, snapshotItems ).catch( ( err ) => {
				console.error( 'Error enviando notificaciones de cotización:', err );
			});

			return newQuote;
		} catch ( error ) {
			throw PrismaException.catch( error, 'Quote' );
		}
	}


	async findAll( filterDto: QuotePaginationFilterDto ): Promise<PaginatedResult<Quote>> {
		try {
			const {
				page    = 1,
				size    = 10,
				query,
				status,
				orderBy = QuoteOrderField.CREATED_AT,
				order   = 'asc',
			} = filterDto;

			const skip = ( page - 1 ) * size;

			const where : Prisma.QuoteWhereInput = {
				...( status && status.length > 0 && { status : { in : status }}),
			};

			if ( query ) {
				where.quoteNumber = {
					contains : query,
					mode     : 'insensitive',
				};
			}

			const [ total, data ] = await Promise.all( [
				this.prisma.quote.count( { where } ),
				this.prisma.quote.findMany( {
					where,
					skip,
					take    : size,
					orderBy : {
						[ orderBy ] : order,
					},
				} ),
			] );

			return {
				data,
				meta : {
					total,
					page,
					size,
					totalPages : Math.ceil( total / size ),
				},
			};
		} catch ( error ) {
			throw PrismaException.catch( error, 'Quote' );
		}
	}


	async findOne( id: string ): Promise<Quote> {
		try {
			return await this.prisma.quote.findUniqueOrThrow( {
				where : { id },
			} );
		} catch ( error ) {
			throw PrismaException.catch( error, 'Quote' );
		}
	}


	async update( id: string, updateQuoteDto: UpdateQuoteDto ): Promise<Quote> {
		try {
			const { clientData, items, adminNotes } = updateQuoteDto;

			const quote = await this.prisma.quote.findUniqueOrThrow( {
				where : { id },
			} );

			if (
				quote.status === QuoteStatus.COMPLETED ||
				quote.status === QuoteStatus.CANCELLED ||
				quote.status === QuoteStatus.ACCEPTED
			) {
				throw new BadRequestException(
					`No se pueden modificar los datos de una cotización en estado ${ quote.status }`
				);
			}

			let snapshotItems : IQuoteItem[] | undefined = undefined;

			if ( items ) {
				snapshotItems = await this.#buildSnapshotItems( items );
			}

			return await this.prisma.quote.update( {
				where : { id },
				data  : {
					...( clientData && { clientData : clientData as any } ),
					...( snapshotItems && { items : snapshotItems as any } ),
					...( adminNotes !== undefined && { adminNotes } ),
				},
			} );
		} catch ( error ) {
			throw PrismaException.catch( error, 'Quote' );
		}
	}


	async updateStatus( id: string, updateQuoteStatusDto: UpdateQuoteStatusDto ): Promise<Quote> {
		try {
			const updatedQuote = await this.prisma.$transaction( async ( tx ) => {
				const quote = await tx.quote.findUniqueOrThrow( {
					where : { id },
				} );

				const oldStatus = quote.status;
				const newStatus = updateQuoteStatusDto.status;

				if ( oldStatus === newStatus ) {
					return quote;
				}

				if ( oldStatus === QuoteStatus.CANCELLED ) {
					throw new BadRequestException(
						'No se pueden realizar cambios en una cotización cancelada'
					);
				}

				if ( oldStatus === QuoteStatus.COMPLETED && newStatus === QuoteStatus.PENDING ) {
					throw new BadRequestException(
						'No se puede cambiar una cotización de completada a pendiente'
					);
				}

				const snapshotItems = ( quote.items as unknown as IQuoteItem[] ) || [];

				if ( newStatus === QuoteStatus.COMPLETED && oldStatus !== QuoteStatus.COMPLETED ) {
					for ( const item of snapshotItems ) {
						const quantity = item.quantity;

                        if ( item.type === 'product' ) {
							const prod = await tx.product.findUniqueOrThrow( { where : { id : item.id } } );
							const currentStock = prod.currentStock ?? 0;
							const nextStock    = currentStock - quantity;

                            if ( nextStock < 0 && !ENVS.ALLOW_NEGATIVE_STOCK ) {
								throw new BadRequestException(
									`Stock insuficiente para el producto '${ prod.name }'. Disponible: ${ currentStock }, Requerido: ${ quantity }`
								);
							}

                            await tx.product.update( {
								where : { id : item.id },
								data  : { currentStock : nextStock },
							} );
						} else if ( item.type === 'kit' ) {
							const kit = await tx.kit.findUniqueOrThrow( { where : { id : item.id } } );
							const currentStock = kit.currentStock ?? 0;
							const nextStock    = currentStock - quantity;

                            if ( nextStock < 0 && !ENVS.ALLOW_NEGATIVE_STOCK ) {
								throw new BadRequestException(
									`Stock insuficiente para el kit '${ kit.name }'. Disponible: ${ currentStock }, Requerido: ${ quantity }`
								);
							}

                            await tx.kit.update( {
								where : { id : item.id },
								data  : { currentStock : nextStock },
							} );
						} else if ( item.type === 'mobileLab' ) {
							const lab = await tx.mobileLab.findUniqueOrThrow( { where : { id : item.id } } );
							const currentStock = lab.currentStock ?? 0;
							const nextStock    = currentStock - quantity;

                            if ( nextStock < 0 && !ENVS.ALLOW_NEGATIVE_STOCK ) {
								throw new BadRequestException(
									`Stock insuficiente para el laboratorio móvil '${ lab.name }'. Disponible: ${ currentStock }, Requerido: ${ quantity }`
								);
							}

                            await tx.mobileLab.update( {
								where : { id : item.id },
								data  : { currentStock : nextStock },
							} );
						}
					}
				}

				if ( oldStatus === QuoteStatus.COMPLETED && newStatus !== QuoteStatus.COMPLETED ) {
					for ( const item of snapshotItems ) {
						const quantity = item.quantity;

                        if ( item.type === 'product' ) {
							const prod = await tx.product.findUniqueOrThrow( { where : { id : item.id } } );
							const nextStock = ( prod.currentStock ?? 0 ) + quantity;

                            await tx.product.update( {
								where : { id : item.id },
								data  : { currentStock : nextStock },
							});
						} else if ( item.type === 'kit' ) {
							const kit = await tx.kit.findUniqueOrThrow( { where : { id : item.id } } );
							const nextStock = ( kit.currentStock ?? 0 ) + quantity;

                            await tx.kit.update( {
								where : { id : item.id },
								data  : { currentStock : nextStock },
							} );
						} else if ( item.type === 'mobileLab' ) {
							const lab = await tx.mobileLab.findUniqueOrThrow( { where : { id : item.id } } );
							const nextStock = ( lab.currentStock ?? 0 ) + quantity;

                            await tx.mobileLab.update( {
								where : { id : item.id },
								data  : { currentStock : nextStock },
							} );
						}
					}
				}

				return await tx.quote.update( {
					where : { id },
					data  : { status : newStatus },
				} );
			} );

            const clientData    = updatedQuote.clientData as unknown as ClientDataDto;
			const snapshotItems = ( updatedQuote.items as unknown as IQuoteItem[] ) || [];

			this.#sendStatusUpdateNotification( updatedQuote.quoteNumber, clientData, snapshotItems, updateQuoteStatusDto.status ).catch( ( err ) => {
				console.error( 'Error enviando notificación de cambio de estado:', err );
			} );

			return updatedQuote;
		} catch ( error ) {
			throw PrismaException.catch( error, 'Quote' );
		}
	}


	async getStocks(id: string, updateQuoteStatusDto: UpdateQuoteStatusDto): Promise<IQuoteStockResponse[]> {
		try {
			const quote = await this.prisma.quote.findUniqueOrThrow({
				where: {id},
			});

			const oldStatus = quote.status;
			const newStatus = updateQuoteStatusDto.status;

			if ( newStatus === oldStatus ) {
				throw new BadRequestException( "El estado no va a cambiar" );
			}

			const items = ( quote.items as unknown as IQuoteItem[] ) || [];

			const productItems      = items.filter( item => item.type === "product" );
			const kitItems          = items.filter( item => item.type === "kit" );
			const mobileLabItems    = items.filter( item => item.type === "mobileLab" );

			const [dbProducts, dbKits, dbLabs] = await Promise.all([
				this.prisma.product.findMany({
					where   : { id: { in: productItems.map( p => p.id )}},
					select  : { id: true, name: true, sku: true, active: true, currentStock: true, minStock: true, maxStock: true },
				}),
				this.prisma.kit.findMany({
					where   : { id: { in: kitItems.map( k => k.id )}},
					select  : { id: true, name: true, sku: true, active: true, currentStock: true, minStock: true, maxStock: true },
				}),
				this.prisma.mobileLab.findMany({
					where   : { id: { in: mobileLabItems.map( m => m.id )}},
					select  : { id: true, name: true, sku: true, active: true, currentStock: true, minStock: true, maxStock: true },
				}),
			]);

			const response: IQuoteStockResponse[] = [];

			for ( const item of items ) {
				let currentStock    = 0;
				let minStock        = 0;
				let maxStock        = 0;
				let sku             = "";
				let name            = "";

				if ( item.type === "product" ) {
					const prod = dbProducts.find( p => p.id === item.id );

					if ( !prod ) {
						throw new NotFoundException( `No se puede obtener el stock del producto con ID '${ item.id }' porque no existe` );
					}

					if ( !prod.active ) {
						throw new NotFoundException( `No se puede obtener el stock del producto [SKU:${ prod.sku }] porque está inactivo` );
					}

					currentStock    = prod.currentStock ?? 0;
					minStock        = prod.minStock ?? 0;
					maxStock        = prod.maxStock ?? 0;
					sku             = prod.sku;
					name            = prod.name;
				} else if ( item.type === "kit" ) {
					const kit = dbKits.find( k => k.id === item.id );

					if ( !kit ) {
						throw new NotFoundException( `No se puede obtener el stock del kit con ID '${item.id}' porque no existe` );
					}

					if ( !kit.active ) {
						throw new NotFoundException( `No se puede obtener el stock del kit [SKU:${kit.sku}] porque está inactivo` );
					}

					currentStock    = kit.currentStock ?? 0;
					minStock        = kit.minStock ?? 0;
					maxStock        = kit.maxStock ?? 0;
					sku             = kit.sku;
					name            = kit.name;
				} else if ( item.type === "mobileLab" ) {
					const lab = dbLabs.find( l => l.id === item.id );

					if ( !lab ) {
						throw new NotFoundException( `No se puede obtener el stock del laboratorio móvil con ID '${item.id}' porque no existe` );
					}

					if ( !lab.active ) {
						throw new NotFoundException( `No se puede obtener el stock del laboratorio móvil [SKU:${lab.sku}] porque está inactivo` );
					}

					currentStock    = lab.currentStock  ?? 0;
					minStock        = lab.minStock      ?? 0;
					maxStock        = lab.maxStock      ?? 0;
					sku             = lab.sku;
					name            = lab.name;
				}

				let projectedStock = currentStock;

				if ( newStatus === QuoteStatus.COMPLETED && oldStatus !== QuoteStatus.COMPLETED ) {
					projectedStock = currentStock - item.quantity;
				} else if ( oldStatus === QuoteStatus.COMPLETED && newStatus !== QuoteStatus.COMPLETED ) {
					projectedStock = currentStock + item.quantity;
				}

				response.push({
					id             : item.id,
                    name,
					sku,
					currentStock,
					minStock,
					maxStock,
					projectedStock,
					type           : item.type,
				});
			}

			return response;
		} catch ( error ) {
			throw PrismaException.catch( error, "Quote" );
		}
	}


	async #buildSnapshotItems( items: ItemsDto ): Promise<IQuoteItem[]> {
		const productQuantities   = items.products || [];
		const kitQuantities       = items.kits || [];
		const mobileLabQuantities = items.mobileLabs || [];

		const productIds   = productQuantities.map( ( p ) => p.id );
		const kitIds       = kitQuantities.map( ( k ) => k.id );
		const mobileLabIds = mobileLabQuantities.map( ( m ) => m.id );

		const [ dbProducts, dbKits, dbLabs ] = await Promise.all( [
			this.prisma.product.findMany( {
				where  : { id : { in : productIds } },
				select : { id : true, sku : true, name : true, currentPrice : true, active : true },
			} ),
			this.prisma.kit.findMany( {
				where  : { id : { in : kitIds } },
				select : { id : true, sku : true, name : true, currentPrice : true, active : true },
			} ),
			this.prisma.mobileLab.findMany( {
				where  : { id : { in : mobileLabIds } },
				select : { id : true, sku : true, name : true, currentPrice : true, active : true },
			} ),
		] );

		return [
			...this.#validateAndBuildSnapshot( productQuantities, dbProducts, 'product', 'producto' ),
			...this.#validateAndBuildSnapshot( kitQuantities, dbKits, 'kit', 'kit' ),
			...this.#validateAndBuildSnapshot( mobileLabQuantities, dbLabs, 'mobileLab', 'laboratorio móvil' ),
		];
	}


	#validateAndBuildSnapshot(
		quantities  : ItemDto[],
		dbItems     : { id : string; sku?: string; name : string; currentPrice : any; active : boolean }[],
		type        : 'product' | 'kit' | 'mobileLab',
		entityLabel : string,
	): IQuoteItem[] {
		const snapshot : IQuoteItem[] = [];

		for ( const q of quantities ) {
			const dbItem = dbItems.find( ( item ) => item.id === q.id );

			if ( !dbItem ) {
				throw new BadRequestException( `El ${ entityLabel } con ID '${ q.id }' no existe` );
			}

			if ( !dbItem.active ) {
				throw new BadRequestException( `El ${ entityLabel } [SKU:${dbItem.sku}] '${ dbItem.name }' está inactivo` );
			}

			snapshot.push( {
				id            : dbItem.id,
				name          : dbItem.name,
				priceAtMoment : dbItem.currentPrice ? Number( dbItem.currentPrice ) : 0,
				quantity      : q.quantity,
				type,
			} );
		}

		return snapshot;
	}


	async #sendQuoteNotifications(
		quoteNumber : string,
		clientData  : ClientDataDto,
		items       : IQuoteItem[],
	) : Promise<void> {
		const clientHtml = getClientQuoteTemplate( {
			quoteNumber		: quoteNumber,
			statusSpanish	: 'Pendiente',
			estimatedTime	: '24 a 48 horas hábiles',
			items			: items,
			contactName		: clientData.contactName,
			companyName		: clientData.companyName,
		} );

		const adminHtml = getAdminQuoteTemplate( {
			quoteNumber	: quoteNumber,
			clientData	: {
				companyName	: clientData.companyName,
				rut			: clientData.rut,
				address		: clientData.address,
				email		: clientData.email,
				contactName	: clientData.contactName,
				phoneNumber	: clientData.phoneNumber,
			},
			items		: items,
		} );

		await this.emailService.sendEmail( {
			to              : clientData.email,
			subject         : `Confirmación de Cotización ${ quoteNumber } - GlobalCet`,
			html            : clientHtml,
			notificationId  : quoteNumber,
		});

		await new Promise( ( resolve ) => setTimeout( resolve, 1000 ) );

		await this.emailService.sendEmail( {
			to              : ENVS.EMAIL.ADMINS,
			subject         : `Nueva Cotización ${ quoteNumber } Recibida - GlobalCet Admin`,
			html            : adminHtml,
			notificationId  : quoteNumber,
		});
	}


	async #sendStatusUpdateNotification(
		quoteNumber : string,
		clientData  : ClientDataDto,
		items       : IQuoteItem[],
		status      : QuoteStatus,
	) : Promise<void> {
		const config = getQuoteStatusConfig( status, quoteNumber );
		const html   = getQuoteStatusUpdateTemplate( {
			quoteNumber,
			status,
			contactName : clientData.contactName,
			companyName : clientData.companyName,
			items,
		} );

		await this.emailService.sendEmail( {
			to             : clientData.email,
			subject        : config.subject,
			html           : html,
			notificationId : `${ quoteNumber }_${ status }`,
		} );
	}

}
