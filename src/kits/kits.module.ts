import { Module } from '@nestjs/common';

import { FileManagerService }         from '@services/file-manager.service';
import { CreatePriceHistoryService }  from '@common/service/create-price-history.service';
import { KitsController }             from './kits.controller';
import { KitsService }                from './kits.service';


@Module( {
	controllers : [ KitsController ],
	providers   : [ KitsService, FileManagerService, CreatePriceHistoryService ],
} )
export class KitsModule {}

