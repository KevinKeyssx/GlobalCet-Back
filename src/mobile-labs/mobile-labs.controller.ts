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
}                           from '@nestjs/common';
import {
	ApiBody,
	ApiConsumes,
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiParam,
}                           from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { MobileLab }        from '@prisma/client';

import { ENVS }                         from '@config/envs';
import { PaginatedResult }              from '@common/interfaces/paginated-result.interface';
import {
	IMobileLab,
	IMobileLabProduct,
	IMobileLabKit,
}                                       from './models/mobile-lab.interface';
import { MobileLabsService }            from './mobile-labs.service';
import { CreateMobileLabDto }           from './dto/create-mobile-lab.dto';
import { UpdateMobileLabDto }           from './dto/update-mobile-lab.dto';
import { MobileLabPaginationFilterDto } from './dto/pagination-filter.dto';
import { UploadMobileLabFilesDto }      from './dto/upload-mobile-lab-files.dto';
import { UpdateMobileLabFilesDto }      from './dto/update-mobile-lab-files.dto';
import { DeleteMobileLabFilesDto }      from './dto/delete-mobile-lab-files.dto';
import { AddMobileLabProductsDto }      from './dto/add-mobile-lab-products.dto';
import { UpdateMobileLabProductRelationDto } from './dto/mobile-lab-product.dto';
import { AddMobileLabKitsDto }          from './dto/add-mobile-lab-kits.dto';
import { UpdateMobileLabKitRelationDto }     from './dto/mobile-lab-kit.dto';
import { DeleteMobileLabRelationsDto }  from './dto/delete-mobile-lab-relations.dto';


@ApiTags( 'Laboratorios Móviles' )
@Controller( 'mobile-labs' )
export class MobileLabsController {

	constructor(
		private readonly mobileLabsService : MobileLabsService,
	) {}


	@Post()
	@ApiConsumes( 'multipart/form-data' )
	@ApiBody( { type : CreateMobileLabDto } )
	@UseInterceptors( FilesInterceptor( 'files', ENVS.FILE_UPLOAD_LIMIT ) )
	@ApiOperation( { summary : 'Crear un nuevo laboratorio móvil con subida inicial de archivos y asociación de productos/kits' } )
	@ApiResponse( { status : 201, description : 'Laboratorio móvil creado exitosamente.' } )
	@ApiResponse( { status : 400, description : 'Petición inválida.' } )
	@ApiResponse( { status : 409, description : 'Ya existe un laboratorio móvil con el mismo SKU o nombre.' } )
	create(
		@Body() createMobileLabDto : CreateMobileLabDto,
		@UploadedFiles() files     : Express.Multer.File[],
	) : Promise<IMobileLab> {
		if ( files && files.length > ENVS.FILE_UPLOAD_LIMIT ) {
			throw new BadRequestException( `Puedes subir un máximo de ${ ENVS.FILE_UPLOAD_LIMIT } archivos` );
		}

		return this.mobileLabsService.create( createMobileLabDto, files );
	}


	@Get()
	@ApiOperation( { summary : 'Obtener listado de laboratorios móviles paginado con filtros e inclusiones dinámicas' } )
	@ApiResponse( { status : 200, description : 'Listado obtenido exitosamente.' } )
	findAll(
		@Query() filterDto : MobileLabPaginationFilterDto,
	) : Promise<PaginatedResult<IMobileLab>> {
		return this.mobileLabsService.findAll( filterDto );
	}


	@Get( ':id' )
	@ApiOperation( { summary : 'Obtener el detalle de un laboratorio móvil por su ID' } )
	@ApiParam( { name : 'id', description : 'ID del laboratorio móvil (ULID)' } )
	@ApiResponse( { status : 200, description : 'Detalle obtenido exitosamente.' } )
	@ApiResponse( { status : 404, description : 'Laboratorio móvil no encontrado.' } )
	findOne(
		@Param( 'id' ) id : string,
		@Query() filterDto : MobileLabPaginationFilterDto,
	) : Promise<IMobileLab> {
		return this.mobileLabsService.findOne( id, filterDto );
	}


