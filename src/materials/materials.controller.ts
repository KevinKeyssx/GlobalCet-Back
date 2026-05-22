import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	Query
}                           from '@nestjs/common';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { Material }         from '@prisma/client';

import { MaterialsService }             from './materials.service';
import { CreateMaterialDto }            from './dto/create-material.dto';
import { UpdateMaterialDto }            from './dto/update-material.dto';
import { MaterialPaginationFilterDto }   from './dto/pagination-filter.dto';
import { PaginatedResult }              from '@common/interfaces/paginated-result.interface';


@ApiTags( 'Materials' )
@Controller( 'materials' )
export class MaterialsController {

	constructor(
		private readonly materialsService: MaterialsService,
	) {}


	@Post()
	@ApiBody( { type : CreateMaterialDto } )
	create(
		@Body() createMaterialDto: CreateMaterialDto
	): Promise<Material> {
		return this.materialsService.create( createMaterialDto );
	}


	@Get()
	findAll(): Promise<Material[]> {
		return this.materialsService.findAll();
	}


	@Get( 'paginated' )
	findAllPaginated(
		@Query() filterDto: MaterialPaginationFilterDto
	): Promise<PaginatedResult<Material>> {
		return this.materialsService.findAllPaginated( filterDto );
	}


	@Get( ':id' )
	findOne(
		@Param( 'id' ) id: string
	): Promise<Material> {
		return this.materialsService.findOne( id );
	}


	@Patch( ':id' )
	@ApiBody( { type : UpdateMaterialDto } )
	update(
		@Param( 'id' ) id: string,
		@Body() updateMaterialDto: UpdateMaterialDto
	): Promise<Material> {
		return this.materialsService.update( id, updateMaterialDto );
	}


	@Delete( ':id' )
	remove(
		@Param( 'id' ) id: string
	): Promise<Material> {
		return this.materialsService.remove( id );
	}

}
