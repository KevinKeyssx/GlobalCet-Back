import {
    IsOptional,
    IsString,
    IsInt,
    Min,
    IsBoolean
}                          from 'class-validator';
import { Type, Transform } from 'class-transformer';


export class GlobalSearchQueryDto {

	@IsOptional()
	@IsString()
	query?: string;

	@IsOptional()
	@Type( () => Number )
	@IsInt()
	@Min( 1 )
	limitPerEntity?: number = 10;

	@IsOptional()
	@Transform( ( { value } ) => value === 'true' || value === true )
	@IsBoolean()
	suggestion?: boolean = true;

}
