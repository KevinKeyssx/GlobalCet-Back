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
	UseGuards,
}                           from '@nestjs/common';
import {
    ApiBody,
    ApiConsumes,
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiHeader
}                           from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Kit }              from '@prisma/client';

import { SecretGuard }                  from '@common/guards/secret.guard';
import { ENVS }                         from '@config/envs';
import { PaginatedResult }              from '@common/interfaces/paginated-result.interface';
import { IKit, IKitProduct }            from '@kits/models/kit.interface';
import { KitsService }                  from '@kits/kits.service';
import { CreateKitDto }                 from '@kits/dto/create-kit.dto';
import { UpdateKitDto }                 from '@kits/dto/update-kit.dto';
import { KitPaginationFilterDto }       from '@kits/dto/pagination-filter.dto';
import { UploadKitFilesDto }            from '@kits/dto/upload-kit-files.dto';
import { UpdateKitFilesDto }            from '@kits/dto/update-kit-files.dto';
import { DeleteKitFilesDto }            from '@kits/dto/delete-kit-files.dto';
import { AddKitProductsDto }            from '@kits/dto/add-kit-products.dto';
import { UpdateKitProductRelationDto }  from '@kits/dto/kit-product.dto';
import { DeleteKitProductsDto }         from '@kits/dto/delete-kit-products.dto';
import { IncludesKitDto }               from '@kits/dto/includes.dto';


@ApiTags( 'Kits' )
@UseGuards( SecretGuard )
@Controller( 'kits' )
@ApiHeader({
    name : 'x-secret',
    description : 'Secret key to authenticate requests',
    required : true
})
export class KitsController {

	constructor(
		private readonly kitsService: KitsService,
	) {}


	@Post()
	@ApiConsumes( 'multipart/form-data' )
	@ApiBody( { type : CreateKitDto } )
	@UseInterceptors( FilesInterceptor( 'files', ENVS.FILE_UPLOAD_LIMIT ) )
	@ApiOperation( { summary : 'Crear un nuevo kit con subida inicial de archivos y asociación de productos' } )
	@ApiResponse( { status : 201, description : 'Kit creado exitosamente.' } )
	@ApiResponse( { status : 400, description : 'Petición inválida.' } )
	@ApiResponse( { status : 409, description : 'Ya existe un kit con el mismo SKU o nombre.' } )
	create(
		@Body() createKitDto: CreateKitDto,
		@UploadedFiles() files: Express.Multer.File[],
	): Promise<IKit> {
		if ( files && files.length > ENVS.FILE_UPLOAD_LIMIT ) {
			throw new BadRequestException( `Puedes subir un máximo de ${ ENVS.FILE_UPLOAD_LIMIT } archivos` );
		}

		return this.kitsService.create( createKitDto, files );
	}


	@Get()
	@ApiOperation( { summary : 'Obtener listado de kits paginado con filtros e inclusiones dinámicas' } )
	@ApiResponse( { status : 200, description : 'Listado obtenido exitosamente.' } )
	findAll(
		@Query() filterDto: KitPaginationFilterDto,
	): Promise<PaginatedResult<IKit>> {
		return this.kitsService.findAll( filterDto );
	}


	@Get( ':id' )
	@ApiOperation( { summary : 'Obtener el detalle de un kit por su ID' } )
	@ApiParam( { name : 'id', description : 'ID del kit (ULID)' } )
	@ApiResponse( { status : 200, description : 'Detalle obtenido exitosamente.' } )
	@ApiResponse( { status : 404, description : 'Kit no encontrado.' } )
	findOne(
		@Param( 'id' ) id: string,
		@Query() includesKitDto: IncludesKitDto,
	): Promise<IKit> {
		return this.kitsService.findOne( id, includesKitDto );
	}


