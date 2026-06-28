import { ApiProperty, ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';

import {
	IsOptional,
	IsString,
	IsNotEmpty,
	Length,
	IsArray,
	ValidateNested,
	IsBoolean,
}                       from 'class-validator';
import {
    Transform,
    Type,
    plainToInstance
}                       from 'class-transformer';

import { NameDto }          from '@common/dto/name.dto';
import { UploadFilesDto }   from '@common/dto/upload-files.dto';
import { FileConfigDto }    from '@common/dto/file-config.dto';
import { KitProductDto }    from '@kits/dto/kit-product.dto';
import { PriceStock }       from '@common/dto/price-stock.dto';


export class CreateKitDto extends IntersectionType(
    UploadFilesDto,
    NameDto,
    PriceStock
) {

	@ApiProperty( {
		description : 'SKU único del kit',
		example     : 'KIT-BIO-001',
	} )
	@IsString()
	@IsNotEmpty()
	@Length( 1, 50 )
	sku: string;

	@ApiPropertyOptional( {
		description : 'Descripción detallada del kit',
		example     : 'Este kit contiene insumos avanzados para laboratorios de bioquímica.',
	} )
	@IsString()
	@IsOptional()
	description?: string;

	@ApiProperty( {
		description : 'ID de la categoría del kit (ULID)',
		example     : '01ARZ3NDEKTSV4RRFFQ6KHNQZS',
	} )
	@IsString()
	@IsNotEmpty()
	@Length( 26, 26 )
	categoryId: string;

	@ApiPropertyOptional( {
		description : 'Estado de activación del kit',
		example     : true,
		default     : true,
	} )
	@IsOptional()
	@IsBoolean()
	@Transform( ( { value } ) => value === 'true' || value === true )
	active?: boolean;

	@ApiPropertyOptional( {
		description : 'Arreglo con la configuración de metadatos de los archivos (JSON stringified)',
		type        : 'string',
		example     : '[{"alt":"Vista frontal","isMain":true,"order":0}]',
	} )
	@IsOptional()
	@Transform( ( { value } ) => {
		if ( typeof value === 'string' ) {
			try {
				const parsed = JSON.parse( value );
				return plainToInstance( FileConfigDto, parsed );
			} catch ( error ) {
				return [];
			}
		}
		return plainToInstance( FileConfigDto, value );
	} )
	@IsArray()
	@ValidateNested( { each : true } )
	@Type( () => FileConfigDto )
	filesInfo?: FileConfigDto[];

	@ApiPropertyOptional( {
		description : 'Arreglo con los productos asociados y sus cantidades (JSON stringified)',
		type        : 'string',
		example     : '[{"productId":"01ARZ3NDEKTSV4RRFFQ6KHNQZS","quantity":2}]',
	} )
	@IsOptional()
	@Transform( ( { value } ) => {
		if ( typeof value === 'string' ) {
			try {
				const parsed = JSON.parse( value );
				return plainToInstance( KitProductDto, parsed );
			} catch ( error ) {
				return [];
			}
		}
		return plainToInstance( KitProductDto, value );
	} )
	@IsArray()
	@ValidateNested( { each : true } )
	@Type( () => KitProductDto )
	products?: KitProductDto[];

}
