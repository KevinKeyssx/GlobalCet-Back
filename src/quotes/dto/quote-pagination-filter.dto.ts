import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';

import {
	IsOptional,
	IsString,
	IsEnum,
	IsArray,
}                       from 'class-validator';
import { Transform }    from 'class-transformer';
import { QuoteStatus }  from '@prisma/client';

import { PaginationDto } from '@common/dto/pagination.dto';


export enum QuoteOrderField {
	QUOTE_NUMBER = 'quoteNumber',
	CREATED_AT   = 'createdAt',
	UPDATED_AT   = 'updatedAt',
}


export class QuotePaginationFilterDto extends OmitType( PaginationDto, [ 'orderBy' ] as const ) {

	@ApiPropertyOptional( {
		description : 'Filtro por número de cotización u otra query parcial',
		example     : '2026-000001',
	} )
	@IsOptional()
	@IsString()
	query? : string;


	@ApiPropertyOptional( {
		description	: 'Filtro por estado de la cotización',
		enum		: QuoteStatus,
		isArray		: true,
		example		: [ QuoteStatus.PENDING ],
	} )
	@IsOptional()
	@IsArray()
	@IsEnum( QuoteStatus, { each : true } )
	@Transform( ( { value } ) => ( Array.isArray( value ) ? value : [ value ] ) )
	status? : QuoteStatus[];


	@ApiPropertyOptional( {
		description : 'Campo por el cual ordenar',
		enum        : QuoteOrderField,
		default     : QuoteOrderField.CREATED_AT,
	} )
	@IsOptional()
	@IsEnum( QuoteOrderField )
	orderBy? : QuoteOrderField = QuoteOrderField.CREATED_AT;

}
