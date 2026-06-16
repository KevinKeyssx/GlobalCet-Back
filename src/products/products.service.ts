import { ConflictException, Injectable, BadRequestException } from '@nestjs/common';

import { ulid } from 'ulid';

import {
    getFileNameWithExtension,
    mapResourceTypeToAttachmentType,
    matchFileByName
}                                       from '@common/utils/file.utils';
import {
	normalizeText,
	searchProductIds
} from '@common/utils/search.utils';
import {
    FileManagerService,
    ResponeFileUpload
}                                       from '@services/file-manager.service';
import { PaginatedResult }              from '@common/interfaces/paginated-result.interface';
import { ENVS }                         from '@config/envs';
import { Prisma, Product }              from '@prisma/client';
import { PrismaException }              from '@prisma/prisma-catch';
import { PrismaService }                from '@prisma/prisma.service';
import { CreateProductDto }             from '@products/dto/create-product.dto';
import { UpdateProductDto }             from '@products/dto/update-product.dto';
import { ProductPaginationFilterDto }   from '@products/dto/pagination-filter.dto';
import { IProduct }                     from '@products/models/product.interface';
import { UpdateProductImagesDto }       from '@products/dto/update-product-images.dto';
import { UploadProductImagesDto }       from '@products/dto/upload-product-images.dto';
import { DeleteProductFilesDto }        from '@products/dto/delete-product-files.dto';
import { IncludesItemsDto }             from '@products/dto/includes-items.dto';
import { SubCategoryOrderField }        from '@common/dto/pagination.dto';
import { getProductSelect }             from '@products/utils/product-select.utils';




@Injectable()
export class ProductsService {

	private readonly SKU_PREFIX = 'c';


	constructor(
		private readonly prisma: PrismaService,
        private readonly fileManagerService: FileManagerService,
	) {}
	async create(
        createProductDto: CreateProductDto,
        files?: Express.Multer.File[],
    ): Promise<IProduct> {
        const {
            includeFiles,
            includeKits,
            includeMobileLabs,
            imagesInfo,
            files: _,
            ...data
        } = createProductDto;

        const productId = ulid();

        let uploadedImages: Array<ResponeFileUpload> = [];

        try {
            const skuExists = await this.prisma.product.findUnique({
                where  : { sku: data.sku },
                select : { sku: true },
            });

            if ( skuExists ) {
                throw new ConflictException( `El SKU '${ data.sku }' ya existe` );
            }

            if ( files && files.length > 0 ) {
                const validFiles = files;

                if ( validFiles.length > 0 ) {
                    uploadedImages = await this.fileManagerService.uploadMultiple( validFiles, 'products', productId );
                }
            }

            let hasMainAssigned = false;
            let visualIndex     = 0;

            const imagesCreate = uploadedImages.map( ( item, index ) => {
                const type = mapResourceTypeToAttachmentType( item.resource_type, item.secure_url );
                const isVisual = type === 'IMAGE' || type === 'VIDEOS';
                const info     = imagesInfo?.[ index ];

                let isMain                  = false;
                let order: number | null    = null;

                if ( isVisual ) {
                    isMain = info?.isMain ?? ( !hasMainAssigned && visualIndex === 0 );

                    if ( isMain ) {
                        hasMainAssigned = true;
                    }

                    order = info?.order ?? visualIndex;
                    visualIndex++;
                }

                return {
                    isMain,
                    order,
                    alt             : info?.alt || null,
                    url             : getFileNameWithExtension( item.secure_url ),
                    attachmentType  : type,
                };
            });

			return await this.prisma.product.create({
				data : {
                    id : productId,
                    ...data,
                    ...( imagesCreate.length > 0 && {
                        files : {
                            create : imagesCreate,
                        }
                    }),
				},
				select : getProductSelect( includeFiles, includeKits, includeMobileLabs ),
			}) as unknown as IProduct;
		} catch ( error ) {
            if ( uploadedImages.length > 0 ) {
                try {
                    await this.fileManagerService.deleteFolder( 'products', productId );
                } catch ( deleteError ) {
                    console.error( 'Error al eliminar los archivos del producto:', deleteError );
                }
            }

			throw PrismaException.catch( error, 'Product' );
		}
	}


