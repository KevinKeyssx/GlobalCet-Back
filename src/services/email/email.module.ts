import { Module }              from '@nestjs/common';
import { ResendEmailProvider } from './providers/resend.provider';
import { EmailService }        from './email.service';


@Module( {
	providers : [
		EmailService,
		{
			provide  : 'EmailProvider',
			useClass : ResendEmailProvider,
		},
	],
	exports : [ EmailService ],
} )
export class EmailModule {}
