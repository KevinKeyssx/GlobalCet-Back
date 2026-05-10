import { Injectable } from '@nestjs/common';
import { CreateMobileLabDto } from './dto/create-mobile-lab.dto';
import { UpdateMobileLabDto } from './dto/update-mobile-lab.dto';

@Injectable()
export class MobileLabsService {
  create(createMobileLabDto: CreateMobileLabDto) {
    return 'This action adds a new mobileLab';
  }

  findAll() {
    return `This action returns all mobileLabs`;
  }

  findOne(id: number) {
    return `This action returns a #${id} mobileLab`;
  }

  update(id: number, updateMobileLabDto: UpdateMobileLabDto) {
    return `This action updates a #${id} mobileLab`;
  }

  remove(id: number) {
    return `This action removes a #${id} mobileLab`;
  }
}
