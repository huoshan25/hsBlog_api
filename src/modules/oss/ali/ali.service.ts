import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as OSS from 'ali-oss';
import { Readable } from 'stream';
import { format } from 'date-fns';

@Injectable()
export class AliService {
  private ossClient: OSS;
  private readonly ossEndpoint: string;
  private readonly ossBucket: string;

  constructor(private configService: ConfigService) {
    this.ossEndpoint = this.configService.get<string>('OSS_ENDPOINT');
    this.ossBucket = this.configService.get<string>('ALI_BUCKET');

    this.ossClient = new OSS({
      region: this.configService.get<string>('ALI_REGION'),
      accessKeyId: this.configService.get<string>('ALI_ACCESS_KEY_ID'),
      accessKeySecret: this.configService.get<string>('ALI_ACCESS_KEY_SECRET'),
      bucket: this.ossBucket,
    });
  }

  async uploadFile(file: Express.Multer.File, articleId: string) {
    const stream = Readable.from(file.buffer);

    // 生成新的文件名
    const fileExtension = file.originalname.split('.').pop();
    const newFileName = `${format(new Date(), 'yyyy-MMdd-HHmmss')}.${fileExtension}`;

    // 构建文件路径
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // 确保月份是两位数
    const objectName = `article/${year}/${month}/${articleId}/${newFileName}`;

    const result = await this.ossClient.putStream(objectName, stream);

    // 返回完整的文件URL
    return {
      ...result,
      url: `https://${this.ossBucket}.${this.ossEndpoint}/${objectName}`
    };
  }

  /**
   * 更能oss上的文章uuid为文章真实id
   * @param oldArticleId uuid
   * @param newArticleId 文章id
   */
  async updateArticleIdInPath(oldArticleId: string, newArticleId: string) {
    const listResult = await this.ossClient.list({
      prefix: 'article/',
      delimiter: '/',
      'max-keys': 1000
    }, {});  // 添加一个空对象作为第二个参数

    for (const prefix of listResult.prefixes) {
      const yearResult = await this.ossClient.list({
        prefix: prefix,
        delimiter: '/',
        'max-keys': 1000
      }, {});  // 添加一个空对象作为第二个参数

      for (const monthPrefix of yearResult.prefixes) {
        const articleResult = await this.ossClient.list({
          prefix: `${monthPrefix}${oldArticleId}/`,
          'max-keys': 1000
        }, {});  // 添加一个空对象作为第二个参数

        for (const object of articleResult.objects) {
          const newObjectName = object.name.replace(`/${oldArticleId}/`, `/${newArticleId}/`);
          await this.ossClient.copy(newObjectName, object.name);
          await this.ossClient.delete(object.name);
        }
      }
    }
  }
}