import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	Query,
	UseGuards,
}               from '@nestjs/common';
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiParam,
	ApiHeader,
}               from '@nestjs/swagger';

import { LabCategory } from '@prisma/client';

import { SecretGuard }                  from '@common/guards/secret.guard';
import { PaginatedResult }              from '@common/interfaces/paginated-result.interface';
import { CategoryPaginationFilterDto }  from '@common/dto/category-pagination-filter.dto';
import { LabCategoriesService }         from '@lab-categories/lab-categories.service';
import { CreateLabCategoryDto }         from '@lab-categories/dto/create-lab-category.dto';
import { UpdateLabCategoryDto }         from '@lab-categories/dto/update-lab-category.dto';


@ApiTags( 'Lab Categories' )
@UseGuards( SecretGuard )
@Controller( 'lab-categories' )
@ApiHeader({
    name : 'x-secret',
    description : 'Secret key to authenticate requests',
    required : true
})
export class LabCategoriesController {

	constructor(
		private readonly labCategoriesService: LabCategoriesService,
	) {}


	@Post()
	@ApiOperation( { summary : 'Crear una nueva categoría de laboratorios' } )
	@ApiResponse( { status : 201, description : 'Categoría creada exitosamente.' } )
	@ApiResponse( { status : 400, description : 'Petición inválida.' } )
	@ApiResponse( { status : 409, description : 'Ya existe una categoría con ese nombre.' } )
	create( @Body() createLabCategoryDto: CreateLabCategoryDto ): Promise<LabCategory> {
		return this.labCategoriesService.create( createLabCategoryDto );
	}


	@Get()
	@ApiOperation( { summary : 'Obtener todas las categorías de laboratorios ordenadas alfabéticamente' } )
	@ApiResponse( { status : 200, description : 'Listado obtenido exitosamente.' } )
	findAll(): Promise<LabCategory[]> {
		return this.labCategoriesService.findAll();
	}


	@Get( 'paginated' )
	@ApiOperation( { summary : 'Obtener categorías de laboratorios paginadas con filtros' } )
	@ApiResponse( { status : 200, description : 'Listado paginado obtenido exitosamente.' } )
	findAllPaginated( @Query() filterDto: CategoryPaginationFilterDto ): Promise<PaginatedResult<LabCategory>> {
		return this.labCategoriesService.findAllPaginated( filterDto );
	}


	@Get( ':id' )
	@ApiOperation( { summary : 'Obtener el detalle de una categoría de laboratorios por su ID' } )
	@ApiParam( { name : 'id', description : 'ID de la categoría (ULID)' } )
	@ApiResponse( { status : 200, description : 'Detalle obtenido exitosamente.' } )
	@ApiResponse( { status : 404, description : 'Categoría no encontrada.' } )
	findOne( @Param( 'id' ) id: string ): Promise<LabCategory> {
		return this.labCategoriesService.findOne( id );
	}


	@Patch( ':id' )
	@ApiOperation( { summary : 'Actualizar una categoría de laboratorios por su ID' } )
	@ApiParam( { name : 'id', description : 'ID de la categoría (ULID)' } )
	@ApiResponse( { status : 200, description : 'Categoría actualizada exitosamente.' } )
	@ApiResponse( { status : 404, description : 'Categoría no encontrada.' } )
	@ApiResponse( { status : 409, description : 'Ya existe otra categoría con ese nombre.' } )
	update(
		@Param( 'id' ) id: string,
		@Body() updateLabCategoryDto: UpdateLabCategoryDto,
	): Promise<LabCategory> {
		return this.labCategoriesService.update( id, updateLabCategoryDto );
	}


	@Delete( ':id' )
	@ApiOperation( { summary : 'Eliminar físicamente una categoría de laboratorios por su ID' } )
	@ApiParam( { name : 'id', description : 'ID de la categoría (ULID)' } )
	@ApiResponse( { status : 200, description : 'Categoría eliminada exitosamente.' } )
	@ApiResponse( { status : 404, description : 'Categoría no encontrada.' } )
	remove( @Param( 'id' ) id: string ): Promise<LabCategory> {
		return this.labCategoriesService.remove( id );
	}

}