	@Patch( ':id' )
	@ApiOperation( { summary : 'Actualizar los campos planos de un laboratorio móvil por su ID' } )
	@ApiParam( { name : 'id', description : 'ID del laboratorio móvil (ULID)' } )
	@ApiResponse( { status : 200, description : 'Laboratorio móvil actualizado exitosamente.' } )
	@ApiResponse( { status : 404, description : 'Laboratorio móvil no encontrado.' } )
	@ApiResponse( { status : 409, description : 'Ya existe otro laboratorio móvil con el mismo SKU o nombre.' } )
	update(
		@Param( 'id' ) id : string,
		@Body() updateMobileLabDto : UpdateMobileLabDto,
	) : Promise<IMobileLab> {
		return this.mobileLabsService.update( id, updateMobileLabDto );
	}


	@Delete( ':id' )
	@ApiOperation( { summary : 'Eliminar físicamente un laboratorio móvil por su ID y todos sus archivos asociados' } )
	@ApiParam( { name : 'id', description : 'ID del laboratorio móvil (ULID)' } )
	@ApiResponse( { status : 200, description : 'Laboratorio móvil eliminado exitosamente.' } )
	@ApiResponse( { status : 404, description : 'Laboratorio móvil no encontrado.' } )
	remove(
		@Param( 'id' ) id : string,
	) : Promise<{ message : string }> {
		return this.mobileLabsService.remove( id );
	}


	// --- GESTIÓN DE ARCHIVOS DEL LABORATORIO MÓVIL (MobileLabFile) ---

	@Post( ':id/files' )
	@ApiConsumes( 'multipart/form-data' )
	@UseInterceptors( FilesInterceptor( 'files', ENVS.FILE_UPLOAD_LIMIT ) )
	@ApiOperation( { summary : 'Subir y asociar nuevos archivos a un laboratorio móvil existente' } )
	@ApiParam( { name : 'id', description : 'ID del laboratorio móvil (ULID)' } )
	@ApiResponse( { status : 201, description : 'Archivos subidos y asociados exitosamente.' } )
	@ApiResponse( { status : 400, description : 'Petición inválida o superación del límite de archivos.' } )
	uploadFiles(
		@Param( 'id' ) mobileLabId : string,
		@UploadedFiles() files     : Express.Multer.File[],
		@Body() dto                : UploadMobileLabFilesDto,
	) : Promise<IMobileLab> {
		if ( !files || files.length === 0 ) {
			throw new BadRequestException( 'No se proporcionaron archivos para subir' );
		}

		if ( files.length > ENVS.FILE_UPLOAD_LIMIT ) {
			throw new BadRequestException( `Puedes subir un máximo de ${ ENVS.FILE_UPLOAD_LIMIT } archivos` );
		}

		return this.mobileLabsService.uploadMobileLabFiles( mobileLabId, files, dto.filesInfo );
	}


	@Patch( ':id/files/info' )
	@ApiBody( { type : UpdateMobileLabFilesDto } )
	@ApiOperation( { summary : 'Actualizar masivamente los metadatos de los archivos del laboratorio móvil (alt, isMain, order)' } )
	@ApiParam( { name : 'id', description : 'ID del laboratorio móvil (ULID)' } )
	@ApiResponse( { status : 200, description : 'Metadatos de archivos actualizados exitosamente.' } )
	@ApiResponse( { status : 400, description : 'Petición inválida.' } )
	updateFilesInfo(
		@Param( 'id' ) mobileLabId : string,
		@Body() dto                : UpdateMobileLabFilesDto,
	) : Promise<IMobileLab> {
		return this.mobileLabsService.updateMobileLabFilesInfo( mobileLabId, dto );
	}


