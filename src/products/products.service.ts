import { Injectable } from '@nestjs/common';

import { PaginatedResult }              from '@common/interfaces/paginated-result.interface';
import { generateProductSku }           from '@common/utils/generate-sku.util';
import { Prisma, Product }              from '@prisma/client';
import { PrismaException }              from '@prisma/prisma-catch';
import { PrismaService }                from '@prisma/prisma.service';
import { CreateProductDto }             from '@products/dto/create-product.dto';
import { UpdateProductDto }             from '@products/dto/update-product.dto';
import { ProductPaginationFilterDto }   from '@products/dto/pagination-filter.dto';
import { IProduct }                     from '@products/models/product.interface';


@Injectable()
export class ProductsService {

	constructor(
		private readonly prisma: PrismaService,
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


	async create( createProductDto: CreateProductDto ): Promise<IProduct> {
        const {
            includeImages,
            includeKits,
            includeMobileLabs,
            ...data
        } = createProductDto;

        try {
			const subcategory = await this.prisma.subcategory.findUniqueOrThrow({
				where   : { id: data.subcategoryId },
				include : { category: true },
			});

			const sku = generateProductSku(
				subcategory.category.name,
				subcategory.name,
				data.name
			);

			return await this.prisma.product.create({
				data : {
					...data,
					sku,
				},
				select : this.#getProductSelect( includeImages, includeKits, includeMobileLabs ),
			}) as unknown as IProduct;
		} catch ( error ) {
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

			let newSku: string | undefined;

			const currentProduct = await this.prisma.product.findUniqueOrThrow({
				where : { id },
			});

			const isSubcategoryChanged = data.subcategoryId !== undefined && data.subcategoryId !== currentProduct.subcategoryId;
			const isNameChanged        = data.name !== undefined && data.name !== currentProduct.name;

			if ( isSubcategoryChanged || isNameChanged ) {
				const targetSubcategoryId = data.subcategoryId || currentProduct.subcategoryId;
				const targetName          = data.name || currentProduct.name;

				const subcategory = await this.prisma.subcategory.findUniqueOrThrow({
					where   : { id: targetSubcategoryId },
					include : { category: true },
				});

				newSku = generateProductSku(
					subcategory.category.name,
					subcategory.name,
					targetName
				);
			}

			return await this.prisma.product.update({
				where : { id },
				data  : {
					...data,
					...( newSku && { sku: newSku } ),
				},
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

}
