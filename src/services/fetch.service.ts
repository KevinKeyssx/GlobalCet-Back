import { METHOD } from './http-codes';

type Connect = {
    endpoint    : string;
    method?     : METHOD;
    body?       : object;
}


export type ApiError = {
    message : string;
    code    : string;
    status? : number;
    data?   : unknown;
}


export const isApiError = ( error : any ) : error is ApiError => 
    typeof error === 'object' && error !== null && 'message' in error && 'code' in error;


export default async function connectRequest<T> ( {
    method  = METHOD.GET,
    body,
    endpoint,
    headers = {},
} : Connect & { headers? : Record<string, string> } ) : Promise<T | ApiError> {
    const isFullUrl     = endpoint.startsWith ( 'http' );
    const url           = isFullUrl ? endpoint : `/api/${ endpoint }`;
    const isFormData    = body instanceof FormData;

    const response = await fetch( url, {
        method,
        body    : isFormData ? ( body as any ) : ( body ? JSON.stringify ( body ) : undefined ),
        cache   : 'no-cache',
        headers : {
            ...( !isFormData && { 'Content-Type' : 'application/json' } ),
            'Accept' : 'application/json',
            ...headers,
        }
    });

    if ( !response.ok ) {
        const errorData = await response.json().catch( () => ({}) );

        throw {
            message : errorData.message || 'Request failed',
            code    : `HTTP_${response.status}`,
            status  : response.status,
            data    : errorData,
        } as ApiError;
    }

    if ( response.status === 204 ) return true as T;

    return await response.json() as T;

}
