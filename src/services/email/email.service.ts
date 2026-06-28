import { Inject, Injectable }              from '@nestjs/common';
import { EmailProvider, SendEmailOptions } from './interfaces/email-provider.interface';


@Injectable()
export class EmailService {

	constructor(
		@Inject( 'EmailProvider' )
		private readonly provider : EmailProvider,
	) {}


	async sendEmail( options : SendEmailOptions ) : Promise<void> {
		await this.provider.send( options );
	}

}
