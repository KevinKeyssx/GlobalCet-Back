import { Injectable } from '@nestjs/common';

import { PrismaException }              from '@prisma/prisma-catch';
import { PrismaService }                from '@prisma/prisma.service';
import { CreateCategoryDto }            from '@categories/dto/create-category.dto';
import { UpdateCategoryDto }            from '@categories/dto/update-category.dto';
import { CategoryPaginationFilterDto }  from '@categories/dto/pagination-filter.dto';
import { Category, Prisma }             from '@prisma/client';
import { PaginatedResult }              from '@common/interfaces/paginated-result.interface';


@Injectable()
export class CategoriesService {

	constructor( 
		private readonly prisma: PrismaService,
	) { }


	async create( createCategoryDto: CreateCategoryDto ): Promise<Category> {
		try {
			return await this.prisma.category.create({
				data : createCategoryDto,
			});
		} catch ( error ) {
			throw PrismaException.catch( error );
		}
	}


	async findAll( includeSubcategories: boolean = false ): Promise<any[]> {
		try {
			return await this.prisma.category.findMany({
				select : {
                    id: true,
                    name: true,
                    ...( includeSubcategories && { subCategories: {
                        select: {
                            id: true,
                            name: true,
                        }
                    }}) 
                },
                where: {
                    active: true,
                },
                orderBy: {
                    name: 'asc',
                },
			});
		} catch ( error ) {
			throw PrismaException.catch( error );
		}
	}


	async findAllPaginated( filterDto: CategoryPaginationFilterDto ): Promise<PaginatedResult<Category>> {
		try {
			const {
				page = 1,
				size = 10,
				name,
				active,
				includeSubcategories = false,
			} = filterDto;

			const skip = ( page - 1 ) * size;

			const where: Prisma.CategoryWhereInput = {
				...( name && { name : { contains : name, mode : 'insensitive' } } ),
				...( active !== undefined && { active } ),
			};

			const [ total, data ] = await Promise.all([
				this.prisma.category.count({ where }),
				this.prisma.category.findMany({
					where,
					skip,
					take	: size,
					include	: {
						subCategories : includeSubcategories,
					},
					orderBy	: {
						createdAt	: 'desc',
					},
				}),
			]);

			return {
				data,
				meta	: {
					total		: total,
					page		: page,
					size		: size,
					totalPages	: Math.ceil( total / size ),
				},
			};
		} catch ( error ) {
			throw PrismaException.catch( error );
		}
	}


	async findOne( id: string, includeSubcategories: boolean = false ): Promise<Category> {
		try {
			return await this.prisma.category.findUniqueOrThrow({
				where   : { id },
				include : {
					subCategories : includeSubcategories,
				},
			});
		} catch ( error ) {
			throw PrismaException.catch( error );
		}
	}


	async update( id: string, updateCategoryDto: UpdateCategoryDto ): Promise<Category> {
		try {
			return await this.prisma.category.update({
				where : { id },
				data  : updateCategoryDto,
			});
		} catch ( error ) {
			throw PrismaException.catch( error );
		}
	}


	async remove( id: string ): Promise<Category> {
		try {
			return await this.prisma.category.delete({
				where : { id },
			});
		} catch ( error ) {
			throw PrismaException.catch( error );
		}
	}

}

