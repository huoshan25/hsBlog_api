import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AliService } from './ali.service';
import { ApiResponse } from '../../../common/response';

@Controller('oss/ali')
export class AliController {
  constructor(private aliService: AliService) {}


  @Post('article')
  @UseInterceptors(FileInterceptor('file'))
  async uploadArticleFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('没有上传文件');
    }

    try {
      const ossResult= await this.aliService.uploadFile(file, 'article');
      const data = {
        //@ts-ignore
        fileUrl: ossResult.url,
      }
      return new ApiResponse(HttpStatus.OK, '文件上传成功', data);
    } catch (error) {
      console.error('上传文件到OSS错误:', error);
      throw new BadRequestException('上传文件失败');
    }
  }
}