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
}               from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiHeader
}               from '@nestjs/swagger';

import { KitCategory } from '@prisma/client';

import { SecretGuard }                  from '@common/guards/secret.guard';
import { PaginatedResult }              from '@common/interfaces/paginated-result.interface';
import { CategoryPaginationFilterDto }  from '@common/dto/category-pagination-filter.dto';
import { KitCategoriesService }         from '@kit-categories/kit-categories.service';
import { CreateKitCategoryDto }         from '@kit-categories/dto/create-kit-category.dto';
import { UpdateKitCategoryDto }         from '@kit-categories/dto/update-kit-category.dto';


@ApiTags( 'Kit Categories' )
@UseGuards( SecretGuard )
@Controller( 'kit-categories' )
@ApiHeader({
    name : 'x-secret',
    description : 'Secret key to authenticate requests',
    required : true
})
export class KitCategoriesController {

	constructor(
		private readonly kitCategoriesService: KitCategoriesService,
	) {}


	@Post()
	@ApiOperation( { summary : 'Crear una nueva categoría de kits' } )
	@ApiResponse( { status : 201, description : 'Categoría creada exitosamente.' } )
	@ApiResponse( { status : 400, description : 'Petición inválida.' } )
	@ApiResponse( { status : 409, description : 'Ya existe una categoría con ese nombre.' } )
	create( @Body() createKitCategoryDto: CreateKitCategoryDto ): Promise<KitCategory> {
		return this.kitCategoriesService.create( createKitCategoryDto );
	}


	@Get()
	@ApiOperation( { summary : 'Obtener todas las categorías de kits ordenadas alfabéticamente' } )
	@ApiResponse( { status : 200, description : 'Listado obtenido exitosamente.' } )
	findAll(): Promise<{ id: string, name: string }[]> {
		return this.kitCategoriesService.findAll();
	}


	@Get( 'paginated' )
	@ApiOperation( { summary : 'Obtener categorías de kits paginadas con filtros' } )
	@ApiResponse( { status : 200, description : 'Listado paginado obtenido exitosamente.' } )
	findAllPaginated( @Query() filterDto: CategoryPaginationFilterDto ): Promise<PaginatedResult<KitCategory>> {
		return this.kitCategoriesService.findAllPaginated( filterDto );
	}


	@Get( ':id' )
	@ApiOperation( { summary : 'Obtener el detalle de una categoría de kits por su ID' } )
	@ApiParam( { name : 'id', description : 'ID de la categoría (ULID)' } )
	@ApiResponse( { status : 200, description : 'Detalle obtenido exitosamente.' } )
	@ApiResponse( { status : 404, description : 'Categoría no encontrada.' } )
	findOne( @Param( 'id' ) id: string ): Promise<KitCategory> {
		return this.kitCategoriesService.findOne( id );
	}


	@Patch( ':id' )
	@ApiOperation( { summary : 'Actualizar una categoría de kits por su ID' } )
	@ApiParam( { name : 'id', description : 'ID de la categoría (ULID)' } )
	@ApiResponse( { status : 200, description : 'Categoría actualizada exitosamente.' } )
	@ApiResponse( { status : 404, description : 'Categoría no encontrada.' } )
	@ApiResponse( { status : 409, description : 'Ya existe otra categoría con ese nombre.' } )
	update(
		@Param( 'id' ) id: string,
		@Body() updateKitCategoryDto: UpdateKitCategoryDto,
	): Promise<KitCategory> {
		return this.kitCategoriesService.update( id, updateKitCategoryDto );
	}


	@Delete( ':id' )
	@ApiOperation( { summary : 'Eliminar físicamente una categoría de kits por su ID' } )
	@ApiParam( { name : 'id', description : 'ID de la categoría (ULID)' } )
	@ApiResponse( { status : 200, description : 'Categoría activa eliminada exitosamente.' } )
	@ApiResponse( { status : 404, description : 'Categoría no encontrada.' } )
	remove( @Param( 'id' ) id: string ): Promise<KitCategory> {
		return this.kitCategoriesService.remove( id );
	}

}
