import { Module }                   from '@nestjs/common';

import { PrismaModule }             from '@prisma/prisma.module';
import { PriceHistoryService }      from './price-history.service';
import { PriceHistoryController }   from './price-history.controller';


@Module( {
	imports     : [ PrismaModule ],
	controllers : [ PriceHistoryController ],
	providers   : [ PriceHistoryService ],
} )
export class PriceHistoryModule {}
