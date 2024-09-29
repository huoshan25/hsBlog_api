import { Module } from '@nestjs/common';
import { OssService } from './oss.service';
import { OssController } from './oss.controller';
import { QiniuService } from './qiniu/qiniu.service';
import { QiniuController } from './qiniu/qiniu.controller';
import { AliService } from './ali/ali.service';
import { AliController } from './ali/ali.controller';

@Module({
  controllers: [OssController, QiniuController, AliController],
  providers: [OssService, QiniuService, AliService],
})
export class OssModule {}
