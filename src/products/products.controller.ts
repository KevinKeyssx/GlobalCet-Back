import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	Query,
    UseInterceptors,
    BadRequestException,
    UploadedFiles,
    UseGuards
}                               from '@nestjs/common';

import {
    ApiBody,
    ApiConsumes,
    ApiHeader
}                           from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Product }          from '@prisma/client';

import { SecretGuard }                  from '@common/guards/secret.guard';
import { PaginatedResult }              from '@common/interfaces/paginated-result.interface';
import { ProductsService }              from '@products/products.service';
import { CreateProductDto }             from '@products/dto/create-product.dto';
import { UpdateProductDto }             from '@products/dto/update-product.dto';
import { ProductPaginationFilterDto }   from '@products/dto/pagination-filter.dto';
import { IProduct }                     from '@products/models/product.interface';
import { ENVS }                         from '@config/envs';
import { UploadProductImagesDto }       from '@products/dto/upload-product-images.dto';
import { UpdateProductImagesDto }       from '@products/dto/update-product-images.dto';
import { DeleteProductImagesDto }       from '@products/dto/delete-product-images.dto';
import { IncludesItemsDto }             from '@products/dto/includes-items.dto';


@UseGuards( SecretGuard )
@Controller( 'products' )
@ApiHeader({
    name : 'x-secret',
    description : 'Secret key to authenticate requests',
    required : true
})
export class ProductsController {

	constructor(
		private readonly productsService: ProductsService
	) {}


	@Post()
    @ApiConsumes( 'multipart/form-data' )
    @ApiBody({ type : CreateProductDto })
    @UseInterceptors( FilesInterceptor( 'files', ENVS.FILE_UPLOAD_LIMIT ) )
	create(
		@Body() createProductDto: CreateProductDto,
        @UploadedFiles() files   : Express.Multer.File[],
	): Promise<IProduct> {
        if ( files.length > ENVS.FILE_UPLOAD_LIMIT ) {
            throw new BadRequestException( `You can upload a maximum of ${ ENVS.FILE_UPLOAD_LIMIT } files` );
        }

        return this.productsService.create( createProductDto, files );
	}


    @Post( ':id/images' )
    @ApiConsumes( 'multipart/form-data' )
    @UseInterceptors( FilesInterceptor( 'files', ENVS.FILE_UPLOAD_LIMIT ) )
    uploadImages(
        @Param( 'id' ) productId : string,
        @UploadedFiles() files   : Express.Multer.File[],
        @Body() uploadProductImagesDto: UploadProductImagesDto,
    ): Promise<IProduct> {
        if ( !files || files.length === 0 ) {
            throw new BadRequestException( 'No se proporcionaron archivos para subir' );
        }

        if ( files.length > ENVS.FILE_UPLOAD_LIMIT ) {
            throw new BadRequestException( `You can upload a maximum of ${ ENVS.FILE_UPLOAD_LIMIT } files` );
        }

        return this.productsService.uploadProductImages( productId, files, uploadProductImagesDto );
    }


    @Patch( ':id/images/info' )
    @ApiBody({ type : UpdateProductImagesDto })
    updateProductImagesInfo(
        @Param( 'id' ) productId : string,
        @Body() updateProductImagesDto : UpdateProductImagesDto,
    ): Promise<IProduct> {
        return this.productsService.updateProductImagesInfo( productId, updateProductImagesDto );
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
		@Query() includesItemsDto: IncludesItemsDto
	): Promise<IProduct> {
		return this.productsService.findOne( id, includesItemsDto );
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


    @Delete( ':id/image/:imageId' )
    deleteImage(
        @Param( 'id' ) productId : string,
        @Param( 'imageId' ) imageId : string,
    ): Promise<{ message : string }> {
        return this.productsService.deleteProductImage( productId, imageId );
    }


    @Post( ':id/images/delete' )
    @ApiBody({ type : DeleteProductImagesDto })
    deleteImages(
        @Param( 'id' ) productId : string,
        @Body() deleteProductImagesDto : DeleteProductImagesDto,
    ): Promise<{ message : string }> {
        return this.productsService.deleteProductImages( productId, deleteProductImagesDto );
    }

}
