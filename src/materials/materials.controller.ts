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
}                           from '@nestjs/common';
import { ApiTags, ApiBody, ApiHeader } from '@nestjs/swagger';
import { Material }         from '@prisma/client';

import { SecretGuard }                  from '@common/guards/secret.guard';
import { MaterialsService }             from './materials.service';
import { CreateMaterialDto }            from './dto/create-material.dto';
import { UpdateMaterialDto }            from './dto/update-material.dto';
import { MaterialPaginationFilterDto }   from './dto/pagination-filter.dto';
import { PaginatedResult }              from '@common/interfaces/paginated-result.interface';


@ApiTags( 'Materials' )
@UseGuards( SecretGuard )
@Controller( 'materials' )
@ApiHeader({
    name : 'x-secret',
    description : 'Secret key to authenticate requests',
    required : true
})
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
