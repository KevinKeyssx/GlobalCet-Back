import { Injectable } from '@nestjs/common';

import { PrismaException }      from '@prisma/prisma-catch';
import { PrismaService }        from '@prisma/prisma.service';
import { CreateCategoryDto }    from '@categories/dto/create-category.dto';
import { UpdateCategoryDto }    from '@categories/dto/update-category.dto';
import { Category }             from '@prisma/client';


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


	async findAll( includeSubcategories: boolean = false ): Promise<Category[]> {
		try {
			return await this.prisma.category.findMany({
				include : {
					subCategories : includeSubcategories,
				},
			});
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

