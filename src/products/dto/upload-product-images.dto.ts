import { ApiPropertyOptional }                 from '@nestjs/swagger';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Transform, Type }                     from 'class-transformer';

import { ProductImageConfigDto } from './product-image-config.dto';


export class UploadProductImagesDto {

    @ApiPropertyOptional( {
        description : 'Array of image configurations (JSON stringified)',
        type        : 'string',
        example     : '[{"alt":"Front view","isMain":true,"order":1}]',
    } )
    @IsOptional()
    @Transform( ({ value }) => ( typeof value === 'string' ? JSON.parse( value ) : value ) )
    @IsArray()
    @ValidateNested( { each : true } )
    @Type( () => ProductImageConfigDto )
    imagesInfo?: ProductImageConfigDto[];

}
