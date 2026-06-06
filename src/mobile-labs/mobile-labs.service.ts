import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';

import { ulid } from 'ulid';
import { Prisma } from '@prisma/client';

import {
	getFileNameWithExtension,
	mapResourceTypeToAttachmentType,
}                                       from '@common/utils/file.utils';
import {
    MobileLabProductDto,
    UpdateMobileLabProductRelationDto
}                                       from '@mobile-labs/dto/mobile-lab-product.dto';
import {
    MobileLabKitDto,
    UpdateMobileLabKitRelationDto
}                                       from '@mobile-labs/dto/mobile-lab-kit.dto';
import { PrismaException }              from '@prisma/prisma-catch';
import { PaginatedResult }              from '@common/interfaces/paginated-result.interface';
import { ENVS }                         from '@config/envs';
import { PrismaService }                from '@prisma/prisma.service';
import {
    IMobileLab,
	IMobileLabProduct,
	IMobileLabKit,
}                                       from '@mobile-labs/models/mobile-lab.interface';
import { FileManagerService }           from '@services/file-manager.service';
import { CreateMobileLabDto }           from '@mobile-labs/dto/create-mobile-lab.dto';
import { UpdateMobileLabDto }           from '@mobile-labs/dto/update-mobile-lab.dto';
import { MobileLabFileConfigDto }       from '@mobile-labs/dto/mobile-lab-file-config.dto';
import { UpdateMobileLabFilesDto }      from '@mobile-labs/dto/update-mobile-lab-files.dto';
import { DeleteMobileLabFilesDto }      from '@mobile-labs/dto/delete-mobile-lab-files.dto';
import { DeleteMobileLabRelationsDto }  from '@mobile-labs/dto/delete-mobile-lab-relations.dto';
import { MobileLabPaginationFilterDto } from '@mobile-labs/dto/pagination-filter.dto';
import { IncludesMobileLabDto }         from '@mobile-labs/dto/includes.dto';


@Injectable()
export class MobileLabsService {

	constructor(
		private readonly prisma             : PrismaService,
		private readonly fileManagerService : FileManagerService,
	) {}


