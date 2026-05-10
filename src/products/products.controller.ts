import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	Query
} from '@nestjs/common';

import { Product }                      from '@prisma/client';
import { ProductsService }              from './products.service';
import { CreateProductDto }             from './dto/create-product.dto';
import { UpdateProductDto }             from './dto/update-product.dto';
import { ProductPaginationFilterDto }   from './dto/pagination-filter.dto';
import { PaginatedResult }              from '@common/interfaces/paginated-result.interface';


@Controller( 'products' )
export class ProductsController {

	constructor(
		private readonly productsService: ProductsService
	) {}


	@Post()
	create(
		@Body() createProductDto: CreateProductDto
	): Promise<Product> {
		return this.productsService.create( createProductDto );
	}


	@Get()
	findAll(
		@Query() filterDto: ProductPaginationFilterDto
	): Promise<PaginatedResult<Product>> {
		return this.productsService.findAll( filterDto );
	}


	@Get( 'technical-specs' )
	getTechnicalSpecsFilters(): Promise<Record<string, any[]>> {
		return this.productsService.getTechnicalSpecsFilters();
	}


	@Get( ':id' )
	findOne(
		@Param( 'id' ) id: string,
		@Query() filterDto: ProductPaginationFilterDto
	): Promise<Product> {
		return this.productsService.findOne( id, filterDto );
	}


	@Patch( ':id' )
	update(
		@Param( 'id' ) id: string,
		@Body() updateProductDto: UpdateProductDto
	): Promise<Product> {
		return this.productsService.update( id, updateProductDto );
	}


	@Delete( ':id' )
	remove(
		@Param( 'id' ) id: string
	): Promise<Product> {
		return this.productsService.remove( id );
	}

}
