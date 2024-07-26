import { Injectable } from '@nestjs/common';
import { CreateOssDto } from './dto/create-oss.dto';
import { UpdateOssDto } from './dto/update-oss.dto';

@Injectable()
export class OssService {
  create(createOssDto: CreateOssDto) {
    return 'This action adds a new oss';
  }

  findAll() {
    return `This action returns all oss`;
  }

  findOne(id: number) {
    return `This action returns a #${id} oss`;
  }

  update(id: number, updateOssDto: UpdateOssDto) {
    return `This action updates a #${id} oss`;
  }

  remove(id: number) {
    return `This action removes a #${id} oss`;
  }
}
