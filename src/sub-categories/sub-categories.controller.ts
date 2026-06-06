import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	Query,
	UseGuards
} from '@nestjs/common';
import {
	ApiTags,
	ApiBody,
	ApiHeader
} from '@nestjs/swagger';

import { SecretGuard }                    from '@common/guards/secret.guard';
import { SubCategoriesService }           from './sub-categories.service';
import { CreateSubCategoryDto }           from './dto/create-sub-category.dto';
import { UpdateSubCategoryDto }           from './dto/update-sub-category.dto';
import { Subcategory }                    from '@prisma/client';
import { PaginatedResult }                from '@common/interfaces/paginated-result.interface';
import { SubCategoryPaginationFilterDto } from './dto/pagination-filter.dto';


@ApiTags( 'Sub-Categories' )
@UseGuards( SecretGuard )
@Controller( 'sub-categories' )
@ApiHeader({
    name : 'x-secret',
    description : 'Secret key to authenticate requests',
    required : true
})
export class SubCategoriesController {

	constructor(
		private readonly subCategoriesService: SubCategoriesService
	) {}


	@Post()
	@ApiBody( { type : CreateSubCategoryDto } )
	create(
		@Body() createSubCategoryDto: CreateSubCategoryDto
	): Promise<Subcategory> {
		return this.subCategoriesService.create( createSubCategoryDto );
	}


	@Get()
	findAll(): Promise<Subcategory[]> {
		return this.subCategoriesService.findAll();
	}


	@Get( 'paginated' )
	findAllPaginated(
		@Query() filterDto: SubCategoryPaginationFilterDto
	): Promise<PaginatedResult<Subcategory>> {
		return this.subCategoriesService.findAllPaginated( filterDto );
	}


    @Get( ':id' )
    findOne(
        @Param( 'id' ) id: string
    ): Promise<Subcategory> {
        return this.subCategoriesService.findOne( id );
    }


    @Patch( ':id' )
    @ApiBody( { type : UpdateSubCategoryDto } )
    update(
        @Param( 'id' ) id: string,
        @Body() updateSubCategoryDto: UpdateSubCategoryDto
    ): Promise<Subcategory> {
        return this.subCategoriesService.update( id, updateSubCategoryDto );
    }


    @Delete( ':id' )
    remove(
        @Param( 'id' ) id: string
    ): Promise<Subcategory> {
        return this.subCategoriesService.remove( id );
    }

}

