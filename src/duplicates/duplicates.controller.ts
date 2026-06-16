import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { SecretGuard }       from '@common/guards/secret.guard';
import { DuplicatesService } from './duplicates.service';
import { IProduct }          from '@products/models/product.interface';
import { IKit }              from '@kits/models/kit.interface';
import { IMobileLab }        from '@mobile-labs/models/mobile-lab.interface';


@ApiTags( 'Duplicates' )
@UseGuards( SecretGuard )
@Controller( 'duplicates' )
@ApiHeader( {
	name		: 'x-secret',
	description	: 'Secret key to authenticate requests',
	required	: true
} )
export class DuplicatesController {

	constructor(
		private readonly duplicatesService: DuplicatesService
	) {}


	@Post( 'product/:id' )
	@ApiOperation( { summary : 'Duplicar un producto por su ID' } )
	@ApiParam( { name : 'id', description : 'ID del producto a duplicar' } )
	@ApiResponse( { status : 201, description : 'Producto duplicado exitosamente.' } )
	@ApiResponse( { status : 404, description : 'Producto no encontrado.' } )
	duplicateProduct(
		@Param( 'id' ) id: string
	): Promise< IProduct > {
		return this.duplicatesService.duplicateProduct( id );
	}


	@Post( 'kit/:id' )
	@ApiOperation( { summary : 'Duplicar un kit por su ID' } )
	@ApiParam( { name : 'id', description : 'ID del kit a duplicar' } )
	@ApiResponse( { status : 201, description : 'Kit duplicado exitosamente.' } )
	@ApiResponse( { status : 404, description : 'Kit no encontrado.' } )
	duplicateKit(
		@Param( 'id' ) id: string
	): Promise< IKit > {
		return this.duplicatesService.duplicateKit( id );
	}


	@Post( 'mobile-lab/:id' )
	@ApiOperation( { summary : 'Duplicar un laboratorio móvil por su ID' } )
	@ApiParam( { name : 'id', description : 'ID del laboratorio móvil a duplicar' } )
	@ApiResponse( { status : 201, description : 'Laboratorio móvil duplicado exitosamente.' } )
	@ApiResponse( { status : 404, description : 'Laboratorio móvil no encontrado.' } )
	duplicateMobileLab(
		@Param( 'id' ) id: string
	): Promise< IMobileLab > {
		return this.duplicatesService.duplicateMobileLab( id );
	}

}
