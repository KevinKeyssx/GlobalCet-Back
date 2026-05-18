import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete
} from '@nestjs/common';
import { ApiTags, ApiBody } from '@nestjs/swagger';

import { SubCategoriesService } from './sub-categories.service';
import { CreateSubCategoryDto } from './dto/create-sub-category.dto';
import { UpdateSubCategoryDto } from './dto/update-sub-category.dto';
import { Subcategory }          from '@prisma/client';


@ApiTags( 'Sub-Categories' )
@Controller( 'sub-categories' )
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

