import { Module } from '@nestjs/common';
import { MobileLabsService } from './mobile-labs.service';
import { MobileLabsController } from './mobile-labs.controller';

@Module({
  controllers: [MobileLabsController],
  providers: [MobileLabsService],
})
export class MobileLabsModule {}
