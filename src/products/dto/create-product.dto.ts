import {
	IsBoolean,
	IsNotEmpty,
	IsOptional,
	IsObject,
	IsString,
	Length
} from 'class-validator';


export class CreateProductDto {

	@IsString()
	@IsNotEmpty()
	@Length( 1, 200 )
	name: string;

	@IsString()
	@IsOptional()
	description?: string;

	@IsString()
	@IsOptional()
	material?: string;

	@IsObject()
	@IsOptional()
	technical_specs?: Record<string, any>;

	@IsBoolean()
	@IsOptional()
	active?: boolean;

	@IsString()
	@IsNotEmpty()
	@Length( 26, 26 )
	subcategoryId: string;

}