	#getMobileLabSelect(
		includeFiles    : boolean,
		includeProducts : boolean,
		includeKits     : boolean,
	) : Prisma.MobileLabSelect {
		return {
			id          : true,
			sku         : true,
			name        : true,
			description : true,
			dimensions  : true,
			active      : true,
			categoryId  : true,
			createdAt   : true,
			updatedAt   : true,
			files       : {
				where  : includeFiles ? {} : { isMain : true },
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
			...( includeProducts && {
				products : {
					select : {
						id        : true,
						quantity  : true,
						productId : true,
						product   : {
							select : {
								id   : true,
								name : true,
								sku  : true,
							},
						},
					},
				},
			} ),
			...( includeKits && {
				kits : {
					select : {
						id       : true,
						quantity : true,
						kitId    : true,
						kit      : {
							select : {
								id   : true,
								name : true,
								sku  : true,
							},
						},
					},
				},
			} ),
			category : {
				select : {
					id   : true,
					name : true,
				},
			},
		};
	}


	async create( createMobileLabDto : CreateMobileLabDto, files? : Express.Multer.File[] ) : Promise<IMobileLab> {
		const {
			sku,
			name,
			description,
			dimensions,
			categoryId,
			active,
			filesInfo,
			products,
			kits,
			files : _,
		} = createMobileLabDto;

		const mobileLabId = ulid();
		let uploadedFiles : Array<{ secure_url : string; public_id : string; resource_type : string }> = [];

		try {
			// Validar unicidad de SKU
			const existingSku = await this.prisma.mobileLab.findUnique( {
				where : { sku },
			} );

			if ( existingSku ) {
				throw new ConflictException( `Ya existe un laboratorio móvil con el SKU "${ sku }"` );
			}

			// Validar unicidad de Nombre
			const existingName = await this.prisma.mobileLab.findUnique( {
				where : { name },
			} );

			if ( existingName ) {
				throw new ConflictException( `Ya existe un laboratorio móvil con el nombre "${ name }"` );
			}

			// Validar existencia de categoría (la excepción P2025 se atrapará y convertirá en 404 automáticamente)
			await this.prisma.labCategory.findUniqueOrThrow( {
				where : { id : categoryId },
			} );

			// Subida de archivos
			if ( files && files.length > 0 ) {
				const response = await this.fileManagerService.uploadMultiple( files, 'labs', mobileLabId );
				uploadedFiles = response;
			}

			let hasMainAssigned = false;
			let visualIndex     = 0;

			const filesCreate = uploadedFiles.map( ( item, index ) => {
				const type     = mapResourceTypeToAttachmentType( item.resource_type, item.secure_url );
				const isVisual = type === 'IMAGE' || type === 'VIDEOS';
				const info     = filesInfo?.[ index ];

				let isMain               = false;
				let order : number | null = null;

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

			const kitsCreate = kits?.map( item => ( {
				kitId    : item.kitId,
				quantity : item.quantity ?? 1,
			} ) ) || [];

			return await this.prisma.mobileLab.create( {
				data : {
					id          : mobileLabId,
					sku,
					name,
					description,
					dimensions,
					active,
					categoryId,
					files       : {
						create : filesCreate,
					},
					products    : {
						create : productsCreate,
					},
					kits        : {
						create : kitsCreate,
					},
				},
				select : this.#getMobileLabSelect( true, true, true ),
			} ) as unknown as IMobileLab;
		} catch ( error ) {
			if ( uploadedFiles.length > 0 ) {
				try {
					await this.fileManagerService.deleteMultiple( mobileLabId );
				} catch ( deleteError ) {
					console.error( 'Error al eliminar los archivos del laboratorio móvil tras falla de creación:', deleteError );
				}
			}

			throw PrismaException.catch( error );
		}
	}


	async findAll( filterDto : MobileLabPaginationFilterDto ) : Promise<PaginatedResult<IMobileLab>> {
		try {
			const {
				page            = 1,
				size            = 10,
				name,
				sku,
				active,
				categories,
				includeFiles    = false,
				includeProducts = false,
				includeKits     = false,
			} = filterDto;

			const skip = ( page - 1 ) * size;

			const where : Prisma.MobileLabWhereInput = {
				...( name && { name : { contains : name, mode : 'insensitive' } } ),
				...( sku && { sku : { contains : sku, mode : 'insensitive' } } ),
				...( active !== undefined && { active } ),
				...( categories && categories.length > 0 && { categoryId : { in : categories } } ),
			};

			const [ total, data ] = await Promise.all( [
				this.prisma.mobileLab.count( { where } ),
				this.prisma.mobileLab.findMany( {
					where,
					skip,
					take    : size,
					select  : this.#getMobileLabSelect( includeFiles, includeProducts, includeKits ),
					orderBy : { createdAt : 'desc' },
				} ) as unknown as IMobileLab[],
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
			throw PrismaException.catch( error );
		}
	}


	async findOne( id : string, includesLabDto? : IncludesMobileLabDto ) : Promise<IMobileLab> {
		try {
			const includeFiles    = includesLabDto?.includeFiles ?? true;
			const includeProducts = includesLabDto?.includeProducts ?? true;
			const includeKits     = includesLabDto?.includeKits ?? true;

			return await this.prisma.mobileLab.findUniqueOrThrow( {
				where  : { id },
				select : this.#getMobileLabSelect( includeFiles, includeProducts, includeKits ),
			} ) as unknown as IMobileLab;
		} catch ( error ) {
			throw PrismaException.catch( error );
		}
	}


	async update( id : string, updateMobileLabDto : UpdateMobileLabDto ) : Promise<IMobileLab> {
		const { sku, name, categoryId, description, dimensions, active } = updateMobileLabDto;

		try {
			// Validar existencia del laboratorio móvil
			await this.prisma.mobileLab.findUniqueOrThrow( {
				where : { id },
			} );

			if ( sku ) {
				const existingSku = await this.prisma.mobileLab.findFirst( {
					where : { sku, id : { not : id } },
				} );

				if ( existingSku ) {
					throw new ConflictException( `Ya existe otro laboratorio móvil con el SKU "${ sku }"` );
				}
			}

			if ( name ) {
				const existingName = await this.prisma.mobileLab.findFirst( {
					where : { name, id : { not : id } },
				} );

				if ( existingName ) {
					throw new ConflictException( `Ya existe otro laboratorio móvil con el nombre "${ name }"` );
				}
			}

			if ( categoryId ) {
				await this.prisma.labCategory.findUniqueOrThrow( {
					where : { id : categoryId },
				} );
			}

			await this.prisma.mobileLab.update( {
				where : { id },
				data  : {
					sku,
					name,
					categoryId,
					description,
					dimensions,
					active,
				},
			} );

			return await this.findOne( id, { includeFiles : true, includeProducts : true, includeKits : true } );
		} catch ( error ) {
			throw PrismaException.catch( error );
		}
	}


	async remove( id : string ) : Promise<{ message : string }> {
		try {
			// Validar existencia
			await this.prisma.mobileLab.findUniqueOrThrow( {
				where : { id },
			} );

			// Purga de archivos en Cloudinary
			try {
				await this.fileManagerService.deleteMultiple( id );
			} catch ( deleteError ) {
				console.error( 'Error al eliminar archivos de Cloudinary para el laboratorio móvil:', deleteError );
			}

			// Debido a onDelete: Cascade, Prisma elimina en cascada las relaciones dependientes en la BD
			await this.prisma.mobileLab.delete( {
				where : { id },
			} );

			return { message : 'Laboratorio móvil eliminado exitosamente' };
		} catch ( error ) {
			throw PrismaException.catch( error );
		}
	}


	// --- GESTIÓN DE ARCHIVOS ADJUNTOS (MobileLabFile) ---

	async uploadMobileLabFiles(
		mobileLabId : string,
		files       : Express.Multer.File[],
		filesInfo?  : MobileLabFileConfigDto[],
	) : Promise<IMobileLab> {
		try {
			const currentFiles = await this.prisma.mobileLabFile.findMany( {
				where   : { mobileLabId },
				orderBy : { order : 'asc' },
			} );

			const currentCount = currentFiles.length;
			const limit        = ENVS.FILE_UPLOAD_LIMIT;

			if ( currentCount >= limit ) {
				throw new BadRequestException( `El laboratorio móvil ya tiene el límite de ${ limit } archivos` );
			}

			if ( currentCount + files.length > limit ) {
				throw new BadRequestException(
					`No se pueden subir ${ files.length } archivos. El límite es ${ limit } y ya tiene ${ currentCount }.`
				);
			}

			if ( !files || files.length === 0 ) {
				throw new BadRequestException( 'No se proporcionaron archivos para subir' );
			}

			const uploadedFiles = await this.fileManagerService.uploadMultiple( files, 'labs', mobileLabId );
			const maxOrder      = currentFiles.reduce( ( max, img ) => ( img.order !== null && img.order > max ) ? img.order : max, -1 );
			const hasMain       = currentFiles.some( img => img.isMain );

            let nextOrder       = maxOrder + 1;
            let hasMainAssigned = hasMain;
			let visualIndex     = 0;

			const filesCreate = uploadedFiles.map( ( item, index ) => {
				const type     = mapResourceTypeToAttachmentType( item.resource_type, item.secure_url );
				const isVisual = type === 'IMAGE' || type === 'VIDEOS';
				const info     = filesInfo?.[ index ];

				let isMain               = false;
				let order : number | null = null;

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

			await this.prisma.mobileLab.update( {
				where : { id : mobileLabId },
				data  : {
					files : {
						create : filesCreate,
					},
				},
			} );

			return await this.findOne( mobileLabId, { includeFiles : true } );
		} catch ( error ) {
			throw PrismaException.catch( error );
		}
	}


	async updateMobileLabFilesInfo(
		mobileLabId : string,
		updateMobileLabFilesDto : UpdateMobileLabFilesDto,
	) : Promise<IMobileLab> {
		try {
			const { filesInfo } = updateMobileLabFilesDto;

			await this.prisma.$transaction( async ( tx ) => {
				for ( const file of filesInfo ) {
					// Validar pertenencia
					const existing = await tx.mobileLabFile.findUnique( {
						where : { id : file.id },
					} );

					if ( !existing || existing.mobileLabId !== mobileLabId ) {
						throw new BadRequestException( `El archivo con ID "${ file.id }" no pertenece a este laboratorio móvil` );
					}

					await tx.mobileLabFile.update( {
						where : { id : file.id },
						data  : {
							alt    : file.alt,
							isMain : file.isMain,
							order  : file.order,
						},
					} );
				}
			} );

			return await this.findOne( mobileLabId, { includeFiles : true } );
		} catch ( error ) {
			throw PrismaException.catch( error );
		}
	}


	async deleteMobileLabFile( mobileLabId : string, fileId : string ) : Promise<{ message : string }> {
		try {
			const existing = await this.prisma.mobileLabFile.findUnique( {
				where : { id : fileId },
			} );

			if ( !existing || existing.mobileLabId !== mobileLabId ) {
				throw new BadRequestException( 'El archivo no fue encontrado o no pertenece a este laboratorio móvil' );
			}

			// Eliminar de Cloudinary
			await this.fileManagerService.deleteFiles( 'labs', mobileLabId, [ existing.url ] );

			// Eliminar del BD
			await this.prisma.mobileLabFile.delete( {
				where : { id : fileId },
			} );

			// Promover otro archivo visual a principal si el eliminado era el principal
			if ( existing.isMain ) {
				const nextMainFile = await this.prisma.mobileLabFile.findFirst( {
					where : {
						mobileLabId,
						attachmentType : { in : [ 'IMAGE', 'VIDEOS' ] },
					},
					orderBy : { order : 'asc' },
				} );

				if ( nextMainFile ) {
					await this.prisma.mobileLabFile.update( {
						where : { id : nextMainFile.id },
						data  : { isMain : true },
					} );
				}
			}

			return { message : 'Archivo eliminado exitosamente' };
		} catch ( error ) {
			throw PrismaException.catch( error );
		}
	}


	async deleteMobileLabFiles(
		mobileLabId : string,
		deleteMobileLabFilesDto : DeleteMobileLabFilesDto,
	) : Promise<{ message : string }> {
		try {
			const { files } = deleteMobileLabFilesDto;

			const dbFiles = await this.prisma.mobileLabFile.findMany( {
				where : {
					id : { in : files },
					mobileLabId,
				},
			} );

			if ( dbFiles.length !== files.length ) {
				throw new BadRequestException( 'Uno o más archivos no fueron encontrados o no pertenecen a este laboratorio móvil' );
			}

			const fileNames = dbFiles.map( file => file.url );

			// Eliminar de Cloudinary
			await this.fileManagerService.deleteFiles( 'labs', mobileLabId, fileNames );

			// Eliminar de la BD
			await this.prisma.mobileLabFile.deleteMany( {
				where : {
					id : { in : files },
				},
			} );

			const hasMainDeleted = dbFiles.some( file => file.isMain === true );

			if ( hasMainDeleted ) {
				const nextMainFile = await this.prisma.mobileLabFile.findFirst( {
					where : {
						mobileLabId,
						id             : { notIn : files },
						attachmentType : { in : [ 'IMAGE', 'VIDEOS' ] },
					},
					orderBy : { order : 'asc' },
				} );

				if ( nextMainFile ) {
					await this.prisma.mobileLabFile.update( {
						where : { id : nextMainFile.id },
						data  : { isMain : true },
					} );
				}
			}

			return { message : 'Archivos eliminados exitosamente' };
		} catch ( error ) {
			throw PrismaException.catch( error );
		}
	}


	// --- GESTIÓN DE PRODUCTOS ASOCIADOS (MobileLabProduct) ---

	async addMobileLabProducts( mobileLabId : string, productsDto : MobileLabProductDto[] ) : Promise<IMobileLab> {
		try {
			// Validar existencia del laboratorio móvil
			await this.prisma.mobileLab.findUniqueOrThrow( {
				where : { id : mobileLabId },
			} );

			// Validar existencia de los productos a asociar
			const productIds = productsDto.map( p => p.productId );
			const dbProducts = await this.prisma.product.findMany( {
				where : { id : { in : productIds } },
			} );

			if ( dbProducts.length !== productIds.length ) {
				throw new BadRequestException( 'Uno o más productos no existen en el sistema' );
			}

			// Lógica transaccional de Upsert
			await this.prisma.$transaction(
				productsDto.map( item =>
					this.prisma.mobileLabProduct.upsert( {
						where : {
							productId_mobileLabId : {
								productId   : item.productId,
								mobileLabId,
							},
						},
						update : {
							quantity : item.quantity ?? 1,
						},
						create : {
							productId   : item.productId,
							mobileLabId,
							quantity    : item.quantity ?? 1,
						},
					} )
				)
			);

			return await this.findOne( mobileLabId, { includeProducts : true } );
		} catch ( error ) {
			throw PrismaException.catch( error );
		}
	}


	async updateMobileLabProductRelation(
		mobileLabId : string,
		productId   : string,
		dto         : UpdateMobileLabProductRelationDto,
	) : Promise<IMobileLabProduct> {
		try {
			const relation = await this.prisma.mobileLabProduct.findUniqueOrThrow( {
				where : {
					productId_mobileLabId : {
						productId,
						mobileLabId,
					},
				},
			} );

			return await this.prisma.mobileLabProduct.update( {
				where : { id : relation.id },
				data  : { quantity : dto.quantity },
				include : {
					product : {
						select : {
							id   : true,
							name : true,
							sku  : true,
						},
					},
				},
			} ) as unknown as IMobileLabProduct;
		} catch ( error ) {
			throw PrismaException.catch( error );
		}
	}


	async deleteMobileLabProduct( mobileLabId : string, productId : string ) : Promise<{ message : string }> {
		try {
			const relation = await this.prisma.mobileLabProduct.findUniqueOrThrow( {
				where : {
					productId_mobileLabId : {
						productId,
						mobileLabId,
					},
				},
			} );

			await this.prisma.mobileLabProduct.delete( {
				where : { id : relation.id },
			} );

			return { message : 'Producto eliminado del laboratorio móvil exitosamente' };
		} catch ( error ) {
			throw PrismaException.catch( error );
		}
	}


	async deleteMobileLabProducts(
		mobileLabId : string,
		dto         : DeleteMobileLabRelationsDto,
	) : Promise<{ message : string }> {
		try {
			const { ids } = dto;

			const relations = await this.prisma.mobileLabProduct.findMany( {
				where : {
					id : { in : ids },
					mobileLabId,
				},
			} );

			if ( relations.length !== ids.length ) {
				throw new BadRequestException( 'Uno o más productos no pertenecen a este laboratorio móvil' );
			}

			await this.prisma.mobileLabProduct.deleteMany( {
				where : {
					id : { in : ids },
					mobileLabId,
				},
			} );

			return { message : 'Productos eliminados del laboratorio móvil exitosamente' };
		} catch ( error ) {
			throw PrismaException.catch( error );
		}
	}


	// --- GESTIÓN DE KITS ASOCIADOS (MobileLabKit) ---

	async addMobileLabKits( mobileLabId : string, kitsDto : MobileLabKitDto[] ) : Promise<IMobileLab> {
		try {
			// Validar existencia del laboratorio móvil
			await this.prisma.mobileLab.findUniqueOrThrow( {
				where : { id : mobileLabId },
			} );

			// Validar existencia de los kits a asociar
			const kitIds = kitsDto.map( k => k.kitId );
			const dbKits = await this.prisma.kit.findMany( {
				where : { id : { in : kitIds } },
			} );

			if ( dbKits.length !== kitIds.length ) {
				throw new BadRequestException( 'Uno o más kits no existen en el sistema' );
			}

			// Lógica transaccional de Upsert
			await this.prisma.$transaction(
				kitsDto.map( item =>
					this.prisma.mobileLabKit.upsert( {
						where : {
							kitId_mobileLabId : {
								kitId       : item.kitId,
								mobileLabId,
							},
						},
						update : {
							quantity : item.quantity ?? 1,
						},
						create : {
							kitId       : item.kitId,
							mobileLabId,
							quantity    : item.quantity ?? 1,
						},
					} )
				)
			);

			return await this.findOne( mobileLabId, { includeKits : true } );
		} catch ( error ) {
			throw PrismaException.catch( error );
		}
	}


	async updateMobileLabKitRelation(
		mobileLabId : string,
		kitId       : string,
		dto         : UpdateMobileLabKitRelationDto,
	) : Promise<IMobileLabKit> {
		try {
			const relation = await this.prisma.mobileLabKit.findUniqueOrThrow( {
				where : {
					kitId_mobileLabId : {
						kitId,
						mobileLabId,
					},
				},
			} );

			return await this.prisma.mobileLabKit.update( {
				where : { id : relation.id },
				data  : { quantity : dto.quantity },
				include : {
					kit : {
						select : {
							id   : true,
							name : true,
							sku  : true,
						},
					},
				},
			} ) as unknown as IMobileLabKit;
		} catch ( error ) {
			throw PrismaException.catch( error );
		}
	}


	async deleteMobileLabKit( mobileLabId : string, kitId : string ) : Promise<{ message : string }> {
		try {
			const relation = await this.prisma.mobileLabKit.findUniqueOrThrow( {
				where : {
					kitId_mobileLabId : {
						kitId,
						mobileLabId,
					},
				},
			} );

			await this.prisma.mobileLabKit.delete( {
				where : { id : relation.id },
			} );

			return { message : 'Kit eliminado del laboratorio móvil exitosamente' };
		} catch ( error ) {
			throw PrismaException.catch( error );
		}
	}


	async deleteMobileLabKits(
		mobileLabId : string,
		dto         : DeleteMobileLabRelationsDto,
	) : Promise<{ message : string }> {
		try {
			const { ids } = dto;

			const relations = await this.prisma.mobileLabKit.findMany( {
				where : {
					id : { in : ids },
					mobileLabId,
				},
			} );

			if ( relations.length !== ids.length ) {
				throw new BadRequestException( 'Uno o más kits no pertenecen a este laboratorio móvil' );
			}

			await this.prisma.mobileLabKit.deleteMany( {
				where : {
					id : { in : ids },
					mobileLabId,
				},
			} );

			return { message : 'Kits eliminados del laboratorio móvil exitosamente' };
		} catch ( error ) {
			throw PrismaException.catch( error );
		}
	}

}
