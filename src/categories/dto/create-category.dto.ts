import { ApiProperty } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsString,
    Length
} from 'class-validator';


export class CreateCategoryDto {

    @ApiProperty( {
        description : 'Category name',
        example     : 'Electronics',
    } )
    @IsString()
    @IsNotEmpty()
    @Length( 1, 200, {
        message : 'name must be between 1 and 200 characters',
    })
    name: string;

}
