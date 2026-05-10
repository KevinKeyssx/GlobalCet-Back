import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MobileLabsService } from './mobile-labs.service';
import { CreateMobileLabDto } from './dto/create-mobile-lab.dto';
import { UpdateMobileLabDto } from './dto/update-mobile-lab.dto';

@Controller('mobile-labs')
export class MobileLabsController {
  constructor(private readonly mobileLabsService: MobileLabsService) {}

  @Post()
  create(@Body() createMobileLabDto: CreateMobileLabDto) {
    return this.mobileLabsService.create(createMobileLabDto);
  }

  @Get()
  findAll() {
    return this.mobileLabsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mobileLabsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMobileLabDto: UpdateMobileLabDto) {
    return this.mobileLabsService.update(+id, updateMobileLabDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mobileLabsService.remove(+id);
  }
}
