import { Module } from '@nestjs/common';

import { GlobalSearchesService }    from './global-searches.service';
import { GlobalSearchesController } from './global-searches.controller';


@Module({
	controllers : [ GlobalSearchesController ],
	providers   : [ GlobalSearchesService ],
})
export class GlobalSearchesModule {}
