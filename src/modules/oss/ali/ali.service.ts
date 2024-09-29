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

  /*上传文件流*/
  async uploadFile(file: Express.Multer.File, directory: string) {
    const stream = Readable.from(file.buffer);

    /*生成新的文件名*/
    const fileExtension = file.originalname.split('.').pop();
    const newFileName = `${format(new Date(), 'yyyy-MMdd-HHmmss')}.${fileExtension}`;

    const objectName = `${directory}/${newFileName}`;

    return await this.ossClient.putStream(objectName, stream);
  }
}