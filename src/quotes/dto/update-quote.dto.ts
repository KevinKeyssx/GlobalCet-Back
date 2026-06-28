import { ApiPropertyOptional } from '@nestjs/swagger';

import { IsOptional, IsString } from 'class-validator';

import { CreateQuoteDto } from './create-quote.dto';


export class UpdateQuoteDto extends CreateQuoteDto {

	@ApiPropertyOptional( {
		description : 'Notas administrativas internas',
		example     : 'Cotización especial con descuento por volumen.',
	} )
	@IsOptional()
	@IsString()
	adminNotes? : string;

}
