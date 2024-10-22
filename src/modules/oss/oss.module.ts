import { Module } from '@nestjs/common';
import { QiniuService } from './qiniu/qiniu.service';
import { QiniuController } from './qiniu/qiniu.controller';
import { OssConfigService } from './ali/service/ossConfig.service';
import { OssUploadService } from './ali/service/ossUpload.service';
import { OssFileManagementService } from './ali/service/ossFileManagement.service';
import { AliAdminController } from './ali/admin/ali-admin.controller';

@Module({
  controllers: [QiniuController, AliAdminController],
  providers: [
    QiniuService,
    OssConfigService,
    OssUploadService,
    OssFileManagementService,
  ],
  exports: [OssFileManagementService, OssUploadService],
})
export class OssModule {}
