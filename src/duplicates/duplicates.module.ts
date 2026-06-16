import { Module } from '@nestjs/common';

import { DuplicatesController } from './duplicates.controller';
import { DuplicatesService }    from './duplicates.service';
import { PrismaModule }         from '@prisma/prisma.module';


@Module( {
	imports		: [ PrismaModule ],
	controllers	: [ DuplicatesController ],
	providers	: [ DuplicatesService ]
} )
export class DuplicatesModule {}