	@Delete( ':id/file/:fileId' )
	@ApiOperation( { summary : 'Eliminar un archivo individual asociado al laboratorio móvil tanto en Cloudinary como en base de datos' } )
	@ApiParam( { name : 'id', description : 'ID del laboratorio móvil (ULID)' } )
	@ApiParam( { name : 'fileId', description : 'ID del archivo (ULID)' } )
	@ApiResponse( { status : 200, description : 'Archivo eliminado exitosamente.' } )
	@ApiResponse( { status : 404, description : 'Archivo no encontrado.' } )
	deleteFile(
		@Param( 'id' ) mobileLabId : string,
		@Param( 'fileId' ) fileId   : string,
	) : Promise<{ message : string }> {
		return this.mobileLabsService.deleteMobileLabFile( mobileLabId, fileId );
	}


	@Post( ':id/files/delete' )
	@ApiBody( { type : DeleteMobileLabFilesDto } )
	@ApiOperation( { summary : 'Eliminar masivamente múltiples archivos asociados al laboratorio móvil' } )
	@ApiParam( { name : 'id', description : 'ID del laboratorio móvil (ULID)' } )
	@ApiResponse( { status : 200, description : 'Archivos eliminados exitosamente.' } )
	@ApiResponse( { status : 400, description : 'Petición inválida.' } )
	deleteFiles(
		@Param( 'id' ) mobileLabId : string,
		@Body() dto                : DeleteMobileLabFilesDto,
	) : Promise<{ message : string }> {
		return this.mobileLabsService.deleteMobileLabFiles( mobileLabId, dto );
	}


	// --- GESTIÓN DE PRODUCTOS ASOCIADOS AL LABORATORIO MÓVIL (MobileLabProduct) ---

	@Post( ':id/products' )
	@ApiBody( { type : AddMobileLabProductsDto } )
	@ApiOperation( { summary : 'Asociar o actualizar (upsert) masivamente productos y cantidades al laboratorio móvil' } )
	@ApiParam( { name : 'id', description : 'ID del laboratorio móvil (ULID)' } )
	@ApiResponse( { status : 200, description : 'Productos asociados/actualizados exitosamente.' } )
	@ApiResponse( { status : 400, description : 'Petición inválida.' } )
	addProducts(
		@Param( 'id' ) mobileLabId : string,
		@Body() dto                : AddMobileLabProductsDto,
	) : Promise<IMobileLab> {
		return this.mobileLabsService.addMobileLabProducts( mobileLabId, dto.products );
	}


	@Patch( ':id/products/:productId' )
	@ApiBody( { type : UpdateMobileLabProductRelationDto } )
	@ApiOperation( { summary : 'Actualizar la cantidad de un producto específico asociado al laboratorio móvil' } )
	@ApiParam( { name : 'id', description : 'ID del laboratorio móvil (ULID)' } )
	@ApiParam( { name : 'productId', description : 'ID del producto (ULID)' } )
	@ApiResponse( { status : 200, description : 'Cantidad del producto actualizada exitosamente.' } )
	@ApiResponse( { status : 404, description : 'Relación de producto no encontrada.' } )
	updateProductQuantity(
		@Param( 'id' ) mobileLabId  : string,
		@Param( 'productId' ) productId : string,
		@Body() dto                 : UpdateMobileLabProductRelationDto,
	) : Promise<IMobileLabProduct> {
		return this.mobileLabsService.updateMobileLabProductRelation( mobileLabId, productId, dto );
	}


	@Delete( ':id/products/:productId' )
	@ApiOperation( { summary : 'Eliminar un producto específico del laboratorio móvil' } )
	@ApiParam( { name : 'id', description : 'ID del laboratorio móvil (ULID)' } )
	@ApiParam( { name : 'productId', description : 'ID del producto (ULID)' } )
	@ApiResponse( { status : 200, description : 'Producto eliminado del laboratorio móvil exitosamente.' } )
	@ApiResponse( { status : 404, description : 'Relación de producto no encontrada.' } )
	deleteProduct(
		@Param( 'id' ) mobileLabId  : string,
		@Param( 'productId' ) productId : string,
	) : Promise<{ message : string }> {
		return this.mobileLabsService.deleteMobileLabProduct( mobileLabId, productId );
	}