	async findAll( filterDto: ProductPaginationFilterDto ): Promise<PaginatedResult<IProduct>> {
		try {
			const {
				page = 1,
				size = 10,
				query,
				materials,
				active,
				subcategories,
				includeFiles,
				includeKits,
				includeMobileLabs,
				orderBy = SubCategoryOrderField.NAME,
				order = 'asc',
			} = filterDto;

			const skip = ( page - 1 ) * size;

			let where: Prisma.ProductWhereInput = {
				...( materials && materials.length > 0 && { materialId : { in : materials } } ),
				...( active !== undefined && { active } ),
				...( subcategories && subcategories.length > 0 && { subcategoryId : { in : subcategories } } ),
			};

			if ( query ) {
				const normalized = normalizeText( query );
				const pattern    = `%${ normalized }%`;

				if ( query.toLowerCase( ).startsWith( this.SKU_PREFIX ) ) {
					const skuIds = await searchProductIds( this.prisma, pattern, true );

					if ( skuIds.length > 0 ) {
						where = {
							...where,
							id : { in : skuIds },
						};
					} else {
						const nameIds = await searchProductIds( this.prisma, pattern, false );
						where = {
							...where,
							id : { in : nameIds },
						};
					}
				} else {
					const nameIds = await searchProductIds( this.prisma, pattern, false );
					where = {
						...where,
						id : { in : nameIds },
					};
				}
			}

			const [ total, data ] = await Promise.all([
				this.prisma.product.count({ where }),
				this.prisma.product.findMany({
					where,
					skip,
					take    : size,
					select  : getProductSelect( includeFiles, includeKits, includeMobileLabs ),
					orderBy : {
						[ orderBy ] : order,
					},
				}) as unknown as IProduct[],
			]);

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
			throw PrismaException.catch( error, 'Product' );
		}
	}


	async getTechnicalSpecsFilters(): Promise<Record<string, any[]>> {
		try {
			const products = await this.prisma.product.findMany({
				select : { technical_specs: true },
				where  : { technical_specs: { not: Prisma.AnyNull } },
			});

			const filters: Record<string, Set<any>> = {};

			for ( const product of products ) {
				const specs = product.technical_specs as Record<string, any>;

                if ( !specs || typeof specs !== 'object' ) continue;

				for ( const [ key, value ] of Object.entries( specs )) {
					if ( !filters[ key ]) {
						filters[ key ] = new Set();
					}

                    // Only aggregate primitive types or simple arrays, to avoid deep objects in filters
					if ( typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' ) {
						filters[ key ].add( value );
					}
				}
			}

			const result: Record<string, any[]> = {};

            for ( const [ key, valueSet ] of Object.entries( filters ) ) {
				result[ key ] = Array.from( valueSet );
			}

			return result;
		} catch ( error ) {
			throw PrismaException.catch( error, 'Product' );
		}
	}


	async findOne(
        id: string,
        includesItemsDto: IncludesItemsDto,
        getAllStatus: boolean = false
    ): Promise<IProduct> {
		try {
			const { includeFiles, includeKits, includeMobileLabs } = includesItemsDto;

            const where : Prisma.ProductWhereInput = { id };

            if ( !getAllStatus ) {
                where.active = true;
            }

			return await this.prisma.product.findUniqueOrThrow( {
				where  : where as any,
				select : getProductSelect( includeFiles, includeKits, includeMobileLabs ),
			} ) as unknown as IProduct;
		} catch ( error ) {
			throw PrismaException.catch( error, 'Product' );
		}
	}


	async update( id: string, updateProductDto: UpdateProductDto ): Promise<IProduct> {
		try {
			const {
				includeFiles,
				includeKits,
				includeMobileLabs,
				files,
				...data
			} = updateProductDto;

			return await this.prisma.product.update( {
				where  : { id },
				data,
				select : getProductSelect( includeFiles, includeKits, includeMobileLabs ),
			} ) as unknown as IProduct;
		} catch ( error ) {
			throw PrismaException.catch( error, 'Product' );
		}
	}


