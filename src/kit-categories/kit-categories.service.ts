import { Injectable, ConflictException } from '@nestjs/common';

import { PrismaException }              from '@prisma/prisma-catch';
import { PrismaService }                from '@prisma/prisma.service';
import { KitCategory, Prisma }          from '@prisma/client';
import { PaginatedResult }              from '@common/interfaces/paginated-result.interface';
import { CategoryPaginationFilterDto }  from '@common/dto/category-pagination-filter.dto';
import { CreateKitCategoryDto }         from './dto/create-kit-category.dto';
import { UpdateKitCategoryDto }         from './dto/update-kit-category.dto';


@Injectable()
export class KitCategoriesService {

	constructor(
		private readonly prisma: PrismaService,
	) {}


	async create( createKitCategoryDto: CreateKitCategoryDto ): Promise<KitCategory> {
		try {
			const existingCategory = await this.prisma.kitCategory.findUnique( {
				where : { name : createKitCategoryDto.name },
			} );

			if ( existingCategory ) {
				throw new ConflictException( `Ya existe una categoría de kit con el nombre "${ createKitCategoryDto.name }"` );
			}

			return await this.prisma.kitCategory.create( {
				data : createKitCategoryDto,
			} );
		} catch ( error ) {
			throw PrismaException.catch( error );
		}
	}


	async findAll(): Promise<{ id: string, name: string }[]> {
		try {
			return await this.prisma.kitCategory.findMany( {
                select : {
                    id: true,
                    name: true
                },
                where: {
                    active: true
                },
				orderBy : { name : 'asc' },
			});
		} catch ( error ) {
			throw PrismaException.catch( error );
		}
	}


	async findAllPaginated( filterDto: CategoryPaginationFilterDto ): Promise<PaginatedResult<KitCategory>> {
		try {
			const {
				page = 1,
				size = 10,
				name,
				active,
			} = filterDto;

			const skip = ( page - 1 ) * size;

			const where: Prisma.KitCategoryWhereInput = {
				...( name && { name : { contains : name, mode : 'insensitive' } } ),
				...( active !== undefined && { active } ),
			};

			const [ total, data ] = await Promise.all( [
				this.prisma.kitCategory.count( { where } ),
				this.prisma.kitCategory.findMany( {
					where,
					skip,
					take    : size,
					orderBy : { name : 'asc' },
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
			throw PrismaException.catch( error );
		}
	}


	async findOne( id: string ): Promise<KitCategory> {
		try {
			return await this.prisma.kitCategory.findUniqueOrThrow( {
				where : { id },
			} );
		} catch ( error ) {
			throw PrismaException.catch( error );
		}
	}


	async update( id: string, updateKitCategoryDto: UpdateKitCategoryDto ): Promise<KitCategory> {
		try {
			if ( updateKitCategoryDto.name ) {
				const existingCategory = await this.prisma.kitCategory.findFirst( {
					where : {
						name : updateKitCategoryDto.name,
						id   : { not : id },
					},
				} );

				if ( existingCategory ) {
					throw new ConflictException( `Ya existe otra categoría de kit con el nombre "${ updateKitCategoryDto.name }"` );
				}
			}

			return await this.prisma.kitCategory.update( {
				where : { id },
				data  : updateKitCategoryDto,
			} );
		} catch ( error ) {
			throw PrismaException.catch( error );
		}
	}


	async remove( id: string ): Promise<KitCategory> {
		try {
			return await this.prisma.kitCategory.delete( {
				where : { id },
			} );
		} catch ( error ) {
			throw PrismaException.catch( error );
		}
	}

}
