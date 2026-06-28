import { ApiProperty } from '@nestjs/swagger';

import { QuoteStatus } from '@prisma/client';

import { IsEnum, IsNotEmpty } from 'class-validator';


export class UpdateQuoteStatusDto {

	@ApiProperty( {
		description : 'Nuevo estado de la cotización',
		enum        : QuoteStatus,
		example     : QuoteStatus.COMPLETED,
	} )
	@IsNotEmpty()
	@IsEnum( QuoteStatus )
	status : QuoteStatus;

}
