import { Module } from '@nestjs/common';
import { LimController } from './lim.controller';
import { LimService } from './service/lim.service';
import { ConfigModule } from '@nestjs/config';
import { LimConfigService } from './service/lim-config.service';
import { OssUploadService } from '../oss/ali/service/ossUpload.service';
import { OssModule } from '../oss/oss.module';
import { TtsModule } from '../tts/tts.module';

@Module({
  imports: [ConfigModule, OssModule, TtsModule],
  controllers: [LimController],
  providers: [LimConfigService, LimService, OssUploadService],
})

export class LimModule {}