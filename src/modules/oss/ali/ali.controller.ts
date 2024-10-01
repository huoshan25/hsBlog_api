import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpStatus,
  Body,
  Delete, Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OssUploadService } from './service/ossUpload.service';
import { OssFileManagementService } from './service/ossFileManagement.service';
import { ApiResponse } from 'src/common/response';
import { OssConfigService } from './service/ossConfig.service';

@Controller('oss/ali')
export class AliController {
  constructor(
    private ossUploadService: OssUploadService,
    private ossFileManagementService: OssFileManagementService,
    private ossConfigService: OssConfigService
  ) {}

  @Post('article-img')
  @UseInterceptors(FileInterceptor('file'))
  async uploadArticleFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('articleUUID') articleId: string
  ) {
    if (!file) {
      throw new BadRequestException('没有上传文件');
    }

    if (!articleId) {
      throw new BadRequestException('缺少文章ID');
    }

    try {
      const ossResult = await this.ossUploadService.uploadFile(file, articleId);
      const data = {
        //@ts-ignore
        fileUrl: ossResult.url, //返回完整的文件URL
      }
      return new ApiResponse(HttpStatus.OK, '文件上传成功', data);
    } catch (error) {
      console.error('上传文件到OSS错误:', error);
      throw new BadRequestException('上传文件失败');
    }
  }

  /**
   * 更新文章id
   * @param oldArticleId
   * @param newArticleId
   */
  @Post('update-article-id')
  async updateArticleId(
    @Body('oldArticleId') oldArticleId: string,
    @Body('newArticleId') newArticleId: string
  ) {
    if (!oldArticleId || !newArticleId) {
      throw new BadRequestException('缺少旧文章ID或新文章ID');
    }

    try {
      await this.ossFileManagementService.updateArticleIdInPath(oldArticleId, newArticleId);
      return new ApiResponse(HttpStatus.OK, '文章ID更新成功', null);
    } catch (error) {
      console.error('更新文章ID错误:', error);
      throw new BadRequestException('更新文章ID失败');
    }
  }

  /**
   * 删除图片
   * @param path 文件路径（不包括bucket名称
   */
  @Delete('article-img')
  async deleteDirectory(@Body('path') path: string) {
    if(!path) {
      return new ApiResponse(HttpStatus.BAD_REQUEST, '缺少参数', null);
    }
    /*获取完整url*/
    const ossEndpoint = `http://${this.ossConfigService.getOssEndpoint()}`
    /*处理文件路径*/
    const filename = path.substring(ossEndpoint.length);
    const result = await this.ossFileManagementService.deleteFile(filename);
    if(result) {
      return new ApiResponse(HttpStatus.OK, '删除成功');
    } else {
      return new ApiResponse(HttpStatus.BAD_REQUEST, '删除失败');
    }
  }
}