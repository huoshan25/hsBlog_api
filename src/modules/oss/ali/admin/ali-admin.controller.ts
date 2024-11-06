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
import { OssUploadService } from '../service/ossUpload.service';
import { OssFileManagementService } from '../service/ossFileManagement.service';
import { OssConfigService } from '../service/ossConfig.service';
import { FileValidationUtil } from '../../../../utils/file-validation.util';

@Controller('admin/oss/ali')
export class AliAdminController {
  constructor(
    private ossUploadService: OssUploadService,
    private ossFileManagementService: OssFileManagementService,
    private ossConfigService: OssConfigService
  ) {}

  /**
   * 文章内容 - 上传图片
   * @param file
   * @param articleId
   */
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

    if (!FileValidationUtil.isImageOrGisFile(file)) {
      throw new BadRequestException('文件类型必须是图片或GIS文件');
    }

    try {
      const ossResult = await this.ossUploadService.uploadFile(file, articleId);
      const data = {
        //@ts-ignore
        fileUrl: ossResult.url, //返回完整的文件URL
      }
      return { message: '文件上传成功', data}
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
      return { message: '文章ID更新成功'}
    } catch (error) {
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
      throw new BadRequestException('缺少参数');
    }
    /*获取完整url*/
    const ossEndpoint = `http://${this.ossConfigService.getOssEndpoint()}`
    /*处理文件路径*/
    const filename = path.substring(ossEndpoint.length);

    /*验证文件类型*/
    if (!FileValidationUtil.isImageOrGisFilePath(filename)) {
      throw new BadRequestException('只能删除图片或GIS文件');
    }

    await this.ossFileManagementService.deleteFile(filename);
    return { message: '删除成功'}
  }

  /**
   * 上传音频文件
   * @param buffer 音频文件buffer
   * @param articleId 文章ID
   * @param type
   */
  @Post('upload-audio')
  async uploadAudio(
    @Body('buffer') buffer: string,  // base64格式的音频数据
    @Body('articleId') articleId: string,
    @Body('type') type: 'short' | 'long'
  ) {
    if (!buffer || !articleId) {
      throw new BadRequestException('参数不完整');
    }

    try {
      // 将base64转换为buffer
      const audioBuffer = Buffer.from(buffer, 'base64');
      const fileName = `${type}-${Date.now()}.mp3`;

      const result = await this.ossUploadService.uploadAudioFile(
        audioBuffer,
        articleId,
        fileName
      );

      return {
        code: HttpStatus.OK,
        message: '音频上传成功',
        data: {
          url: result.url
        }
      };
    } catch (error) {
      console.error('上传音频文件失败:', error);
      throw new BadRequestException('上传音频文件失败');
    }
  }
}