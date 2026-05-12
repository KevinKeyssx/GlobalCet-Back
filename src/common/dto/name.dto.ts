import { ApiProperty } from '@nestjs/swagger';

import { IsString, Length } from 'class-validator';


export class NameDto {

    @ApiProperty({
        description : 'Name of the item',
        example     : 'Item Name',
        required    : true
    })
    @IsString()
    @Length( 1, 200 )
    name: string;

}
