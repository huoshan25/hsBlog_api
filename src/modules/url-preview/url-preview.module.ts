import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { UrlPreviewController } from './url-preview.controller';
import { UrlPreviewService } from './url-preview.service';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    HttpModule,
    CacheModule.register({
      ttl: 3600, // 缓存1小时
    }),
  ],
  controllers: [UrlPreviewController],
  providers: [UrlPreviewService],
})
export class UrlPreviewModule {}