	@Post( ':id/products/delete' )
	@ApiBody( { type : DeleteMobileLabRelationsDto } )
	@ApiOperation( { summary : 'Eliminar masivamente múltiples productos asociados al laboratorio móvil por sus IDs de registro' } )
	@ApiParam( { name : 'id', description : 'ID del laboratorio móvil (ULID)' } )
	@ApiResponse( { status : 200, description : 'Productos eliminados del laboratorio móvil exitosamente.' } )
	@ApiResponse( { status : 400, description : 'Petición inválida.' } )
	deleteProducts(
		@Param( 'id' ) mobileLabId : string,
		@Body() dto                : DeleteMobileLabRelationsDto,
	) : Promise<{ message : string }> {
		return this.mobileLabsService.deleteMobileLabProducts( mobileLabId, dto );
	}


	// --- GESTIÓN DE KITS ASOCIADOS AL LABORATORIO MÓVIL (MobileLabKit) ---

	@Post( ':id/kits' )
	@ApiBody( { type : AddMobileLabKitsDto } )
	@ApiOperation( { summary : 'Asociar o actualizar (upsert) masivamente kits y cantidades al laboratorio móvil' } )
	@ApiParam( { name : 'id', description : 'ID del laboratorio móvil (ULID)' } )
	@ApiResponse( { status : 200, description : 'Kits asociados/actualizados exitosamente.' } )
	@ApiResponse( { status : 400, description : 'Petición inválida.' } )
	addKits(
		@Param( 'id' ) mobileLabId : string,
		@Body() dto                : AddMobileLabKitsDto,
	) : Promise<IMobileLab> {
		return this.mobileLabsService.addMobileLabKits( mobileLabId, dto.kits );
	}


	@Patch( ':id/kits/:kitId' )
	@ApiBody( { type : UpdateMobileLabKitRelationDto } )
	@ApiOperation( { summary : 'Actualizar la cantidad de un kit específico asociado al laboratorio móvil' } )
	@ApiParam( { name : 'id', description : 'ID del laboratorio móvil (ULID)' } )
	@ApiParam( { name : 'kitId', description : 'ID del kit (ULID)' } )
	@ApiResponse( { status : 200, description : 'Cantidad del kit actualizada exitosamente.' } )
	@ApiResponse( { status : 404, description : 'Relación de kit no encontrada.' } )
	updateKitQuantity(
		@Param( 'id' ) mobileLabId : string,
		@Param( 'kitId' ) kitId     : string,
		@Body() dto                 : UpdateMobileLabKitRelationDto,
	) : Promise<IMobileLabKit> {
		return this.mobileLabsService.updateMobileLabKitRelation( mobileLabId, kitId, dto );
	}


	@Delete( ':id/kits/:kitId' )
	@ApiOperation( { summary : 'Eliminar un kit específico del laboratorio móvil' } )
	@ApiParam( { name : 'id', description : 'ID del laboratorio móvil (ULID)' } )
	@ApiParam( { name : 'kitId', description : 'ID del kit (ULID)' } )
	@ApiResponse( { status : 200, description : 'Kit eliminado del laboratorio móvil exitosamente.' } )
	@ApiResponse( { status : 404, description : 'Relación de kit no encontrada.' } )
	deleteKit(
		@Param( 'id' ) mobileLabId : string,
		@Param( 'kitId' ) kitId     : string,
	) : Promise<{ message : string }> {
		return this.mobileLabsService.deleteMobileLabKit( mobileLabId, kitId );
	}


	@Post( ':id/kits/delete' )
	@ApiBody( { type : DeleteMobileLabRelationsDto } )
	@ApiOperation( { summary : 'Eliminar masivamente múltiples kits asociados al laboratorio móvil por sus IDs de registro' } )
	@ApiParam( { name : 'id', description : 'ID del laboratorio móvil (ULID)' } )
	@ApiResponse( { status : 200, description : 'Kits eliminados del laboratorio móvil exitosamente.' } )
	@ApiResponse( { status : 400, description : 'Petición inválida.' } )
	deleteKits(
		@Param( 'id' ) mobileLabId : string,
		@Body() dto                : DeleteMobileLabRelationsDto,
	) : Promise<{ message : string }> {
		return this.mobileLabsService.deleteMobileLabKits( mobileLabId, dto );
	}

}
