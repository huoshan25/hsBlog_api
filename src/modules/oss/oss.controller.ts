import {
  Controller,
  Get,
  Post,
  Delete,
  UploadedFile,
  Param,
  Res,
  HttpStatus,
  HttpException,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OssService } from './oss.service';
import { Response } from 'express';

@Controller('oss')
export class OssController {
  constructor(private readonly ossService: OssService) {}

  /**获取临时签名*/
  @Get('signature')
  async getTemporarySignature() {
    return await this.ossService.getTemporarySignature();
  }

  /**获取临时签名STS*/
  @Get('signatureSts')
  async getTemporarySignatureSts() {
    return await this.ossService.getTemporarySignatureSts();
  }

  /**上传文件接口*/
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file) {
    if (!file) {
      throw new HttpException('需要文件', HttpStatus.BAD_REQUEST);
    }
    const result = await this.ossService.uploadFile(file.originalname, file.buffer);
    return {
      url: result.url,
    };
  }

  /**获取文件下载 URL*/
  @Get('download/:fileName')
  async getDownloadUrl(@Param('fileName') fileName: string, @Res() res: Response) {
    try {
      const url = await this.ossService.getDownloadUrl(fileName);
      return res.status(HttpStatus.OK).json({ url });
    } catch (error) {
      throw new HttpException('找不到文件', HttpStatus.NOT_FOUND);
    }
  }

  /**删除文件接口*/
  @Delete('delete/:fileName')
  async deleteFile(@Param('fileName') fileName: string) {
    try {
      const result = await this.ossService.deleteFile(fileName);
      return {
        message: '文件删除成功',
        result,
      };
    } catch (error) {
      throw new HttpException('找不到文件', HttpStatus.NOT_FOUND);
    }
  }
}
