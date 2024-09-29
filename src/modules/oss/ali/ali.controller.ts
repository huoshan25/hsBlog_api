import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException, HttpStatus, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AliService } from './ali.service';
import { ApiResponse } from 'src/common/response';

@Controller('oss/ali')
export class AliController {
  constructor(private aliService: AliService) {}

  @Post('article')
  @UseInterceptors(FileInterceptor('file'))
  async uploadArticleFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('articleId') articleId: string
  ) {
    if (!file) {
      throw new BadRequestException('没有上传文件');
    }

    if (!articleId) {
      throw new BadRequestException('缺少文章ID');
    }

    try {
      const ossResult = await this.aliService.uploadFile(file, articleId);
      const data = {
        fileUrl: ossResult.url,
      }
      return new ApiResponse(HttpStatus.OK, '文件上传成功', data);
    } catch (error) {
      console.error('上传文件到OSS错误:', error);
      throw new BadRequestException('上传文件失败');
    }
  }

  @Post('update-article-id')
  async updateArticleId(
    @Body('oldArticleId') oldArticleId: string,
    @Body('newArticleId') newArticleId: string
  ) {
    if (!oldArticleId || !newArticleId) {
      throw new BadRequestException('缺少旧文章ID或新文章ID');
    }

    try {
      await this.aliService.updateArticleIdInPath(oldArticleId, newArticleId);
      return new ApiResponse(HttpStatus.OK, '文章ID更新成功', null);
    } catch (error) {
      console.error('更新文章ID错误:', error);
      throw new BadRequestException('更新文章ID失败');
    }
  }
}