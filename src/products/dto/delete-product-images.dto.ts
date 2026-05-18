import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsString } from 'class-validator';

export class DeleteProductImagesDto {

    @ApiProperty({
        description : 'Array of image IDs to delete',
        type        : [ String ],
        example     : [ '01ARZ3NDEKTSV4RRFFQ6KHNQZS', '01ARZ3NDEKTSV4RRFFQ6KHNQZT' ],
    })
    @IsArray()
    @IsString( { each : true } )
    @ArrayMinSize( 1 )
    imageIds: string[];

}