	async remove( id: string ): Promise<Product> {
		try {
            const productFiles = await this.prisma.productFile.findMany({
                where : { productId : id },
            })

            if ( productFiles.length > 0 ) {
                try {
                    await this.fileManagerService.deleteFolder( 'products', id );
                } catch ( error ) {
                    console.error( 'Error al eliminar archivos de Cloudinary para el Producto:', error );
                }
            }

			return await this.prisma.product.delete({
				where : { id },
			});
		} catch ( error ) {
			throw PrismaException.catch( error, 'Product' );
		}
	}


    async deleteProductFile(
        productId   : string,
        imageId     : string
    ) : Promise<{ message : string }> {
        try {
            const file = await this.prisma.productFile.findFirstOrThrow({
                where : {
                    id			: imageId,
                    productId	: productId,
                },
            });

            await this.fileManagerService.deleteOneFile( 'products', productId, file.url );

            await this.prisma.productFile.delete({
                where : { id : imageId },
            });

            if ( file.isMain ) {
                const nextMainImage = await this.prisma.productFile.findFirst({
                    where : {
                        productId,
                        id			: { not : imageId },
                    },
                    orderBy : {
                        order : 'asc',
                    },
                });

                if ( nextMainImage ) {
                    await this.prisma.productFile.update({
                        where : { id : nextMainImage.id },
                        data  : { isMain : true },
                    });
                }
            }

            return { message : 'Archivo eliminado exitosamente' };
        } catch ( error ) {
            throw PrismaException.catch( error, 'Product' );
        }
    }


    async uploadProductFiles(
        productId : string,
        files     : Express.Multer.File[],
        uploadProductImagesDto: UploadProductImagesDto,
    ) : Promise<IProduct> {
        try {
            const { imagesInfo } = uploadProductImagesDto;

            const currentFiles = await this.prisma.productFile.findMany({
                where   : { productId },
                orderBy : { order : 'asc' },
            });

            const currentCount = currentFiles.length;
            const limit        = ENVS.FILE_UPLOAD_LIMIT;

            if ( currentCount >= limit ) {
                throw new BadRequestException( `El producto ya tiene el límite de ${ limit } archivos` );
            }

            if ( currentCount + files.length > limit ) {
                throw new BadRequestException(
                    `No se pueden subir ${ files.length } archivos. El límite es ${ limit } y ya tiene ${ currentCount }.`
                );
            }

            if ( !files || files.length === 0 ) {
                throw new BadRequestException( 'No se proporcionaron archivos para subir' );
            }

            const validFiles        = files;
            const uploadedImages    = await this.fileManagerService.uploadMultiple( validFiles, 'products', productId );
            const maxOrder          = currentFiles.reduce( ( max, img ) => ( img.order !== null && img.order > max ) ? img.order : max, -1 );
            const hasMain           = currentFiles.some( img => img.isMain );

            let nextOrder       = maxOrder + 1;
            let hasMainAssigned = hasMain;
            let visualIndex     = 0;

            const filesCreate = uploadedImages.map( ( item, index ) => {
                const type         = mapResourceTypeToAttachmentType( item.resource_type, item.secure_url );
                const isVisual     = type === 'IMAGE' || type === 'VIDEOS';
                const originalName = files[ index ]?.originalname;
                const info         = imagesInfo?.find( ( img ) => matchFileByName( item.secure_url, img.name || originalName || '' ) ) || imagesInfo?.[ index ];

                let isMain                  = false;
                let order: number | null    = null;

                if ( isVisual ) {
                    isMain = info?.isMain ?? ( !hasMainAssigned && visualIndex === 0 );

                    if ( isMain ) {
                        hasMainAssigned = true;
                    }

                    order = info?.order ?? nextOrder++;

                    visualIndex++;
                }

                return {
                    url				: getFileNameWithExtension( item.secure_url ),
                    alt				: info?.alt || null,
                    attachmentType	: type,
                    isMain			: isMain,
                    order			: order,
                };
            });

            return await this.prisma.product.update({
                where : { id : productId },
                data  : {
                    files : {
                        create : filesCreate,
                    },
                },
                select : getProductSelect( true, false, false ),
            }) as unknown as IProduct;
		} catch ( error ) {
			throw PrismaException.catch( error, 'Product' );
		}
    }


