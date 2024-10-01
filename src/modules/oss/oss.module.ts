import { Module } from '@nestjs/common';
import { OssService } from './oss.service';
import { OssController } from './oss.controller';
import { QiniuService } from './qiniu/qiniu.service';
import { QiniuController } from './qiniu/qiniu.controller';
import { OssConfigService } from './ali/service/ossConfig.service';
import { AliController } from './ali/ali.controller';
import { OssUploadService } from './ali/service/ossUpload.service';
import { OssFileManagementService } from './ali/service/ossFileManagement.service';

@Module({
  controllers: [OssController, QiniuController, AliController],
  providers: [
    OssService,
    QiniuService,
    OssConfigService,
    OssUploadService,
    OssFileManagementService,
  ],
  exports: [OssService, OssFileManagementService],
})
export class OssModule {}
