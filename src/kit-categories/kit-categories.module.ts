import { Module } from '@nestjs/common';

import { KitCategoriesService }    from './kit-categories.service';
import { KitCategoriesController }  from './kit-categories.controller';


@Module( {
	controllers : [ KitCategoriesController ],
	providers   : [ KitCategoriesService ],
} )
export class KitCategoriesModule {}