	@Patch( ':id' )
	@ApiOperation( { summary : 'Actualizar los campos planos de un kit por su ID' } )
	@ApiParam( { name : 'id', description : 'ID del kit (ULID)' } )
	@ApiResponse( { status : 200, description : 'Kit actualizado exitosamente.' } )
	@ApiResponse( { status : 404, description : 'Kit no encontrado.' } )
	@ApiResponse( { status : 409, description : 'Ya existe otro kit con el mismo SKU o nombre.' } )
	update(
		@Param( 'id' ) id: string,
		@Body() updateKitDto: UpdateKitDto,
	): Promise<IKit> {
		return this.kitsService.update( id, updateKitDto );
	}


	@Delete( ':id' )
	@ApiOperation( { summary : 'Eliminar físicamente un kit por su ID y todos sus archivos asociados' } )
	@ApiParam( { name : 'id', description : 'ID del kit (ULID)' } )
	@ApiResponse( { status : 200, description : 'Kit eliminado exitosamente.' } )
	@ApiResponse( { status : 404, description : 'Kit no encontrado.' } )
	remove(
		@Param( 'id' ) id: string,
	): Promise<Kit> {
		return this.kitsService.remove( id );
	}


	// --- GESTIÓN DE ARCHIVOS DEL KIT (KitFile) ---
	@Post( ':id/files' )
	@ApiConsumes( 'multipart/form-data' )
	@UseInterceptors( FilesInterceptor( 'files', ENVS.FILE_UPLOAD_LIMIT ) )
	@ApiOperation( { summary : 'Subir y asociar nuevos archivos a un kit existente' } )
	@ApiParam( { name : 'id', description : 'ID del kit (ULID)' } )
	@ApiResponse( { status : 201, description : 'Archivos subidos y asociados exitosamente.' } )
	@ApiResponse( { status : 400, description : 'Petición inválida o superación del límite de archivos.' } )
	uploadFiles(
		@Param( 'id' ) kitId: string,
		@UploadedFiles() files: Express.Multer.File[],
		@Body() uploadKitFilesDto: UploadKitFilesDto,
	): Promise<IKit> {
		if ( !files || files.length === 0 ) {
			throw new BadRequestException( 'No se proporcionaron archivos para subir' );
		}

		if ( files.length > ENVS.FILE_UPLOAD_LIMIT ) {
			throw new BadRequestException( `Puedes subir un máximo de ${ ENVS.FILE_UPLOAD_LIMIT } archivos` );
		}

		return this.kitsService.uploadKitFiles( kitId, files, uploadKitFilesDto.filesInfo );
	}


	@Patch( ':id/files/info' )
	@ApiBody( { type : UpdateKitFilesDto } )
	@ApiOperation( { summary : 'Actualizar masivamente los metadatos de los archivos del kit (alt, isMain, order)' } )
	@ApiParam( { name : 'id', description : 'ID del kit (ULID)' } )
	@ApiResponse( { status : 200, description : 'Metadatos de archivos actualizados exitosamente.' } )
	@ApiResponse( { status : 400, description : 'Petición inválida.' } )
	updateKitFilesInfo(
		@Param( 'id' ) kitId: string,
		@Body() updateKitFilesDto: UpdateKitFilesDto,
	): Promise<IKit> {
		return this.kitsService.updateKitFilesInfo( kitId, updateKitFilesDto );
	}


	@Delete( ':id/file/:fileId' )
	@ApiOperation( { summary : 'Eliminar un archivo individual asociado al kit tanto en Cloudinary como en base de datos' } )
	@ApiParam( { name : 'id', description : 'ID del kit (ULID)' } )
	@ApiParam( { name : 'fileId', description : 'ID del archivo (ULID)' } )
	@ApiResponse( { status : 200, description : 'Archivo eliminado exitosamente.' } )
	@ApiResponse( { status : 404, description : 'Archivo no encontrado.' } )
	deleteFile(
		@Param( 'id' ) kitId: string,
		@Param( 'fileId' ) fileId: string,
	): Promise<{ message: string }> {
		return this.kitsService.deleteKitFile( kitId, fileId );
	}


