import { Injectable, Logger } from '@nestjs/common';

import { Resend } from 'resend';

import {
    EmailProvider,
    SendEmailOptions
}               from '../interfaces/email-provider.interface';
import { ENVS } from '@config/envs';


@Injectable()
export class ResendEmailProvider implements EmailProvider {

	private readonly resend : Resend;
	private readonly logger = new Logger( ResendEmailProvider.name );


	constructor() {
		this.resend = new Resend( ENVS.EMAIL.RESEND_API_KEY );
	}


	async send( options : SendEmailOptions ) : Promise<void> {
		try {
			const { to, subject, html, notificationId } = options;
			const toArray = Array.isArray( to ) ? to : [ to ];

			await this.resend.emails.send( {
				from    : ENVS.EMAIL.FROM,
				to      : toArray,
				subject,
				html,
                headers: {
                    "X-Auto-Response-Suppress"  : "All",
                    "Auto-Submitted"            : "auto-generated",
                    "X-Entity-Ref-Type"         : "transactional",
                    ...( ENVS.EMAIL.ABUSE_TO ? { "X-Report-Abuse-To": ENVS.EMAIL.ABUSE_TO } : {} )
                },
                tags: [
                    { name: "category",         value: "system_notification" },
                    { name: "notification_id",  value: notificationId },
                    { name: "priority",         value: "high" },
                    { name: "message_type",     value: "informational" }
                ]
			});
		} catch ( error ) {
			this.logger.error( `Failed to send email via Resend: ${ error?.message || error }` );
			throw error;
		}
	}

}
