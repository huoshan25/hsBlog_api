import { Injectable } from '@nestjs/common';
import * as qiniu from 'qiniu';
import { Readable } from 'stream';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class QiniuService {
  private readonly mac: qiniu.auth.digest.Mac;
  private readonly config: qiniu.conf.Config;

  constructor(
    private configService: ConfigService
  ) {
    const accessKey = this.configService.get<string>('qn_ak');
    const secretKey = this.configService.get<string>('qn_sk');

    if (!accessKey || !secretKey) {
      throw new Error('七牛云环境变量中未设置访问密钥或秘密密钥');
    }

    this.mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
    this.config = new qiniu.conf.Config({
      regionsProvider: qiniu.httpc.Region.fromRegionId('z0')
    });
  }

  private getUploadToken(bucket: string, key: string): string {
    const putPolicy = new qiniu.rs.PutPolicy({
      scope: `${bucket}:${key}`,
    });
    return putPolicy.uploadToken(this.mac);
  }

  /**
   * 上传文件
   * @param bucket 存储空间
   * @param key 文件名
   * @param readableStream 文件流
   */
  async uploadFile(bucket: string, key: string, readableStream: Readable): Promise<any> {
    const uploadToken = this.getUploadToken(bucket, key);
    const formUploader = new qiniu.form_up.FormUploader(this.config);
    const putExtra = new qiniu.form_up.PutExtra();

    return new Promise((resolve, reject) => {
      formUploader.putStream(uploadToken, key, readableStream, putExtra, (err, body, info) => {
        if (err) {
          reject(err);
        } else {
          if (info.statusCode === 200) {
            resolve(body);
          } else {
            reject(new Error(`上传失败。状态码: ${info.statusCode}`));
          }
        }
      });
    });
  }
}