import {
    DocumentBuilder,
    SwaggerModule
}                                   from '@nestjs/swagger';
import { Logger, ValidationPipe }   from '@nestjs/common';
import { NestFactory }              from '@nestjs/core';

import { AppModule }    from '@app/app.module';
import { ENVS }         from '@config/envs';


( async () => {
    const logger    = new Logger( 'Main' );
    const app       = await NestFactory.create( AppModule );

    app
    .setGlobalPrefix( 'api/v1' )
    .useGlobalPipes( new ValidationPipe({
        whitelist: true,
        transform: true
    }))
    .enableCors({
        origin      : ENVS.ALLOWED_ORIGINS,
        methods     : ['GET', 'POST', 'DELETE', 'OPTIONS'],
        credentials : true,
    });

    const config = new DocumentBuilder()
        .setTitle( 'GlobalCet API' )
        .setDescription( 'The GlobalCet API documentation' )
        .setVersion( '1.0' )
        .build();

    const documentFactory = SwaggerModule.createDocument( app, config );

    SwaggerModule.setup( 'api/docs', app, documentFactory );

    await app.listen( ENVS.PORT );
    logger.log( `GlobalCet API listening on port ${ ENVS.PORT }` );
})();
