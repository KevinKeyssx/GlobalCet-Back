import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsArray,
	IsInt,
	IsNotEmpty,
	IsOptional,
	IsString,
	Length,
	Min,
	ValidateNested
}               from 'class-validator';
import { Type } from 'class-transformer';


export class ItemDto {

    @ApiProperty( {
		description : 'ID del producto (ULID)',
		example     : '01ARZ3NDEKTSV4RRFFQ6KHNQZS',
	} )
	@IsString()
	@IsNotEmpty()
	@Length( 26, 26 )
	id : string;


	@ApiProperty( {
		description : 'Cantidad de unidades del producto',
		example     : 5,
	} )
	@IsInt()
	@Min( 1 )
	@Type( () => Number )
	quantity : number;
}


export class ItemsDto {

	@ApiPropertyOptional( {
		description : 'Lista de productos y sus cantidades',
		type        : [ ItemDto ],
	} )
	@IsOptional()
	@IsArray()
	@ValidateNested( { each : true } )
	@Type( () => ItemDto )
	products? : ItemDto[] = [];


	@ApiPropertyOptional( {
		description : 'Lista de kits y sus cantidades',
		type        : [ ItemDto ],
	} )
	@IsOptional()
	@IsArray()
	@ValidateNested( { each : true } )
	@Type( () => ItemDto )
	kits? : ItemDto[] = [];


	@ApiPropertyOptional( {
		description : 'Lista de laboratorios móviles y sus cantidades',
		type        : [ ItemDto ],
	} )
	@IsOptional()
	@IsArray()
	@ValidateNested( { each : true } )
	@Type( () => ItemDto )
	mobileLabs? : ItemDto[] = [];

}
