import { Module } from '@nestjs/common';
import { QiniuService } from './qiniu/qiniu.service';
import { QiniuController } from './qiniu/qiniu.controller';
import { OssConfigService } from './ali/service/ossConfig.service';
import { AliController } from './ali/ali.controller';
import { OssUploadService } from './ali/service/ossUpload.service';
import { OssFileManagementService } from './ali/service/ossFileManagement.service';

@Module({
  controllers: [QiniuController, AliController],
  providers: [
    QiniuService,
    OssConfigService,
    OssUploadService,
    OssFileManagementService,
  ],
  exports: [OssFileManagementService, OssUploadService],
})
export class OssModule {}
