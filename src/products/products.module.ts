import { Module } from '@nestjs/common';

import { FileManagerService }   from '@services/file-manager.service';
import { ProductsController }   from '@products/products.controller';
import { ProductsService }      from '@products/products.service';


@Module({
    controllers : [ ProductsController ],
    providers   : [ ProductsService, FileManagerService ],
})
export class ProductsModule {}
