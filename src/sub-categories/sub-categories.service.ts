import { Injectable } from '@nestjs/common';

import { PrismaException }         from '@prisma/prisma-catch';
import { PrismaService }           from '@prisma/prisma.service';
import { CreateSubCategoryDto }    from '@sub-categories/dto/create-sub-category.dto';
import { UpdateSubCategoryDto }    from '@sub-categories/dto/update-sub-category.dto';
import { Subcategory }             from '@prisma/client';


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

