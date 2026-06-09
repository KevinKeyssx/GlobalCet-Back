import { Injectable } from '@nestjs/common';

import { PrismaException }              from '@prisma/prisma-catch';
import { PrismaService }                from '@prisma/prisma.service';
import { CreateSubCategoryDto }         from '@sub-categories/dto/create-sub-category.dto';
import { UpdateSubCategoryDto }         from '@sub-categories/dto/update-sub-category.dto';
import { Subcategory, Prisma }          from '@prisma/client';
import { PaginatedResult }              from '@common/interfaces/paginated-result.interface';
import { SubCategoryPaginationFilterDto } from '@sub-categories/dto/pagination-filter.dto';
import { SubCategoryOrderField }        from '@common/dto/pagination.dto';



@Injectable()
export class SubCategoriesService {

	constructor(
		private readonly prisma: PrismaService,
	) {}


	async create( createSubCategoryDto: CreateSubCategoryDto ): Promise<Subcategory> {
		try {
			return await this.prisma.subcategory.create({
				data : createSubCategoryDto,
			});
		} catch ( error ) {
			throw PrismaException.catch( error );
		}
	}


	async findAll(): Promise<Subcategory[]> {
		try {
			return await this.prisma.subcategory.findMany();
		} catch ( error ) {
			throw PrismaException.catch( error );
		}
	}


	async findAllPaginated( filterDto: SubCategoryPaginationFilterDto ): Promise<PaginatedResult<Subcategory>> {
		try {
			const {
				page = 1,
				size = 10,
				name,
				active,
				categoryIds,
				includeCategory = false,
				orderBy = SubCategoryOrderField.NAME,
				order = 'asc',
			} = filterDto;

			const skip = ( page - 1 ) * size;

			const where: Prisma.SubcategoryWhereInput = {
				...( name && { name : { contains : name, mode : 'insensitive' } } ),
				...( active !== undefined && { active } ),
				...( categoryIds && categoryIds.length > 0 && { categoryId : { in : categoryIds } } ),
			};

			const [ total, data ] = await Promise.all( [
				this.prisma.subcategory.count( { where } ),
				this.prisma.subcategory.findMany( {
					where,
					skip,
					take    : size,
					include : {
						category : includeCategory,
					},
					orderBy : {
						[ orderBy ] : order,
					},
				} ),
			] );

			return {
				data,
				meta : {
					total      : total,
					page       : page,
					size       : size,
					totalPages : Math.ceil( total / size ),
				},
			};
		} catch ( error ) {
			throw PrismaException.catch( error );
		}
	}


	async findOne( id: string ): Promise<Subcategory> {
		try {
			return await this.prisma.subcategory.findUniqueOrThrow({
				where : { id },
			});
		} catch ( error ) {
			throw PrismaException.catch( error );
		}
	}


	async update( id: string, updateSubCategoryDto: UpdateSubCategoryDto ): Promise<Subcategory> {
		try {
			return await this.prisma.subcategory.update({
				where : { id },
				data  : updateSubCategoryDto,
			});
		} catch ( error ) {
			throw PrismaException.catch( error );
		}
	}


	async remove( id: string ): Promise<Subcategory> {
		try {
			return await this.prisma.subcategory.delete({
				where : { id },
			});
		} catch ( error ) {
			throw PrismaException.catch( error );
		}
	}

}

