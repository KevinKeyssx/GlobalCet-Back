import { Module }           from '@nestjs/common';
import { EmailModule }      from '@services/email/email.module';
import { QuotesController } from './quotes.controller';
import { QuotesService }    from './quotes.service';


@Module( {
	imports     : [ EmailModule ],
	controllers : [ QuotesController ],
	providers   : [ QuotesService ],
} )
export class QuotesModule {}

