import { Injectable } from '@nestjs/common';
import * as OSS from 'ali-oss';
import { Readable } from 'stream';
import { format } from 'date-fns';
import { OssConfigService } from './ossConfig.service';

@Injectable()
export class OssUploadService {
  private ossClient: OSS;
  private readonly ossEndpoint: string;
  private readonly ossBucket: string;

  constructor(private ossConfigService: OssConfigService) {
    this.ossClient = this.ossConfigService.createOssClient();
    this.ossEndpoint = this.ossConfigService.getOssEndpoint();
    this.ossBucket = this.ossConfigService.getOssBucket();
  }

  /**
   * 数据流上传
   * @param file
   * @param articleUUID 文章uuid
   *
   */
  async uploadFile(file: Express.Multer.File, articleUUID: string) {
    const stream = Readable.from(file.buffer);
    /*生成新的文件名*/
    const fileExtension = file.originalname.split('.').pop();
    const newFileName = `${format(new Date(), 'yyyy-MMdd-HHmmss')}.${fileExtension}`;

    const objectName = `article/${articleUUID}/${newFileName}`;

    const result = await this.ossClient.putStream(objectName, stream);
    return {
      ...result,
    };
  }

  /**
   * 数据流上传 - 分类图片上传
   * @param category_image 分类图片
   * @param category_id 分类id
   *
   */
  async uploadFileCategory(category_image: Express.Multer.File, category_id: string) {
    const stream = Readable.from(category_image.buffer);
    /*生成新的文件名*/
    const fileExtension = category_image.originalname.split('.').pop();
    const newFileName = `${format(new Date(), 'yyyy-MMdd-HHmmss')}.${fileExtension}`;

    const objectName = `category/${category_id}/${newFileName}`;

    const result = await this.ossClient.putStream(objectName, stream);
    return {
      ...result,
    };
  }

  /**
   * 上传音频文件
   * @param buffer 音频文件buffer
   * @param articleId 文章ID
   * @param fileName 文件名
   */
  async uploadAudioFile(buffer: Buffer, articleId: string, fileName: string) {
    const stream = Readable.from(buffer);
    const objectName = `article/${articleId}/audio/${fileName}`;

    const result = await this.ossClient.putStream(objectName, stream);
    return {
      ...result,
      url: `http://${this.ossBucket}.${this.ossEndpoint}/${objectName}`
    };
  }

  /**
   * 上传音频文件
   * @param audioBuffer 音频buffer
   * @param articleUUID 文章UUID
   * @param type 音频类型
   */
  async uploadAudioBuffer(audioBuffer: Buffer, articleUUID: string, type: 'short' | 'long') {
    const stream = Readable.from(audioBuffer);
    const fileName = `${type}-${format(new Date(), 'yyyy-MMdd-HHmmss')}.mp3`;
    const objectName = `article/${articleUUID}/audio/${fileName}`;

    const result = await this.ossClient.putStream(objectName, stream);
    return {
      ...result,
    };
  }
}