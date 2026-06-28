import { Module } from '@nestjs/common';

import { FileManagerService }         from '@services/file-manager.service';
import { ProductsController }         from '@products/products.controller';
import { ProductsService }            from '@products/products.service';
import { CreatePriceHistoryService }  from '@common/service/create-price-history.service';


@Module({
    controllers : [ ProductsController ],
    providers   : [ ProductsService, FileManagerService, CreatePriceHistoryService ],
})
export class ProductsModule {}
