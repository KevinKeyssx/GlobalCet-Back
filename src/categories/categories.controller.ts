import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    ParseBoolPipe,
    UseGuards
}               from '@nestjs/common';
import {
    ApiTags,
    ApiBody,
    ApiHeader
}               from '@nestjs/swagger';

import { Category }         from '@prisma/client';

import { SecretGuard }                  from '@common/guards/secret.guard';
import { CategoriesService }            from '@categories/categories.service';
import { CreateCategoryDto }            from '@categories/dto/create-category.dto';
import { UpdateCategoryDto }            from '@categories/dto/update-category.dto';
import { CategoryPaginationFilterDto }  from '@categories/dto/pagination-filter.dto';
import { PaginatedResult }              from '@common/interfaces/paginated-result.interface';


@ApiTags( 'Categories' )
@UseGuards( SecretGuard )
@Controller( 'categories' )
@ApiHeader({
    name : 'x-secret',
    description : 'Secret key to authenticate requests',
    required : true
})
export class CategoriesController {

    constructor(
        private readonly categoriesService: CategoriesService
    ) {}


    @Post()
    @ApiBody( { type : CreateCategoryDto } )
    create(
        @Body() createCategoryDto: CreateCategoryDto
    ): Promise<Category> {
        return this.categoriesService.create( createCategoryDto );
    }


    @Get()
    findAll(
        @Query( 'includeSubcategories', new ParseBoolPipe( { optional : true } ) ) includeSubcategories: boolean = false
    ): Promise<any[]> {
        return this.categoriesService.findAll( includeSubcategories );
    }


    @Get( 'paginated' )
    findAllPaginated(
        @Query() filterDto: CategoryPaginationFilterDto
    ): Promise<PaginatedResult<Category>> {
        return this.categoriesService.findAllPaginated( filterDto );
    }


    @Get( ':id' )
    findOne(
        @Param( 'id' ) id: string,
        @Query( 'includeSubcategories', new ParseBoolPipe( { optional : true } ) ) includeSubcategories: boolean = false
    ): Promise<Category> {
        return this.categoriesService.findOne( id, includeSubcategories );
    }


    @Patch( ':id' )
    @ApiBody( { type : UpdateCategoryDto } )
    update(
        @Param( 'id' ) id: string,
        @Body() updateCategoryDto: UpdateCategoryDto
    ): Promise<Category> {
        return this.categoriesService.update( id, updateCategoryDto );
    }


    @Delete( ':id' )
    remove(
        @Param( 'id' ) id: string
    ): Promise<Category> {
        return this.categoriesService.remove( id );
    }

}

