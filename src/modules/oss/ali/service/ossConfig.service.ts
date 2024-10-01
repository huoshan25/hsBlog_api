import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as OSS from 'ali-oss';

@Injectable()
export class OssConfigService {
  private readonly ossEndpoint: string;
  private readonly ossBucket: string;
  constructor(private configService: ConfigService) {
    this.ossEndpoint = this.configService.get<string>('ALI_ENDPOINT');
    this.ossBucket = this.configService.get<string>('ALI_BUCKET');
  }

  createOssClient(): OSS {
    return new OSS({
      region: this.configService.get<string>('ALI_REGION'),
      accessKeyId: this.configService.get<string>('ALI_ACCESS_KEY_ID'),
      accessKeySecret: this.configService.get<string>('ALI_ACCESS_KEY_SECRET'),
      bucket: this.ossBucket,
    });
  }

  /*获取阿里端点*/
  getOssEndpoint(): string {
    return this.ossEndpoint;
  }

  getOssBucket(): string {
    return this.ossBucket;
  }
}