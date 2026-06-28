import { ApiPropertyOptional } from '@nestjs/swagger';

import {
	IsOptional,
	IsBoolean,
}                       from 'class-validator';
import { Transform }    from 'class-transformer';


export class IncludesItemsDto {

    @ApiPropertyOptional({
        description: 'Incluir archivos asociados'
    })
	@IsOptional()
	@IsBoolean()
	@Transform( ({ value }) => value === 'true' || value === true )
	includeFiles?: boolean = false;

	@ApiPropertyOptional({
        description: 'Incluir kits asociados'
    })
	@IsOptional()
	@IsBoolean()
	@Transform( ({ value }) => value === 'true' || value === true )
	includeKits?: boolean = false;

	@ApiPropertyOptional({
        description: 'Incluir laboratorios móviles asociados'
    })
	@IsOptional()
	@IsBoolean()
	@Transform( ({ value }) => value === 'true' || value === true )
	includeMobileLabs?: boolean = false;

	@ApiPropertyOptional( {
		description : 'Obtener el producto sin filtrar por estado activo',
		example     : false,
		default     : false,
	} )
	@IsOptional()
	@IsBoolean()
	@Transform( ( { value } ) => value === 'true' || value === true )
	getAllStatus?: boolean = false;

}

