import { ConflictException, Injectable, BadRequestException } from '@nestjs/common';
import { ENVS }                                               from '@config/envs';


import { PaginatedResult }              from '@common/interfaces/paginated-result.interface';
import { Prisma, Product }              from '@prisma/client';
import { PrismaException }              from '@prisma/prisma-catch';
import { PrismaService }                from '@prisma/prisma.service';
import { CreateProductDto }             from '@products/dto/create-product.dto';
import { UpdateProductDto }             from '@products/dto/update-product.dto';
import { ProductPaginationFilterDto }   from '@products/dto/pagination-filter.dto';
import { IProduct }                     from '@products/models/product.interface';
import { UpdateProductImagesDto }       from '@products/dto/update-product-images.dto';
import { UploadProductImagesDto }       from '@products/dto/upload-product-images.dto';
import { DeleteProductImagesDto }       from '@products/dto/delete-product-images.dto';
import { FileManagerService }           from '@services/file-manager.service';
import { ulid }                         from 'ulid';


@Injectable()
export class ProductsService {

	constructor(
		private readonly prisma: PrismaService,
        private readonly fileManagerService: FileManagerService,
	) {}


	#getProductSelect(
        includeImages       : boolean = false,
        includeKits         : boolean = false,
        includeMobileLabs   : boolean = false
    ) {
		return {
			id              : true,
			sku             : true,
			name            : true,
			description     : true,
			material        : true,
			technical_specs : true,
			active          : true,
			createdAt       : true,
			updatedAt       : true,
			images          : {
				where  : includeImages ? {} : { isMain: true },
				select : {
					id     : true,
					url    : true,
					alt    : true,
					isMain : true,
					order  : true,
				},
			},
			...( includeKits && {
				inKits : {
					select : {
						id       : true,
						quantity : true,
						kit      : {
							select : {
								id          : true,
								sku         : true,
								name        : true,
								description : true,
							},
						},
					},
				},
			}),
			...( includeMobileLabs && {
				inMobileLabs : {
					select : {
						id        : true,
						quantity  : true,
						mobileLab : {
							select : {
								id          : true,
								sku         : true,
								name        : true,
								description : true,
								dimensions  : true,
							},
						},
					},
				},
			}),
		};
	}


	async create(
        createProductDto: CreateProductDto,
        files?: Express.Multer.File[],
    ): Promise<IProduct> {
        const {
            includeImages,
            includeKits,
            includeMobileLabs,
            imagesInfo,
            ...data
        } = createProductDto;

        const productId = ulid();
        let uploadedImages: Array<{ secure_url : string; public_id : string }> = [];

        try {
            const skuExists = await this.prisma.product.findUnique({
                where  : { sku: data.sku },
                select : { sku: true },
            });

            if ( skuExists ) {
                throw new ConflictException( `El SKU '${ data.sku }' ya existe` );
            }

            if ( files && files.length > 0 ) {
                const validFiles = files.filter( f => f.mimetype.startsWith( 'image/' ) || f.mimetype.startsWith( 'video/' ));

                if ( validFiles.length > 0 ) {
                    uploadedImages = await this.fileManagerService.uploadMultiple( validFiles, productId );
                }
            }

            const imagesCreate = uploadedImages.map( ( item, index ) => {
                const info = imagesInfo?.[ index ];

                return {
                    url		: item.public_id,
                    alt		: info?.alt || null,
                    isMain	: info?.isMain ?? ( index === 0 ),
                    order	: info?.order ?? index,
                };
            });

			return await this.prisma.product.create({
				data : {
                    id : productId,
					...data,
                    ...( imagesCreate.length > 0 && {
                        images : {
                            create : imagesCreate,
                        }
                    }),
				},
				select : this.#getProductSelect( includeImages, includeKits, includeMobileLabs ),
			}) as unknown as IProduct;
		} catch ( error ) {
            if ( uploadedImages.length > 0 ) {
                try {
                    await this.fileManagerService.deleteMultiple( productId );
                } catch ( deleteError ) {
                    console.error( 'Error al eliminar los archivos del producto:', deleteError );
                }
            }

			throw PrismaException.catch( error );
		}
	}


	async findAll( filterDto: ProductPaginationFilterDto ): Promise<PaginatedResult<IProduct>> {
		try {
			const {
				page = 1,
				size = 10,
				// name,
				// sku,
				material,
				active,
				subcategories,
				includeImages,
				includeKits,
				includeMobileLabs,
			} = filterDto;

			const skip = ( page - 1 ) * size;

			const where: Prisma.ProductWhereInput = {
				// ...( name && { name: { contains: name, mode: 'insensitive' } } ),
				// ...( sku && { sku: { contains: sku, mode: 'insensitive' } } ),
				...( material && { material: { contains: material, mode: 'insensitive' } } ),
				...( active !== undefined && { active } ),
				...( subcategories && subcategories.length > 0 && { subcategoryId: { in: subcategories } } ),
			};

			const [ total, data ] = await Promise.all([
				this.prisma.product.count({ where }),
				this.prisma.product.findMany({
					where,
					skip,
					take    : size,
					select  : this.#getProductSelect( includeImages, includeKits, includeMobileLabs ),
					orderBy : {
						createdAt : 'desc',
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
			throw PrismaException.catch( error );
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
			throw PrismaException.catch( error );
		}
	}


	async findOne( id: string, filterDto: ProductPaginationFilterDto ): Promise<IProduct> {
		try {
			const { includeImages, includeKits, includeMobileLabs } = filterDto;

			return await this.prisma.product.findUniqueOrThrow({
				where  : { id },
				select : this.#getProductSelect( includeImages, includeKits, includeMobileLabs ),
			}) as unknown as IProduct;
		} catch ( error ) {
			throw PrismaException.catch( error );
		}
	}


	async update( id: string, updateProductDto: UpdateProductDto ): Promise<IProduct> {
		try {
            const {
                includeImages,
                includeKits,
                includeMobileLabs,
                ...data
            } = updateProductDto;

			return await this.prisma.product.update({
				where : { id },
				data,
				select : this.#getProductSelect( includeImages, includeKits, includeMobileLabs ),
			}) as unknown as IProduct;
		} catch ( error ) {
			throw PrismaException.catch( error );
		}
	}


	async remove( id: string ): Promise<Product> {
		try {
			return await this.prisma.product.delete({
				where : { id },
			});
		} catch ( error ) {
			throw PrismaException.catch( error );
		}
	}


    async deleteProductImage( productId : string, imageId : string ) : Promise<{ message : string }> {
        try {
            const image = await this.prisma.productImage.findFirstOrThrow({
                where : {
                    id			: imageId,
                    productId	: productId,
                },
            });

            await this.fileManagerService.deleteFiles( productId, [ image.url ] );

            await this.prisma.productImage.delete({
                where : { id : imageId },
            });

            if ( image.isMain ) {
                const nextMainImage = await this.prisma.productImage.findFirst({
                    where : {
                        productId,
                        id			: { not : imageId },
                    },
                    orderBy : {
                        order : 'asc',
                    },
                });

                if ( nextMainImage ) {
                    await this.prisma.productImage.update({
                        where : { id : nextMainImage.id },
                        data  : { isMain : true },
                    });
                }
            }

            return { message : 'Imagen eliminada exitosamente' };
        } catch ( error ) {
            throw PrismaException.catch( error );
        }
    }


    async uploadProductImages(
        productId : string,
        files     : Express.Multer.File[],
        uploadProductImagesDto: UploadProductImagesDto,
    ) : Promise<IProduct> {
        try {
            const { imagesInfo } = uploadProductImagesDto;

            const currentImages = await this.prisma.productImage.findMany({
                where   : { productId },
                orderBy : { order : 'asc' },
            });

            const currentCount = currentImages.length;
            const limit        = ENVS.FILE_UPLOAD_LIMIT;

            if ( currentCount >= limit ) {
                throw new BadRequestException( `El producto ya tiene el límite de ${ limit } imágenes` );
            }

            if ( currentCount + files.length > limit ) {
                throw new BadRequestException(
                    `No se pueden subir ${ files.length } imágenes. El límite es ${ limit } y ya tiene ${ currentCount }.`
                );
            }

            const validFiles = files.filter( f => f.mimetype.startsWith( 'image/' ) || f.mimetype.startsWith( 'video/' ) );

            if ( validFiles.length === 0 ) {
                throw new BadRequestException( 'No se proporcionaron imágenes o videos válidos para subir' );
            }

            const uploadedImages = await this.fileManagerService.uploadMultiple( validFiles, productId );

            const maxOrder = currentImages.reduce( ( max, img ) => img.order > max ? img.order : max, -1 );
            let nextOrder  = maxOrder + 1;

            const hasMain = currentImages.some( img => img.isMain );

            const imagesCreate = uploadedImages.map( ( item, index ) => {
                const info = imagesInfo?.[ index ];

                return {
                    url		: item.public_id,
                    alt		: info?.alt || null,
                    isMain	: info?.isMain ?? ( !hasMain && index === 0 ),
                    order	: info?.order ?? nextOrder++,
                };
            });

            return await this.prisma.product.update({
                where : { id : productId },
                data  : {
                    images : {
                        create : imagesCreate,
                    },
                },
                select : this.#getProductSelect( true, false, false ),
            }) as unknown as IProduct;
        } catch ( error ) {
            throw PrismaException.catch( error );
        }
    }


    async updateProductImagesInfo(
        productId              : string,
        updateProductImagesDto : UpdateProductImagesDto,
    ) : Promise<IProduct> {
        try {
            const { imagesInfo } = updateProductImagesDto;

            const currentImages = await this.prisma.productImage.findMany({
                where : { productId },
            });

            if ( currentImages.length !== imagesInfo.length ) {
                throw new BadRequestException( 'Se deben proporcionar todas las imágenes del producto' );
            }

            const currentImageIds = currentImages.map( img => img.id );
            const incomingIds     = imagesInfo.map( info => info.id );
            const hasAllIds       = incomingIds.every( id => currentImageIds.includes( id ) );

            if ( !hasAllIds ) {
                throw new BadRequestException( 'Una o más imágenes no pertenecen a este producto' );
            }

            const normalizedInfo = imagesInfo.map( info => {
                const currentImg = currentImages.find( img => img.id === info.id );

                return {
                    id		: info.id,
                    alt		: info.alt !== undefined ? info.alt : currentImg?.alt,
                    isMain	: info.isMain,
                    order	: info.order !== undefined ? info.order : currentImg?.order,
                };
            });

            normalizedInfo.sort( ( a, b ) => ( a?.order || 0 ) - ( b?.order || 0 ) );

            const hasMainTrue = normalizedInfo.some( info => info.isMain === true );
            let mainAssigned  = false;

            normalizedInfo.forEach( ( info, index ) => {
                info.order = index;

                if ( hasMainTrue ) {
                    if ( info.isMain === true && !mainAssigned ) {
                        info.isMain  = true;
                        mainAssigned = true;
                    } else {
                        info.isMain = false;
                    }
                } else {
                    info.isMain = index === 0;
                }
            });

            await this.prisma.$transaction(
                normalizedInfo.map( info => 
                    this.prisma.productImage.update({
                        where : { id : info.id },
                        data  : {
                            alt		: info.alt,
                            isMain	: info.isMain,
                            order	: info.order,
                        },
                    })
                )
            );

            return await this.findOne( productId, { includeImages : true });
        } catch ( error ) {
            throw PrismaException.catch( error );
        }
    }


    async deleteProductImages(
        productId              : string,
        deleteProductImagesDto : DeleteProductImagesDto,
    ) : Promise<{ message : string }> {
        try {
            const { imageIds } = deleteProductImagesDto;

            const images = await this.prisma.productImage.findMany({
                where : {
                    id			: { in : imageIds },
                    productId	: productId,
                },
            });

            if ( images.length !== imageIds.length ) {
                throw new BadRequestException( 'Una o más imágenes no fueron encontradas o no pertenecen al producto' );
            }

            const fileNames = images.map( img => img.url );

            await this.fileManagerService.deleteFiles( productId, fileNames );

            await this.prisma.productImage.deleteMany({
                where : {
                    id : { in : imageIds },
                },
            });

            const hasMainDeleted = images.some( img => img.isMain === true );

            if ( hasMainDeleted ) {
                const nextMainImage = await this.prisma.productImage.findFirst({
                    where : {
                        productId,
                        id			: { notIn : imageIds },
                    },
                    orderBy : {
                        order : 'asc',
                    },
                });

                if ( nextMainImage ) {
                    await this.prisma.productImage.update({
                        where : { id : nextMainImage.id },
                        data  : { isMain : true },
                    });
                }
            }

            return { message : 'Imágenes eliminadas exitosamente' };
        } catch ( error ) {
            throw PrismaException.catch( error );
        }
    }

}
