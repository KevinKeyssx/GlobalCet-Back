import { ApiProperty, ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';

import {
	IsOptional,
	IsObject,
	IsString,
	IsNotEmpty,
	Length,
	IsArray,
	ValidateNested,
}                       from 'class-validator';
import {
    Transform,
    Type,
    plainToInstance
}                       from 'class-transformer';

import { NameDto }          from '@common/dto/name.dto';
import { UploadFilesDto }   from '@common/dto/upload-files.dto';
import { IncludesItemsDto } from '@products/dto/includes-items.dto';
import { FileConfigDto }    from '@common/dto/file-config.dto';
import { PriceStock }       from '@common/dto/price-stock.dto';


export class CreateProductDto extends IntersectionType(
	UploadFilesDto,
	NameDto,
	IncludesItemsDto,
    PriceStock
) {

	@ApiPropertyOptional( {
		description : 'Product description',
		example     : 'This is a description of the product',
	} )
	@IsString()
	@IsOptional()
	description?: string;

	@ApiPropertyOptional( {
		description : 'Product SKU',
		example     : 'PRODUCT-001',
	} )
	@IsString()
	@IsNotEmpty()
	@Length( 1, 50 )
	sku: string;

	@ApiPropertyOptional( {
		description : 'Technical specifications in JSON format',
		example     : { color : 'red', size : 'L' },
	} )
	@IsObject()
	@IsOptional()
	@Transform( ( { value } ) => ( typeof value === 'string' ? JSON.parse( value ) : value ) )
	technical_specs?: Record<string, any>;

	@ApiProperty( {
		description : 'Subcategory ID (ULID)',
		example     : '01ARZ3NDEKTSV4RRFFQ6KHNQZS',
	} )
	@IsString()
	@IsNotEmpty()
	@Length( 26, 26 )
	subcategoryId: string;

	@ApiProperty( {
		description : 'Material ID (ULID)',
		example     : '01ARZ3NDEKTSV4RRFFQ6KHNQZS',
	} )
	@IsString()
	@IsNotEmpty()
	@Length( 26, 26 )
	materialId: string;

	@ApiPropertyOptional( {
		description : 'Array of image configurations (JSON stringified)',
		type        : 'string',
		example     : '[{"alt":"Front view","isMain":true,"order":1}]',
	} )
	@IsOptional()
	@Transform(({ value }) => {
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
	imagesInfo?: FileConfigDto[];

}
