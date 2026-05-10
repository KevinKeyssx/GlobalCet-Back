import { Injectable } from '@nestjs/common';
import { CreateKitDto } from './dto/create-kit.dto';
import { UpdateKitDto } from './dto/update-kit.dto';

@Injectable()
export class KitsService {
  create(createKitDto: CreateKitDto) {
    return 'This action adds a new kit';
  }

  findAll() {
    return `This action returns all kits`;
  }

  findOne(id: number) {
    return `This action returns a #${id} kit`;
  }

  update(id: number, updateKitDto: UpdateKitDto) {
    return `This action updates a #${id} kit`;
  }

  remove(id: number) {
    return `This action removes a #${id} kit`;
  }
}
