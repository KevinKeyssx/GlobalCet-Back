import { ApiProperty } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsString,
    Length,
    Matches
} from 'class-validator';

import { CreateCategoryDto } from '@categories/dto/create-category.dto';


export class CreateSubCategoryDto extends CreateCategoryDto {

    @ApiProperty( {
        description : 'Category ID (ULID)',
        example     : '01ARZ3NDEKTSV4RRFFQ6KHNQZS',
    } )
    @IsString()
    @IsNotEmpty()
    @Matches( /^[0-9A-HJKMNP-TV-Z]{26}$/, {
        message : 'categoryId must be a valid ULID (26 characters, uppercase)',
    })
    @Length( 26, 26 )
    categoryId: string;

}
