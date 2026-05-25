import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
	ApiHeader,
	ApiOperation,
	ApiQuery,
	ApiResponse,
	ApiTags
}                                            from '@nestjs/swagger';

import { GlobalSearchesService }             from './global-searches.service';
import {
	GlobalSearchQueryDto,
	GlobalSearchSortBy,
	GlobalSearchSortOrder
}                                            from './dto/global-search-query.dto';
import { IGlobalSearchResponse }             from './interfaces/global-search-result.interface';
import { SecretGuard }                       from '@common/guards/secret.guard';


@ApiTags( 'GlobalSearches' )
@UseGuards( SecretGuard )
@Controller( 'global-searches' )
@ApiHeader( {
	name        : 'x-secret',
	description : 'Secret key to authenticate requests',
	required    : true,
} )
export class GlobalSearchesController {

	constructor(
		private readonly globalSearchesService: GlobalSearchesService
	) {}


	@Get()
	@ApiOperation( { summary : 'Realizar búsqueda universal inteligente sobre productos, kits y laboratorios' } )
	@ApiResponse( { status : 200, description : 'Búsqueda ejecutada exitosamente.' } )
	@ApiResponse( { status : 401, description : 'No autorizado: Header x-secret inválido o ausente.' } )
	@ApiQuery( {
		name        : 'query',
		description : 'Término de búsqueda',
		required    : false,
		type        : 'string',
		example     : 'Silla',
	} )
	@ApiQuery( {
		name        : 'limitPerEntity',
		description : 'Número de resultados por entidad',
		required    : false,
		type        : 'number',
		example     : 10,
	} )
	@ApiQuery( {
		name        : 'suggestion',
		description : 'Indica si se debe sugerir la búsqueda',
		required    : false,
		type        : 'boolean',
		example     : false,
	} )
	@ApiQuery( {
		name        : 'sortBy',
		description : 'Campo por el cual ordenar los resultados',
		required    : false,
		enum        : GlobalSearchSortBy,
		example     : GlobalSearchSortBy.CREATED_AT,
	} )
	@ApiQuery( {
		name        : 'sortOrder',
		description : 'Orden de clasificación (asc o desc)',
		required    : false,
		enum        : GlobalSearchSortOrder,
		example     : GlobalSearchSortOrder.ASC,
	} )
	search(
		@Query() queryDto: GlobalSearchQueryDto
	): Promise<IGlobalSearchResponse> {
		return this.globalSearchesService.search( queryDto );
	}

}
