import { ApiPropertyOptional } from '@nestjs/swagger';

import {
    IsOptional,
    IsString,
    IsBoolean,
    IsArray,
}                       from 'class-validator';
import { Transform }    from 'class-transformer';


export class ProductFieldsFilterDto {

    @ApiPropertyOptional( {
        description	: 'Listado de IDs de materiales',
        isArray		: true
    } )
    @IsOptional()
    @IsArray()
    @IsString( { each : true } )
    @Transform( ( { value } ) => ( Array.isArray( value ) ? value : [ value ] ) )
    materials?: string[];

    @ApiPropertyOptional( {
        description	: 'Filtrar activos/inactivos'
    } )
    @IsOptional()
    @IsBoolean()
    @Transform( ( { value } ) => value === 'true' || value === true )
    active?: boolean;

}
