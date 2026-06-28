import { Module } from '@nestjs/common';
import { GlobalSearchesModule } from './global-searches/global-searches.module';
import { QuotesModule } from './quotes/quotes.module';
import { PriceHistoryModule } from './price-history/price-history.module';
import { UsersModule }          from './users/users.module';
import { DuplicatesModule }     from './duplicates/duplicates.module';

import { AppController }        from '@app/app.controller';
import { ProductsModule }       from '@products/products.module';
import { KitsModule }           from '@kits/kits.module';
import { CategoriesModule }     from '@categories/categories.module';
import { MobileLabsModule }     from '@mobile-labs/mobile-labs.module';
import { SubCategoriesModule }  from '@sub-categories/sub-categories.module';
import { MaterialsModule }      from '@materials/materials.module';
import { KitCategoriesModule }  from '@kit-categories/kit-categories.module';
import { LabCategoriesModule }  from '@lab-categories/lab-categories.module';
import { PrismaModule }         from '@prisma/prisma.module';
import { ExportModule }         from './services/export.module';


@Module({
    imports     : [
        ProductsModule,
        KitsModule,
        MobileLabsModule,
        CategoriesModule,
        PrismaModule,
        SubCategoriesModule,
        MaterialsModule,
        KitCategoriesModule,
        LabCategoriesModule,
        GlobalSearchesModule,
        UsersModule,
        DuplicatesModule,
        QuotesModule,
        PriceHistoryModule,
        ExportModule
    ],
    controllers : [ AppController ],
})
export class AppModule {}
