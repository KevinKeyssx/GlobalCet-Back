import { ApiProperty }               from '@nestjs/swagger';
import { IsArray, ValidateNested }   from 'class-validator';
import { Type }                      from 'class-transformer';

import { UpdateProductImageDto } from './update-product-image.dto';


export class UpdateProductImagesDto {

    @ApiProperty( {
        description : 'Array of image configurations to update',
        type        : [ UpdateProductImageDto ],
    } )
    @IsArray()
    @ValidateNested( { each : true } )
    @Type( () => UpdateProductImageDto )
    imagesInfo: UpdateProductImageDto[];

}
