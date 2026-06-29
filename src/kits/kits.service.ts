import { Response } from 'express';

import {
    Injectable,
    ConflictException,
    BadRequestException
} from '@nestjs/common';

import { ulid } from 'ulid';

import {
    getFileNameWithExtension,
    mapResourceTypeToAttachmentType,
    matchFileByName
}                                   from '@common/utils/file.utils';
import {
	normalizeText,
	searchKitIds
} from '@common/utils/search.utils';
import {
    FileManagerService,
    ResponeFileUpload
}                                   from '@services/file-manager.service';
import { ExportService }            from '@services/export.service';
import { PaginatedResult }          from '@common/interfaces/paginated-result.interface';
import { PrismaException }          from '@prisma/prisma-catch';
import { PrismaService }            from '@prisma/prisma.service';
import { Kit, Prisma }              from '@prisma/client';
import { CreatePriceHistoryService }  from '@common/service/create-price-history.service';
import { ENVS }                     from '@config/envs';
import { IKit, IKitProduct }        from '@kits/models/kit.interface';
import { CreateKitDto }             from '@kits/dto/create-kit.dto';
import { UpdateKitDto }             from '@kits/dto/update-kit.dto';
import { FileConfigDto }            from '@common/dto/file-config.dto';
import { UpdateKitFilesDto }        from '@kits/dto/update-kit-files.dto';
import { DeleteKitFilesDto }        from '@kits/dto/delete-kit-files.dto';
import { KitProductDto }            from '@kits/dto/kit-product.dto';
import { DeleteKitProductsDto }     from '@kits/dto/delete-kit-products.dto';
import { KitPaginationFilterDto }   from '@kits/dto/pagination-filter.dto';
import { ExportKitDto }             from '@kits/dto/export-kit.dto';
import { FileType }                 from '@common/dto/file-type.dto';
import { IncludesKitDto }           from '@kits/dto/includes.dto';
import { SubCategoryOrderField }    from '@common/dto/pagination.dto';
import { getKitSelect }             from '@kits/utils/kit-select.utils';



@Injectable()
export class KitsService {

	constructor(
		private readonly prisma                    : PrismaService,
		private readonly fileManagerService        : FileManagerService,
		private readonly createPriceHistoryService : CreatePriceHistoryService,
		private readonly exportService             : ExportService,
	) {}




