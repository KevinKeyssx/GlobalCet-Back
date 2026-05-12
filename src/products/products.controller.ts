import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	Query
}                   from '@nestjs/common';
import { Product }  from '@prisma/client';

import { PaginatedResult }              from '@common/interfaces/paginated-result.interface';
import { ProductsService }              from '@products/products.service';
import { CreateProductDto }             from '@products/dto/create-product.dto';
import { UpdateProductDto }             from '@products/dto/update-product.dto';
import { ProductPaginationFilterDto }   from '@products/dto/pagination-filter.dto';
import { IProduct }                     from '@products/models/product.interface';


@Controller( 'products' )
export class ProductsController {

	constructor(
		private readonly productsService: ProductsService
	) {}


	@Post()
	create(
		@Body() createProductDto: CreateProductDto
	): Promise<IProduct> {
		return this.productsService.create( createProductDto );
	}


	@Get()
	findAll(
		@Query() filterDto: ProductPaginationFilterDto
	): Promise<PaginatedResult<IProduct>> {
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
	): Promise<IProduct> {
		return this.productsService.findOne( id, filterDto );
	}


	@Patch( ':id' )
	update(
		@Param( 'id' ) id: string,
		@Body() updateProductDto: UpdateProductDto
	): Promise<IProduct> {
		return this.productsService.update( id, updateProductDto );
	}


	@Delete( ':id' )
	remove(
		@Param( 'id' ) id: string
	): Promise<Product> {
		return this.productsService.remove( id );
	}

}
