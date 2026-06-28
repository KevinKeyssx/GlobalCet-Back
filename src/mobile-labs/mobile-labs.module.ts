import { Module } from '@nestjs/common';

import { FileManagerService }         from '@services/file-manager.service';
import { CreatePriceHistoryService }  from '@common/service/create-price-history.service';
import { MobileLabsController }       from './mobile-labs.controller';
import { MobileLabsService }          from './mobile-labs.service';


@Module( {
	controllers : [ MobileLabsController ],
	providers   : [ MobileLabsService, FileManagerService, CreatePriceHistoryService ],
} )
export class MobileLabsModule {}

