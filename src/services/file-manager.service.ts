import { Injectable, BadRequestException } from '@nestjs/common';

import
connectRequest, {
    isApiError
}                   from '@services/fetch.service';
import { ENVS }     from '@config/envs';
import { METHOD }   from '@services/http-codes';


interface RespondeFileManager {
    result : string;
}


@Injectable()
export class FileManagerService {

    private readonly baseUrl        = ENVS.FILE_MANAGER.URL;
    private readonly folder         = ENVS.FILE_MANAGER.FOLDER;
    private readonly MAX_RETRIES    = ENVS.FILE_MANAGER.MAX_RETRIES || 3;
    private readonly RETRY_DELAY    = ENVS.FILE_MANAGER.RETRY_DELAY || 2000;
    private readonly FORMAT         = ENVS.FILE_MANAGER.FORMAT      || 'avif';
    private readonly QUALITY        = ENVS.FILE_MANAGER.QUALITY     || 50;


    private async withRetry<T>( operation : () => Promise<T> ) : Promise<T> {
        let lastError : unknown;

        for ( let attempt = 1; attempt <= this.MAX_RETRIES; attempt++ ) {
            try {
                return await operation();
            } catch ( error ) {
                lastError = error;

                if ( attempt < this.MAX_RETRIES ) {
                    const delay = this.RETRY_DELAY * attempt;
                    await new Promise( resolve => setTimeout( resolve, delay ));
                }
            }
        }

        throw lastError;
    }


    async upload( file : Express.Multer.File ) : Promise<string> {
        if ( !file ) {
            throw new BadRequestException( 'Archivo no proporcionado' );
        }

        try {
            return await this.withRetry( async () => {
                const formData = new FormData();
                const blob     = new Blob([ new Uint8Array( file.buffer ) ], { type : file.mimetype });
                const endpoint = `${ this.baseUrl }/upload/${ encodeURIComponent( this.folder ) }?format=${ this.FORMAT }&quality=${ this.QUALITY }`;

                formData.append( 'file', blob, file.originalname );

                const response = await connectRequest<any>({
                    endpoint,
                    method : METHOD.POST,
                    body   : formData as any,
                });

                return ( response as any ).secure_url as string;
            });
        } catch ( error ) {
            throw new BadRequestException( `Error en el servicio de archivos` );
        }
    }


    async delete( imageUrl : string ) : Promise<void> {
        try {
            await this.withRetry( async () => {
                const deletePath = `${ this.folder }|${ imageUrl.split( '.' )[0] }`;
                const endpoint   = `${ this.baseUrl }/delete/${ deletePath }`;

                const response = await connectRequest<RespondeFileManager>({
                    endpoint,
                    method : METHOD.DELETE,
                });

                if ( !response ) {
                    throw new BadRequestException( 'Error al eliminar archivo' );
                }

                if ( isApiError( response )) {
                    throw new BadRequestException( 'Error al eliminar archivo' );
                }

                if ( response.result !== 'ok' ) {
                    throw new BadRequestException( 'Error al eliminar archivo' );
                }
            });
        } catch ( error ) {
            throw new BadRequestException( `Error al eliminar archivo` );
        }
    }

}
