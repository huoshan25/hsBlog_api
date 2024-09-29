import {
  Controller,
  Get,
  Post,
  UploadedFile,
  HttpStatus,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OssService } from '../oss.service';
import { Readable } from 'stream';
import { QiniuService } from './qiniu.service';
import { ApiResponse } from '../../../common/response';
@Controller('oss/qiniu')
export class QiniuController {
  constructor(
    private readonly ossService: OssService,
    private readonly qiniuService: QiniuService
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('bucket') bucket: string,
    @Body('key') key: string
  ) {
    try {
      const readableStream = new Readable();
      readableStream.push(file.buffer);
      readableStream.push(null);
      const result = await this.qiniuService.uploadFile(bucket, key, readableStream);
      const data = {
        hash: result.hash,
        // key: `http://skgkwmsm0.hd-bkt.clouddn.com/${result.key}`,
        key: `http://skgkwmsm0.hd-bkt.clouddn.com/${result.key}`,
      }
      return new ApiResponse(HttpStatus.OK, '上传成功！', data);
    } catch (error) {
      return new ApiResponse(HttpStatus.INTERNAL_SERVER_ERROR, `上传失败: ${error.message}`);
    }
  }
}
