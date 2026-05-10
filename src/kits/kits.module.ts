import { Module } from '@nestjs/common';
import { KitsService } from './kits.service';
import { KitsController } from './kits.controller';

@Module({
  controllers: [KitsController],
  providers: [KitsService],
})
export class KitsModule {}