	@Post( ':id/files/delete' )
	@ApiBody( { type : DeleteKitFilesDto } )
	@ApiOperation( { summary : 'Eliminar masivamente múltiples archivos asociados al kit' } )
	@ApiParam( { name : 'id', description : 'ID del kit (ULID)' } )
	@ApiResponse( { status : 200, description : 'Archivos eliminados exitosamente.' } )
	@ApiResponse( { status : 400, description : 'Petición inválida.' } )
	deleteFiles(
		@Param( 'id' ) kitId: string,
		@Body() deleteKitFilesDto: DeleteKitFilesDto,
	): Promise<{ message: string }> {
		return this.kitsService.deleteKitFiles( kitId, deleteKitFilesDto );
	}


	// --- GESTIÓN DE PRODUCTOS ASOCIADOS AL KIT (KitProduct) ---
	@Post( ':id/products' )
	@ApiBody( { type : AddKitProductsDto } )
	@ApiOperation( { summary : 'Asociar o actualizar (upsert) masivamente productos y cantidades al kit' } )
	@ApiParam( { name : 'id', description : 'ID del kit (ULID)' } )
	@ApiResponse( { status : 200, description : 'Productos asociados/actualizados exitosamente.' } )
	@ApiResponse( { status : 400, description : 'Petición inválida.' } )
	addProducts(
		@Param( 'id' ) kitId: string,
		@Body() addKitProductsDto: AddKitProductsDto,
	): Promise<IKit> {
		return this.kitsService.addKitProducts( kitId, addKitProductsDto.products );
	}


	@Patch( ':id/products/:productId' )
	@ApiBody( { type : UpdateKitProductRelationDto } )
	@ApiOperation( { summary : 'Actualizar la cantidad de un producto específico asociado al kit' } )
	@ApiParam( { name : 'id', description : 'ID del kit (ULID)' } )
	@ApiParam( { name : 'productId', description : 'ID del producto (ULID)' } )
	@ApiResponse( { status : 200, description : 'Cantidad del producto actualizada exitosamente.' } )
	@ApiResponse( { status : 404, description : 'Relación de producto no encontrada.' } )
	updateProductQuantity(
		@Param( 'id' ) kitId: string,
		@Param( 'productId' ) productId: string,
		@Body() updateKitProductRelationDto: UpdateKitProductRelationDto,
	): Promise<IKitProduct> {
		return this.kitsService.updateKitProduct( kitId, productId, updateKitProductRelationDto.quantity );
	}


	@Delete( ':id/products/:productId' )
	@ApiOperation( { summary : 'Eliminar un producto específico del kit' } )
	@ApiParam( { name : 'id', description : 'ID del kit (ULID)' } )
	@ApiParam( { name : 'productId', description : 'ID del producto (ULID)' } )
	@ApiResponse( { status : 200, description : 'Producto eliminado del kit exitosamente.' } )
	@ApiResponse( { status : 404, description : 'Relación de producto no encontrada.' } )
	deleteProduct(
		@Param( 'id' ) kitId: string,
		@Param( 'productId' ) productId: string,
	): Promise<{ message: string }> {
		return this.kitsService.deleteKitProduct( kitId, productId );
	}


	@Post( ':id/products/delete' )
	@ApiBody( { type : DeleteKitProductsDto } )
	@ApiOperation( { summary : 'Eliminar masivamente múltiples productos asociados al kit por sus IDs de registro' } )
	@ApiParam( { name : 'id', description : 'ID del kit (ULID)' } )
	@ApiResponse( { status : 200, description : 'Productos eliminados del kit exitosamente.' } )
	@ApiResponse( { status : 400, description : 'Petición inválida.' } )
	deleteProducts(
		@Param( 'id' ) kitId: string,
		@Body() deleteKitProductsDto: DeleteKitProductsDto,
	): Promise<{ message: string }> {
		return this.kitsService.deleteKitProducts( kitId, deleteKitProductsDto );
	}

}
