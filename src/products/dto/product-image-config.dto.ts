import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';


export class ProductImageConfigDto {

    @ApiPropertyOptional( {
        description : 'Alt text for the image',
        example     : 'Front view of the product',
    } )
    @IsString()
    @IsOptional()
    alt?: string;


    @ApiPropertyOptional( {
        description : 'Is this the main image of the product?',
        example     : true,
    } )
    @IsBoolean()
    @IsOptional()
    isMain?: boolean;


    @ApiPropertyOptional( {
        description : 'Order of the image',
        example     : 1,
    } )
    @IsNumber()
    @Min( 0 )
    @IsOptional()
    order?: number;

}
