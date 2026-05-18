import { ApiProperty }          from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

import { ProductImageConfigDto } from './product-image-config.dto';


export class UpdateProductImageDto extends ProductImageConfigDto {

    @ApiProperty( {
        description : 'ID of the image to update',
        example     : '01ARZ3NDEKTSV4RRFFQ6KHNQZS',
    } )
    @IsString()
    @IsNotEmpty()
    id: string;

}
