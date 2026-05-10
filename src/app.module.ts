import { Module } from '@nestjs/common';

import { AppController }        from '@app/app.controller';
import { ProductsModule }       from '@products/products.module';
import { KitsModule }           from '@kits/kits.module';
import { MobileLabsModule }     from '@mobile-labs/mobile-labs.module';
import { CategoriesModule }     from '@categories/categories.module';
import { PrismaModule }         from '@prisma/prisma.module';
import { SubCategoriesModule }  from '@sub-categories/sub-categories.module';


@Module({
    imports     : [
        ProductsModule,
        KitsModule,
        MobileLabsModule,
        CategoriesModule,
        PrismaModule,
        SubCategoriesModule
    ],
    controllers : [ AppController ],
})
export class AppModule {}
