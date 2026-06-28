export interface SendEmailOptions {
	to      : string | string[];
	subject : string;
	html    : string;
    notificationId : string;
}


export interface EmailProvider {
	send( options : SendEmailOptions ) : Promise<void>;
}