	async create( createKitDto: CreateKitDto, files?: Express.Multer.File[] ): Promise<IKit> {
		const {
			sku,
			name,
			description,
			categoryId,
			active,
            currentPrice,
            currentStock,
            minStock,
            maxStock,
			filesInfo,
			products,
			files: _,
		} = createKitDto;

		const kitId = ulid();

		let uploadedFiles: Array<ResponeFileUpload> = [];

		try {
			// Validar unicidad de SKU
			const existingSku = await this.prisma.kit.findUnique( {
				where : { sku },
			} );

			if ( existingSku ) {
				throw new ConflictException( `Ya existe un kit con el SKU "${ sku }"` );
			}

			// Validar unicidad de Nombre
			const existingName = await this.prisma.kit.findUnique( {
				where : { name },
			} );

			if ( existingName ) {
				throw new ConflictException( `Ya existe un kit con el nombre "${ name }"` );
			}

			// Validar existencia de categoría
			await this.prisma.kitCategory.findUniqueOrThrow( {
				where : { id : categoryId },
			} );

			if ( files && files.length > 0 ) {
				const response = await this.fileManagerService.uploadMultiple( files, 'kits', kitId );
				uploadedFiles = response;
			}

			let hasMainAssigned = false;
			let visualIndex     = 0;

			const filesCreate = uploadedFiles.map( ( item, index ) => {
				const type          = mapResourceTypeToAttachmentType( item.resource_type, item.secure_url );
				const isVisual      = type === 'IMAGE' || type === 'VIDEOS';
				const originalName  = files?.[ index ]?.originalname;
				const info          = filesInfo?.find( ( img ) => matchFileByName( item.secure_url, img.name || originalName || '' ) ) || filesInfo?.[ index ];

				let isMain               = false;
				let order: number | null = null;

				if ( isVisual ) {
					isMain = info?.isMain ?? ( !hasMainAssigned && visualIndex === 0 );
					if ( isMain ) {
						hasMainAssigned = true;
					}
					order = info?.order ?? visualIndex;
					visualIndex++;
				}

				return {
					url            : getFileNameWithExtension( item.secure_url ),
					alt            : info?.alt || null,
					isMain,
					order,
					attachmentType : type,
				};
			} );

			const productsCreate = products?.map( item => ( {
				productId : item.productId,
				quantity  : item.quantity ?? 1,
			} ) ) || [];

			return await this.prisma.$transaction( async ( tx ) => {
				const newKit = await tx.kit.create( {
					data : {
						id : kitId,
						sku,
						name,
						description,
						categoryId,
						active,
                        currentPrice,
                        currentStock,
                        minStock,
                        maxStock,
						...( filesCreate.length > 0 && {
							files : {
								create : filesCreate,
							},
						} ),
						...( productsCreate.length > 0 && {
							products : {
								create : productsCreate,
							},
						} ),
					},
					select : getKitSelect( true, true ),
				} ) as unknown as IKit;

				await this.createPriceHistoryService.execute( tx, kitId, null, currentPrice, 'kit' );

				return newKit;
			} );
		} catch ( error ) {
			if ( uploadedFiles.length > 0 ) {
				try {
					await this.fileManagerService.deleteFolder( 'kits', kitId );
				} catch ( deleteError ) {
					console.error( 'Error al eliminar archivos de Cloudinary para el Kit:', deleteError );
				}
			}

			throw PrismaException.catch( error, 'Kits' );
		}
	}


