import { Module } from '@nestjs/common';

import { FileManagerService }   from '@services/file-manager.service';
import { KitsController }       from './kits.controller';
import { KitsService }          from './kits.service';


@Module( {
	controllers : [ KitsController ],
	providers   : [ KitsService, FileManagerService ],
} )
export class KitsModule {}
