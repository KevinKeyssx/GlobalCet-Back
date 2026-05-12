import { ApiPropertyOptional } from '@nestjs/swagger';

import {
    IsOptional,
    IsString,
    IsBoolean,
}                       from 'class-validator';
import { Transform }    from 'class-transformer';


export class ProductFieldsFilterDto {

    @ApiPropertyOptional({ description: 'Buscar por material (parcial)' })
    @IsOptional()
    @IsString()
    material?: string;

    @ApiPropertyOptional({ description: 'Filtrar activos/inactivos' })
    @IsOptional()
    @IsBoolean()
    @Transform( ({ value }) => value === 'true' || value === true )
    active?: boolean;

}
