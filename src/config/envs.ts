import 'dotenv/config';
import * as joi from 'joi';


interface EnvVars {
    PORT            : number;
    DATABASE_URL    : string;
    ALLOWED_ORIGINS : string;
    X_SECRET        : string;

    FILE_UPLOAD_LIMIT           : number;
    FILE_MANAGER_URL            : string;
    FILE_MANAGE_DELETE_ENDPOINT : string;
    FILE_MANAGE_MULTIPLE_UPLOAD_ENDPOINT : string;
    FILE_MANAGE_MULTIPLE_DELETE_ENDPOINT : string;
    FILE_MANAGE_MULTIPLE_DELETE_FILES_ENDPOINT : string;
    FILE_MANAGER_FOLDER         : string;
    FILE_MANAGER_FORMAT         : string;
    FILE_MANAGER_QUALITY        : number;
    FILE_MANAGER_MAX_RETRIES    : number;
    FILE_MANAGER_RETRY_DELAY    : number;
    ALLOW_NEGATIVE_STOCK        : boolean;

    EMAIL_FROM      : string;
    RESEND_API_KEY  : string;
    ADMIN_EMAILS    : string;
    ABUSE_TO: string;
}


const envsSchema = joi.object({
    PORT            : joi.number().required(),
    DATABASE_URL    : joi.string().required(),
    ALLOWED_ORIGINS : joi.string().required(),
    X_SECRET        : joi.string().required(),

    FILE_UPLOAD_LIMIT                       : joi.number().default( 5 ),
    FILE_MANAGER_URL                        : joi.string().required(),
    FILE_MANAGE_DELETE_ENDPOINT             : joi.string().required(),
    FILE_MANAGE_MULTIPLE_UPLOAD_ENDPOINT    : joi.string().required(),
    FILE_MANAGE_MULTIPLE_DELETE_ENDPOINT    : joi.string().required(),
    FILE_MANAGE_MULTIPLE_DELETE_FILES_ENDPOINT: joi.string().required(),
    FILE_MANAGER_FOLDER                     : joi.string().required(),
    FILE_MANAGER_FORMAT                     : joi.string().optional(),
    FILE_MANAGER_QUALITY                    : joi.number().optional(),
    FILE_MANAGER_MAX_RETRIES                : joi.number().optional(),
    FILE_MANAGER_RETRY_DELAY                : joi.number().optional(),
    ALLOW_NEGATIVE_STOCK                    : joi.boolean().default( true ),

    EMAIL_FROM      : joi.string().required(),
    RESEND_API_KEY  : joi.string().required(),
    ADMIN_EMAILS    : joi.string().required(),
    ABUSE_TO       : joi.string().required(),
})
.unknown( true );


const { error, value } = envsSchema.validate( process.env );


if ( error ) throw new Error( `Config validation error: ${ error.message }` );


const envVars: EnvVars = value;


export const ENVS = {
    PORT              : envVars.PORT,
    DATABASE_URL      : envVars.DATABASE_URL,
    ALLOWED_ORIGINS   : envVars.ALLOWED_ORIGINS.split( ',' ),
    FILE_UPLOAD_LIMIT : envVars.FILE_UPLOAD_LIMIT,
    X_SECRET          : envVars.X_SECRET,

    FILE_MANAGER : {
        URL                             : envVars.FILE_MANAGER_URL,
        DELETE_ENDPOINT                 : envVars.FILE_MANAGE_DELETE_ENDPOINT,
        MULTIPLE_UPLOAD_ENDPOINT        : envVars.FILE_MANAGE_MULTIPLE_UPLOAD_ENDPOINT,
        MULTIPLE_DELETE_ENDPOINT        : envVars.FILE_MANAGE_MULTIPLE_DELETE_ENDPOINT,
        MULTIPLE_DELETE_FILES_ENDPOINT  : envVars.FILE_MANAGE_MULTIPLE_DELETE_FILES_ENDPOINT,
        FOLDER                          : envVars.FILE_MANAGER_FOLDER,
        FORMAT                          : envVars.FILE_MANAGER_FORMAT,
        QUALITY                         : envVars.FILE_MANAGER_QUALITY,
        MAX_RETRIES                     : envVars.FILE_MANAGER_MAX_RETRIES,
        RETRY_DELAY                     : envVars.FILE_MANAGER_RETRY_DELAY,
    },
    ALLOW_NEGATIVE_STOCK : envVars.ALLOW_NEGATIVE_STOCK,

    EMAIL : {
        FROM           : envVars.EMAIL_FROM,
        RESEND_API_KEY : envVars.RESEND_API_KEY,
        ADMINS         : envVars.ADMIN_EMAILS.split( ',' ),
        ABUSE_TO       : envVars.ABUSE_TO,
    },
}
