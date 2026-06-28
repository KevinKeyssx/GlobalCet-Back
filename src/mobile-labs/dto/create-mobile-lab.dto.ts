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

import { NameDto }              from '@common/dto/name.dto';
import { UploadFilesDto }       from '@common/dto/upload-files.dto';
import { FileConfigDto }        from '@common/dto/file-config.dto';
import { MobileLabProductDto }  from '@mobile-labs/dto/mobile-lab-product.dto';
import { MobileLabKitDto }      from './mobile-lab-kit.dto';
import { PriceStock }           from '@common/dto/price-stock.dto';


export class CreateMobileLabDto extends IntersectionType(
    UploadFilesDto,
    NameDto,
    PriceStock
) {

	@ApiProperty( {
		description : 'SKU único del laboratorio móvil',
		example     : 'LAB-BIO-001',
	} )
	@IsString()
	@IsNotEmpty()
	@Length( 1, 50 )
	sku: string;

	@ApiPropertyOptional( {
		description : 'Descripción detallada del laboratorio móvil',
		example     : 'Laboratorio de bioquímica móvil totalmente equipado.',
	} )
	@IsString()
	@IsOptional()
	description?: string;

	@ApiPropertyOptional( {
		description : 'Dimensiones físicas del laboratorio móvil',
		example     : '6m x 2.4m x 2.6m',
	} )
	@IsString()
	@IsOptional()
	dimensions?: string;

	@ApiProperty( {
		description : 'ID de la categoría del laboratorio (LabCategory) (ULID)',
		example     : '01ARZ3NDEKTSV4RRFFQ6KHNQZS',
	} )
	@IsString()
	@IsNotEmpty()
	@Length( 26, 26 )
	categoryId: string;

	@ApiPropertyOptional( {
		description : 'Estado de activación del laboratorio móvil',
		example     : true,
		default     : true,
	} )
	@IsOptional()
	@IsBoolean()
	@Transform( ( { value } ) => value === 'true' || value === true )
	active?: boolean = true;

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
				return plainToInstance( MobileLabProductDto, parsed );
			} catch ( error ) {
				return [];
			}
		}
		return plainToInstance( MobileLabProductDto, value );
	} )
	@IsArray()
	@ValidateNested( { each : true } )
	@Type( () => MobileLabProductDto )
	products?: MobileLabProductDto[];

	@ApiPropertyOptional( {
		description : 'Arreglo con los kits asociados y sus cantidades (JSON stringified)',
		type        : 'string',
		example     : '[{"kitId":"01ARZ3NDEKTSV4RRFFQ6KHNQZS","quantity":1}]',
	} )
	@IsOptional()
	@Transform( ( { value } ) => {
		if ( typeof value === 'string' ) {
			try {
				const parsed = JSON.parse( value );
				return plainToInstance( MobileLabKitDto, parsed );
			} catch ( error ) {
				return [];
			}
		}
		return plainToInstance( MobileLabKitDto, value );
	} )
	@IsArray()
	@ValidateNested( { each : true } )
	@Type( () => MobileLabKitDto )
	kits?: MobileLabKitDto[];

}