    async updateProductImagesInfo(
        productId              : string,
        updateProductImagesDto : UpdateProductImagesDto,
    ) : Promise<IProduct> {
        try {
            const { imagesInfo } = updateProductImagesDto;

            const currentImages = await this.prisma.productFile.findMany({
                where : { productId },
            });

            // if ( currentImages.length !== imagesInfo.length ) {
            //     throw new BadRequestException( 'Se deben proporcionar todas las imágenes del producto' );
            // }

            const currentImageIds = currentImages.map( img => img.id );
            const incomingIds     = imagesInfo.map( info => info.id );
            const hasAllIds       = incomingIds.every( id => currentImageIds.includes( id ) );

            if ( !hasAllIds ) {
                throw new BadRequestException( 'Una o más imágenes no pertenecen a este producto' );
            }

            const normalizedInfo = imagesInfo.map( ( info ) => {
                const currentImg = currentImages.find( ( img ) => img.id === info.id );

                return {
                    id				: info.id,
                    alt				: info.alt !== undefined ? info.alt : currentImg?.alt,
                    isMain			: info.isMain,
                    order			: info.order !== undefined ? info.order : currentImg?.order,
                    attachmentType	: info.attachmentType !== undefined ? info.attachmentType : currentImg?.attachmentType,
                };
            } );

            normalizedInfo.sort( ( a, b ) => ( a?.order || 0 ) - ( b?.order || 0 ) );

            const hasMainTrue = normalizedInfo.some( ( info ) => info.isMain === true );
            let mainAssigned  = false;
            let visualIndex   = 0;

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
                    this.prisma.productFile.update({
                        where : { id : info.id },
                        data  : {
                            alt		: info.alt,
                            isMain	: info.isMain,
                            order	: info.order,
                        },
                    })
                )
            );

            return await this.findOne( productId, { includeFiles : true }, true );
        } catch ( error ) {
            throw PrismaException.catch( error, 'Product' );
        }
    }


    async deleteProductFiles(
        productId               : string,
        deleteProductFilesDto   : DeleteProductFilesDto,
    ) : Promise<{ message : string }> {
        try {
            const { fileIds } = deleteProductFilesDto;

            const files = await this.prisma.productFile.findMany({
                where : {
                    id : { in : fileIds },
                    productId,
                },
                select : {
                    url     : true,
                    isMain  : true
                }
            });

            // if ( files.length !== fileIds.length ) {
            //     throw new BadRequestException( 'Uno o más archivos no fueron encontrados en el producto.' );
            // }

            const fileNames = files.map( file => file.url );

            await this.fileManagerService.deleteFiles( 'products', productId, fileNames );
            // await this.fileManagerService.deleteOneFile( productId );

            await this.prisma.productFile.deleteMany({
                where : {
                    id : { in : fileIds },
                },
            });

            const hasMainDeleted = files.some( img => img.isMain === true );

            if ( hasMainDeleted ) {
                const nextMainImage = await this.prisma.productFile.findFirst({
                    where : {
                        productId,
                        id			: { notIn : fileIds },
                    },
                    orderBy : {
                        order : 'asc',
                    },
                });

                if ( nextMainImage ) {
                    await this.prisma.productFile.update({
                        where : { id : nextMainImage.id },
                        data  : { isMain : true },
                    });
                }
            }

            return { message : 'Imágenes eliminadas exitosamente' };
        } catch ( error ) {
            throw PrismaException.catch( error, 'Product' );
        }
    }

}
