import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsNotEmpty,
	IsString,
	Length,
	IsOptional,
	IsBoolean,
	IsNumber,
	IsObject
}                           from 'class-validator';
import { Transform, Type } from 'class-transformer';


export class CreateMaterialDto {

	@ApiProperty( {
		description	: 'Material name',
		example		: 'Stainless Steel',
	} )
	@IsString()
	@IsNotEmpty()
	@Length( 1, 200, {
		message	: 'name must be between 1 and 200 characters',
	} )
	name: string;


	@ApiPropertyOptional( {
		description	: 'URL-friendly unique slug',
		example		: 'stainless-steel',
	} )
	@IsString()
	@IsOptional()
	slug?: string;


	@ApiPropertyOptional( {
		description	: 'Description of the material',
		example		: 'High-grade laboratory steel with resistance to corrosion',
	} )
	@IsString()
	@IsOptional()
	description?: string;


	@ApiPropertyOptional( {
		description	: 'Indicates if the material can be autoclaved',
		example		: true,
		default		: false,
	} )
	@IsBoolean()
	@IsOptional()
	@Transform( ( { value } ) => ( value === 'true' || value === true ) )
	autoclavable?: boolean;


	@ApiPropertyOptional( {
		description	: 'Maximum temperature supported in Celsius degrees',
		example		: 134.5,
	} )
	@IsNumber( {}, {
		message	: 'maxTemperature must be a number',
	} )
	@IsOptional()
	@Type( ( ) => Number )
	maxTemperature?: number;


	@ApiPropertyOptional( {
		description	: 'JSON representing compatibility or chemical resistance data',
		example		: { acid : 'excellent', alkaline : 'good' },
	} )
	@IsObject()
	@IsOptional()
	@Transform( ( { value } ) => ( typeof value === 'string' ? JSON.parse( value ) : value ) )
	chemicalResistance?: Record< string, any >;


	@ApiPropertyOptional( {
		description	: 'Is active and available',
		example		: true,
		default		: true,
	} )
	@IsBoolean()
	@IsOptional()
	@Transform( ( { value } ) => ( value === 'true' || value === true ) )
	active?: boolean;

}
