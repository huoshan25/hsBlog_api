import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OssService } from './oss.service';
import { CreateOssDto } from './dto/create-oss.dto';
import { UpdateOssDto } from './dto/update-oss.dto';

@Controller('oss')
export class OssController {
  constructor(private readonly ossService: OssService) {}

  @Post()
  create(@Body() createOssDto: CreateOssDto) {
    return this.ossService.create(createOssDto);
  }

  @Get()
  findAll() {
    return this.ossService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ossService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOssDto: UpdateOssDto) {
    return this.ossService.update(+id, updateOssDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ossService.remove(+id);
  }
}
