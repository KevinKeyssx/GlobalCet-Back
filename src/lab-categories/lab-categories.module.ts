import { Module } from '@nestjs/common';

import { LabCategoriesService }    from './lab-categories.service';
import { LabCategoriesController }  from './lab-categories.controller';


@Module( {
	controllers : [ LabCategoriesController ],
	providers   : [ LabCategoriesService ],
} )
export class LabCategoriesModule {}
