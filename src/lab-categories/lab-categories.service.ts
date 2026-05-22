import { Injectable, ConflictException } from '@nestjs/common';

import { PrismaException }              from '@prisma/prisma-catch';
import { PrismaService }                from '@prisma/prisma.service';
import { LabCategory, Prisma }          from '@prisma/client';
import { PaginatedResult }              from '@common/interfaces/paginated-result.interface';
import { CategoryPaginationFilterDto }  from '@common/dto/category-pagination-filter.dto';
import { CreateLabCategoryDto }         from './dto/create-lab-category.dto';
import { UpdateLabCategoryDto }         from './dto/update-lab-category.dto';


@Injectable()
export class LabCategoriesService {

	constructor(
		private readonly prisma: PrismaService,
	) {}


	async create( createLabCategoryDto: CreateLabCategoryDto ): Promise<LabCategory> {
		try {
			const existingCategory = await this.prisma.labCategory.findUnique( {
				where : { name : createLabCategoryDto.name },
			} );

			if ( existingCategory ) {
				throw new ConflictException( `Ya existe una categoría de laboratorio con el nombre "${ createLabCategoryDto.name }"` );
			}

			return await this.prisma.labCategory.create( {
				data : createLabCategoryDto,
			} );
		} catch ( error ) {
			throw PrismaException.catch( error );
		}
	}


	async findAll(): Promise<LabCategory[]> {
		try {
			return await this.prisma.labCategory.findMany( {
				orderBy : { name : 'asc' },
			} );
		} catch ( error ) {
			throw PrismaException.catch( error );
		}
	}


	async findAllPaginated( filterDto: CategoryPaginationFilterDto ): Promise<PaginatedResult<LabCategory>> {
		try {
			const {
				page = 1,
				size = 10,
				name,
				active,
			} = filterDto;

			const skip = ( page - 1 ) * size;

			const where: Prisma.LabCategoryWhereInput = {
				...( name && { name : { contains : name, mode : 'insensitive' } } ),
				...( active !== undefined && { active } ),
			};

			const [ total, data ] = await Promise.all( [
				this.prisma.labCategory.count( { where } ),
				this.prisma.labCategory.findMany( {
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


	async findOne( id: string ): Promise<LabCategory> {
		try {
			return await this.prisma.labCategory.findUniqueOrThrow( {
				where : { id },
			} );
		} catch ( error ) {
			throw PrismaException.catch( error );
		}
	}


	async update( id: string, updateLabCategoryDto: UpdateLabCategoryDto ): Promise<LabCategory> {
		try {
			if ( updateLabCategoryDto.name ) {
				const existingCategory = await this.prisma.labCategory.findFirst( {
					where : {
						name : updateLabCategoryDto.name,
						id   : { not : id },
					},
				} );

				if ( existingCategory ) {
					throw new ConflictException( `Ya existe otra categoría de laboratorio con el nombre "${ updateLabCategoryDto.name }"` );
				}
			}

			return await this.prisma.labCategory.update( {
				where : { id },
				data  : updateLabCategoryDto,
			} );
		} catch ( error ) {
			throw PrismaException.catch( error );
		}
	}


	async remove( id: string ): Promise<LabCategory> {
		try {
			return await this.prisma.labCategory.delete( {
				where : { id },
			} );
		} catch ( error ) {
			throw PrismaException.catch( error );
		}
	}

}
