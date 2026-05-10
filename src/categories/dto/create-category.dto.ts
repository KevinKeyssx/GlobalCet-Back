import {
    IsNotEmpty,
    IsString,
    Length
} from 'class-validator';


export class CreateCategoryDto {

    @IsString()
    @IsNotEmpty()
    @Length( 1, 200, {
        message : 'name must be between 1 and 200 characters',
    })
    name: string;

}