	async findAll( filterDto: KitPaginationFilterDto ): Promise<PaginatedResult<IKit>> {
		try {
			const {
				page = 1,
				size = 10,
				query,
				active,
				categories,
				includeFiles = false,
				includeProducts = false,
				orderBy = SubCategoryOrderField.NAME,
				order = 'asc',
			} = filterDto;

			const skip = ( page - 1 ) * size;

			let where: Prisma.KitWhereInput = {
				...( active !== undefined && { active } ),
				...( categories && categories.length > 0 && { categoryId : { in : categories } } ),
			};

			if ( query ) {
				const normalized = normalizeText( query );
				const pattern    = `%${ normalized }%`;

				if ( query.toLowerCase( ).startsWith( 'c' ) ) {
					const skuIds = await searchKitIds( this.prisma, pattern, true );

					if ( skuIds.length > 0 ) {
						where = {
							...where,
							id : { in : skuIds },
						};
					} else {
						const nameIds = await searchKitIds( this.prisma, pattern, false );
						where = {
							...where,
							id : { in : nameIds },
						};
					}
				} else {
					const nameIds = await searchKitIds( this.prisma, pattern, false );
					where = {
						...where,
						id : { in : nameIds },
					};
				}
			}

			const [ total, data ] = await Promise.all( [
				this.prisma.kit.count( { where } ),
				this.prisma.kit.findMany( {
					where,
					skip,
					take    : size,
					select  : getKitSelect( includeFiles, includeProducts ),
					orderBy : { [ orderBy ] : order },
				} ) as unknown as IKit[],
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
			throw PrismaException.catch( error, 'Kits' );
		}
	}


	async findOne(
		id: string,
		includesKitDto?: IncludesKitDto,
		getAllStatus: boolean = false,
	): Promise<IKit> {
		try {
			const includeFiles    = includesKitDto?.includeFiles ?? true;
			const includeProducts = includesKitDto?.includeProducts ?? true;
			const dtoGetAllStatus = includesKitDto?.getAllStatus ?? false;
			const isGetAll        = getAllStatus || dtoGetAllStatus || false;
			const where : Prisma.KitWhereInput = { id };

			if ( !isGetAll ) {
				where.active = true;
			}

			return await this.prisma.kit.findUniqueOrThrow( {
				select : getKitSelect( includeFiles, includeProducts ),
				where  : where as any,
			} ) as unknown as IKit;
		} catch ( error ) {
			throw PrismaException.catch( error, 'Kits' );
		}
	}


	async update( id: string, updateKitDto: UpdateKitDto ): Promise<IKit> {
		try {
			const {
				filesInfo,
				products,
				files,
				...data
			} = updateKitDto;

			return await this.prisma.$transaction( async ( tx ) => {
				// Validar existencia del kit y obtener su precio actual
				const existing = await tx.kit.findUniqueOrThrow( {
					where : { id },
				} );

				// Validar unicidad de SKU si cambia
				if ( data.sku ) {
					const existingSku = await tx.kit.findFirst( {
						where : {
							sku : data.sku,
							id  : { not : id },
						},
					} );

					if ( existingSku ) {
						throw new ConflictException( `Ya existe otro kit con el SKU "${ data.sku }"` );
					}
				}

				// Validar unicidad de Nombre si cambia
				if ( data.name ) {
					const existingName = await tx.kit.findFirst( {
						where : {
							name : data.name,
							id   : { not : id },
						},
					} );

					if ( existingName ) {
						throw new ConflictException( `Ya existe otro kit con el nombre "${ data.name }"` );
					}
				}

				// Validar existencia de categoría si cambia
				if ( data.categoryId ) {
					await tx.kitCategory.findUniqueOrThrow( {
						where : { id : data.categoryId },
					} );
				}

				await this.createPriceHistoryService.execute(
                    tx,
                    id,
                    existing.currentPrice,
                    data.currentPrice,
                    'kit'
                );

				return await tx.kit.update( {
					where  : { id },
					data,
					select : getKitSelect( true, true ),
				} ) as unknown as IKit;
			} );
		} catch ( error ) {
			throw PrismaException.catch( error, 'Kits' );
		}
	}


	async remove( id: string ): Promise<Kit> {
		try {
			// Recuperar archivos del kit
			const kitFiles = await this.prisma.kitFile.findMany({
				where : { kitId : id },
			});

			if ( kitFiles.length > 0 ) {
                try {
                    await this.fileManagerService.deleteFolder( 'kits', id );
                } catch ( deleteError ) {
                    console.error( 'Error al eliminar archivos de Cloudinary para el Kit:', deleteError );
                }
			}

			// Debido a onDelete: Cascade, Prisma elimina en cascada las relaciones dependientes en la BD
			return await this.prisma.kit.delete({
				where : { id },
			});
		} catch ( error ) {
			throw PrismaException.catch( error, 'Kits' );
		}
	}


	async uploadKitFiles(
		kitId: string,
		files: Express.Multer.File[],
		filesInfo?: FileConfigDto[],
	): Promise<IKit> {
		try {
			const currentFiles = await this.prisma.kitFile.findMany( {
				where   : { kitId },
				orderBy : { order : 'asc' },
			} );

			const currentCount = currentFiles.length;
			const limit        = ENVS.FILE_UPLOAD_LIMIT;

			if ( currentCount >= limit ) {
				throw new BadRequestException( `El kit ya tiene el límite de ${ limit } archivos` );
			}

			if ( currentCount + files.length > limit ) {
				throw new BadRequestException(
					`No se pueden subir ${ files.length } archivos. El límite es ${ limit } y ya tiene ${ currentCount }.`
				);
			}

			if ( !files || files.length === 0 ) {
				throw new BadRequestException( 'No se proporcionaron archivos para subir' );
			}

			const uploadedFiles = await this.fileManagerService.uploadMultiple( files, 'kits', kitId );

			const maxOrder = currentFiles.reduce( ( max, img ) => ( img.order !== null && img.order > max ) ? img.order : max, -1 );
			let nextOrder  = maxOrder + 1;

			const hasMain       = currentFiles.some( img => img.isMain );
			let hasMainAssigned = hasMain;
			let visualIndex     = 0;

			const filesCreate = uploadedFiles.map( ( item, index ) => {
				const type          = mapResourceTypeToAttachmentType( item.resource_type, item.secure_url );
				const isVisual      = type === 'IMAGE' || type === 'VIDEOS';
				const originalName  = files[ index ]?.originalname;
				const info          = filesInfo?.find( ( img ) => matchFileByName( item.secure_url, img.name || originalName || '' ) ) || filesInfo?.[ index ];

				let isMain               = false;
				let order: number | null = null;

				if ( isVisual ) {
					isMain = info?.isMain ?? ( !hasMainAssigned && visualIndex === 0 );
					if ( isMain ) {
						hasMainAssigned = true;
					}
					order = info?.order ?? nextOrder++;
					visualIndex++;
				}

				return {
					url            : getFileNameWithExtension( item.secure_url ),
					alt            : info?.alt || null,
					isMain,
					order,
					attachmentType : type,
				};
			} );

			await this.prisma.kit.update( {
				where : { id : kitId },
				data  : {
					files : {
						create : filesCreate,
					},
				},
			} );

			return await this.findOne( kitId, { includeFiles : true }, true );
		} catch ( error ) {
			throw PrismaException.catch( error, 'Kits' );
		}
	}


	async updateKitFilesInfo(
		kitId: string,
		updateKitFilesDto: UpdateKitFilesDto,
	): Promise<IKit> {
		try {
			const { filesInfo } = updateKitFilesDto;

			const currentFiles = await this.prisma.kitFile.findMany( {
				where : { kitId },
			} );

			if ( currentFiles.length !== filesInfo.length ) {
				throw new BadRequestException( 'Se deben proporcionar todos los archivos del kit' );
			}

			const currentFileIds    = currentFiles.map( file => file.id );
			const incomingIds       = filesInfo.map( info => info.id );
			const hasAllIds         = incomingIds.every( id => currentFileIds.includes( id ) );

			if ( !hasAllIds ) {
				throw new BadRequestException( 'Uno o más archivos no pertenecen a este kit' );
			}

			const normalizedInfo = filesInfo.map( info => {
				const currentFile = currentFiles.find( file => file.id === info.id );

				return {
					id             : info.id,
					alt            : info.alt !== undefined ? info.alt : currentFile?.alt,
					isMain         : info.isMain,
					order          : info.order !== undefined ? info.order : currentFile?.order,
					attachmentType : currentFile?.attachmentType,
				};
			} );

			normalizedInfo.sort( ( a, b ) => ( a?.order || 0 ) - ( b?.order || 0 ) );

			const hasMainTrue = normalizedInfo.some( info => info.isMain === true );
			let mainAssigned  = false;

			let visualIndex = 0;

			normalizedInfo.forEach( ( info ) => {
				const isVisual = info.attachmentType === 'IMAGE' || info.attachmentType === 'VIDEOS';

				if ( isVisual ) {
					info.order = visualIndex;
					visualIndex++;

					if ( hasMainTrue ) {
						if ( info.isMain === true && !mainAssigned ) {
							info.isMain  = true;
							mainAssigned = true;
						} else {
							info.isMain = false;
						}
					} else {
						info.isMain = info.order === 0;
					}
				} else {
					info.order  = null;
					info.isMain = false;
				}
			} );

			await this.prisma.$transaction(
				normalizedInfo.map( info =>
					this.prisma.kitFile.update( {
						where : { id : info.id },
						data  : {
							alt    : info.alt,
							isMain : info.isMain,
							order  : info.order,
						},
					} )
				)
			);

			return await this.findOne( kitId, { includeFiles : true }, true );
		} catch ( error ) {
			throw PrismaException.catch( error, 'Kits' );
		}
	}


	async deleteKitFile( kitId: string, fileId: string ): Promise<{ message: string }> {
		try {
			const file = await this.prisma.kitFile.findFirstOrThrow( {
				where : {
					id    : fileId,
					kitId : kitId,
				},
			} );

			await this.fileManagerService.deleteFiles( 'kits', kitId, [ file.url ] );

			await this.prisma.kitFile.delete( {
				where : { id : fileId },
			} );

			if ( file.isMain ) {
				const nextMainFile = await this.prisma.kitFile.findFirst( {
					where : {
						kitId,
						id : { not : fileId },
					},
					orderBy : {
						order : 'asc',
					},
				} );

				if ( nextMainFile ) {
					await this.prisma.kitFile.update( {
						where : { id : nextMainFile.id },
						data  : { isMain : true },
					} );
				}
			}

			return { message : 'Archivo eliminado exitosamente' };
		} catch ( error ) {
			throw PrismaException.catch( error, 'Kits' );
		}
	}


	async deleteKitFiles(
		kitId: string,
		deleteKitFilesDto: DeleteKitFilesDto,
	): Promise<{ message: string }> {
		try {
			const { files } = deleteKitFilesDto;

			const dbFiles = await this.prisma.kitFile.findMany( {
				where : {
					id    : { in : files },
					kitId : kitId,
				},
			} );

			if ( dbFiles.length !== files.length ) {
				throw new BadRequestException( 'Uno o más archivos no fueron encontrados o no pertenecen al kit' );
			}

			const fileNames = dbFiles.map( file => file.url );

			await this.fileManagerService.deleteFiles( 'kits', kitId, fileNames );

			await this.prisma.kitFile.deleteMany( {
				where : {
					id : { in : files },
				},
			} );

			const hasMainDeleted = dbFiles.some( file => file.isMain === true );

			if ( hasMainDeleted ) {
				const nextMainFile = await this.prisma.kitFile.findFirst( {
					where : {
						kitId,
						id : { notIn : files },
					},
					orderBy : {
						order : 'asc',
					},
				} );

				if ( nextMainFile ) {
					await this.prisma.kitFile.update( {
						where : { id : nextMainFile.id },
						data  : { isMain : true },
					} );
				}
			}

			return { message : 'Archivos eliminados exitosamente' };
		} catch ( error ) {
			throw PrismaException.catch( error, 'Kits' );
		}
	}


	// --- GESTIÓN DE PRODUCTOS ASOCIADOS (KitProduct) ---

	async addKitProducts( kitId: string, products: KitProductDto[] ): Promise<IKit> {
		try {
			// Validar existencia del kit
			await this.prisma.kit.findUniqueOrThrow( {
				where : { id : kitId },
			} );

			// Usamos una transacción limpia para hacer upsert granular por cada producto
			await this.prisma.$transaction(
				products.map( item =>
					this.prisma.kitProduct.upsert( {
						where : {
							productId_kitId : {
								productId : item.productId,
								kitId,
							},
						},
						update : {
							quantity : item.quantity ?? 1,
						},
						create : {
							productId : item.productId,
							kitId,
							quantity  : item.quantity ?? 1,
						},
					} )
				)
			);

			return await this.findOne( kitId, { includeProducts : true }, true );
		} catch ( error ) {
			throw PrismaException.catch( error, 'Kits' );
		}
	}


	async updateKitProduct( kitId: string, productId: string, quantity: number ): Promise<IKitProduct> {
		try {
			// Validar existencia de la relación kit-producto
			const currentRelation = await this.prisma.kitProduct.findUniqueOrThrow( {
				where : {
					productId_kitId : {
						productId,
						kitId,
					},
				},
			} );

			return await this.prisma.kitProduct.update( {
				where : {
					id : currentRelation.id,
				},
				data : {
					quantity,
				},
			} ) as unknown as IKitProduct;
		} catch ( error ) {
			throw PrismaException.catch( error, 'Kits' );
		}
	}


	async deleteKitProduct( kitId: string, productId: string ): Promise<{ message: string }> {
		try {
			const currentRelation = await this.prisma.kitProduct.findUniqueOrThrow( {
				where : {
					productId_kitId : {
						productId,
						kitId,
					},
				},
			} );

			await this.prisma.kitProduct.delete( {
				where : { id : currentRelation.id },
			} );

			return { message : 'Producto eliminado del kit exitosamente' };
		} catch ( error ) {
			throw PrismaException.catch( error, 'Kits' );
		}
	}


	async deleteKitProducts( kitId: string, deleteKitProductsDto: DeleteKitProductsDto ): Promise<{ message: string }> {
		try {
			const { ids } = deleteKitProductsDto;

			const kitProducts = await this.prisma.kitProduct.findMany( {
				where : {
					id : { in : ids },
					kitId,
				},
			} );

			if ( kitProducts.length !== ids.length ) {
				throw new BadRequestException( 'Uno o más productos no pertenecen a este kit' );
			}

			await this.prisma.kitProduct.deleteMany( {
				where : {
					id : { in : ids },
					kitId,
				},
			} );

			return { message : 'Productos eliminados del kit exitosamente' };
		} catch ( error ) {
			throw PrismaException.catch( error, 'Kits' );
		}
	}


	async export( res: Response, exportKitDto: ExportKitDto ): Promise<void> {
		try {
			const {
				fileType,
				filename,
				query,
				categories,
				active,
				getAllStatus,
			} = exportKitDto;

			let where: Prisma.KitWhereInput = {
				...( categories && categories.length > 0 && { categoryId : { in : categories } } ),
			};

			if ( !getAllStatus ) {
				where.active = active !== undefined ? active : true;
			} else if ( active !== undefined ) {
				where.active = active;
			}

			if ( query ) {
				const normalized = normalizeText( query );
				const pattern    = `%${ normalized }%`;

				if ( query.toLowerCase( ).startsWith( 'c' ) ) {
					const skuIds = await searchKitIds( this.prisma, pattern, true );

					if ( skuIds.length > 0 ) {
						where = {
							...where,
							id : { in : skuIds },
						};
					} else {
						const nameIds = await searchKitIds( this.prisma, pattern, false );
						where = {
							...where,
							id : { in : nameIds },
						};
					}
				} else {
					const nameIds = await searchKitIds( this.prisma, pattern, false );
					where = {
						...where,
						id : { in : nameIds },
					};
				}
			}

			let finalFilename = filename;

			if ( !finalFilename ) {
				const now     = new Date( );
				const year    = now.getFullYear( );
				const month   = String( now.getMonth( ) + 1 ).padStart( 2, '0' );
				const day     = String( now.getDate( ) ).padStart( 2, '0' );
				const hours   = String( now.getHours( ) ).padStart( 2, '0' );
				const minutes = String( now.getMinutes( ) ).padStart( 2, '0' );
				finalFilename = `kits_${ year }${ month }${ day }_${ hours }${ minutes }`;
			}

			const columns = [
				{ header : 'SKU', key : 'sku', width : 15 },
				{ header : 'Nombre', key : 'name', width : 30 },
				{ header : 'Categoría', key : 'category', width : 25 },
				{ header : 'Estado', key : 'active', width : 12 },
				{ header : 'Fecha Creación', key : 'createdAt', width : 20 },
				{ header : 'Fecha Actualización', key : 'updatedAt', width : 20 },
			];

			const dataProvider = async ( skip: number, take: number ) => {
				const kits = await this.prisma.kit.findMany( {
					where,
					skip,
					take,
					select : {
						sku       : true,
						name      : true,
						active    : true,
						createdAt : true,
						updatedAt : true,
						category  : { select : { name : true } },
					},
					orderBy : { name : 'asc' },
				} );

				return kits.map( ( k ) => ( {
					sku       : k.sku,
					name      : k.name,
					category  : k.category?.name || '',
					active    : k.active,
					createdAt : k.createdAt,
					updatedAt : k.updatedAt,
				} ) );
			};

			if ( fileType === FileType.EXCEL ) {
				await this.exportService.exportToExcelStream( res, finalFilename, columns, dataProvider );
			} else {
				await this.exportService.exportToPdfStream( res, finalFilename, 'Reporte de Kits', columns, dataProvider );
			}
		} catch ( error ) {
			throw PrismaException.catch( error, 'Kits' );
		}
	}

}
