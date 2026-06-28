import { ApiPropertyOptional } from "@nestjs/swagger";

import { Transform }                from "class-transformer";
import { IsBoolean, IsOptional }    from "class-validator";


export class IncludesMobileLabDto {

    @ApiPropertyOptional({
		description : 'Incluir todos los archivos adjuntos en el resultado',
		example     : false,
		default     : false,
	} )
	@IsOptional()
	@IsBoolean()
	@Transform(({ value }) => value === 'true' || value === true )
	includeFiles?: boolean = false;

	@ApiPropertyOptional({
		description : 'Incluir la relación de productos en el resultado',
		example     : false,
		default     : false,
	} )
	@IsOptional()
	@IsBoolean()
	@Transform(({ value }) => value === 'true' || value === true )
	includeProducts?: boolean = false;

	@ApiPropertyOptional({
		description : 'Incluir la relación de kits en el resultado',
		example     : false,
		default     : false,
	} )
	@IsOptional()
	@IsBoolean()
	@Transform(({ value }) => value === 'true' || value === true )
	includeKits?: boolean = false;

	@ApiPropertyOptional( {
		description : 'Obtener el laboratorio móvil sin filtrar por estado activo',
		example     : false,
		default     : false,
	} )
	@IsOptional()
	@IsBoolean()
	@Transform( ( { value } ) => value === 'true' || value === true )
	getAllStatus?: boolean = false;

}
