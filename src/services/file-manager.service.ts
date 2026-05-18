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


export interface IUploadMultiplePayload {
    folder   : string;
    format?  : string;
    width?   : number;
    height?  : number;
    quality? : string | number;
    auto?    : boolean;
    effects? : string[];
}


export interface ICloudinaryMultipleUploadResponse {
    successes : Array<{
        secure_url  : string;
        public_id   : string;
    }>;
    failures : Array<{
        filename : string;
        error    : string;
    }>;
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


    async uploadMultiple(
        files       : Express.Multer.File[],
        subfolderId?: string
    ) : Promise<Array<{ secure_url : string; public_id : string }>> {
        if ( !files || files.length === 0 ) return [];

        try {
            return await this.withRetry( async () => {
                const formData = new FormData();

                const uploadPayload: IUploadMultiplePayload[] = files.map( file => {
                    const isVideo    = file.mimetype.startsWith( 'video/' );
                    const folderPath = subfolderId 
                        ? `${ this.folder }|products|${ subfolderId }` 
                        : this.folder;

                    if ( isVideo ) {
                        return {
                            folder : folderPath,
                            auto   : true,
                        };
                    }

                    return {
                        folder  : folderPath,
                        quality : String( this.QUALITY ),
                        format  : this.FORMAT,
                    };
                });

                formData.append( 'upload', JSON.stringify( uploadPayload ));

                files.forEach( file => {
                    const blob = new Blob([ new Uint8Array( file.buffer ) ], { type : file.mimetype });
                    formData.append( 'files', blob, file.originalname );
                });

                const endpoint = `${ this.baseUrl }/${ ENVS.FILE_MANAGER.MULTIPLE_UPLOAD_ENDPOINT }`;

                const response = await connectRequest<ICloudinaryMultipleUploadResponse>({
                    endpoint,
                    method : METHOD.POST,
                    body   : formData as any,
                });

                if ( isApiError( response )) {
                    throw new BadRequestException( 'Error al subir los archivos múltiples' );
                }

                if ( response.failures && response.failures.length > 0 ) {
                    console.warn( 'Algunos archivos fallaron en la subida:', response.failures );
                }

                return response.successes.map( success => ({
                    secure_url  : success.secure_url,
                    public_id   : success.public_id,
                }));
            });
        } catch ( error ) {
            throw new BadRequestException( `Error en el servicio de archivos múltiples` );
        }
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


    async deleteMultiple( subfolderId: string ): Promise<void> {
        try {
            await this.withRetry( async () => {
                const folderPath = `${ this.folder }|products|${ subfolderId }`;
                const endpoint   = `${ this.baseUrl }/${ ENVS.FILE_MANAGER.MULTIPLE_DELETE_ENDPOINT }/${ folderPath }`;

                const response = await connectRequest<any>({
                    endpoint,
                    method : METHOD.DELETE,
                });

                if ( isApiError( response )) {
                    throw new BadRequestException( 'Error al eliminar la carpeta completa' );
                }
            });
        } catch ( error ) {
            throw new BadRequestException( `Error al eliminar la carpeta múltiple` );
        }
    }


    async deleteFiles( subfolderId : string, fileNames : string[] ) : Promise<void> {
        try {
            await this.withRetry( async () => {
                const folderPath = `${ this.folder }|products|${ subfolderId }`;
                const endpoint   = `${ this.baseUrl }/${ ENVS.FILE_MANAGER.MULTIPLE_DELETE_FILES_ENDPOINT }?path=${ folderPath }`;

                const response = await connectRequest<any>({
                    endpoint,
                    method : METHOD.POST,
                    body   : { files : fileNames },
                });

                if ( isApiError( response )) {
                    throw new BadRequestException( 'Error al eliminar archivos por lote' );
                }
            });
        } catch ( error ) {
            throw new BadRequestException( `Error al eliminar archivos por lote` );
        }
    }

}

