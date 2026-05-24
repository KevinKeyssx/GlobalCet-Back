import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException
}                           from '@nestjs/common';
import { Observable }       from 'rxjs';

import { ENVS } from '@config/envs';


@Injectable()
export class SecretGuard implements CanActivate {

	canActivate( context: ExecutionContext ): boolean | Promise<boolean> | Observable<boolean> {
		const request = context.switchToHttp().getRequest();
		const secret  = request.headers[ 'x-secret' ];

		if ( !secret || secret !== ENVS.X_SECRET ) {
			throw new UnauthorizedException( 'Acceso no autorizado: X-Secret header inválido o ausente' );
		}

		return true;
	}

}
