import { ApiPropertyOptional } from '@nestjs/swagger';

import { IsOptional, IsBoolean }    from 'class-validator';
import { Transform }                from 'class-transformer';


export class IncludesKitDto {

    @ApiPropertyOptional( {
		description : 'Incluir archivos asociados al kit',
		example     : false,
		default     : false,
	} )
	@IsOptional()
	@IsBoolean()
	@Transform( ( { value } ) => value === 'true' || value === true )
	includeFiles?: boolean = false;

	@ApiPropertyOptional( {
		description : 'Incluir productos asociados al kit',
		example     : false,
		default     : false,
	} )
	@IsOptional()
	@IsBoolean()
	@Transform( ( { value } ) => value === 'true' || value === true )
	includeProducts?: boolean = false;

	@ApiPropertyOptional( {
		description : 'Obtener el kit sin filtrar por estado activo',
		example     : false,
		default     : false,
	} )
	@IsOptional()
	@IsBoolean()
	@Transform( ( { value } ) => value === 'true' || value === true )
	getAllStatus?: boolean = false;

}
