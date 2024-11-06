import { ConfigModule } from '@nestjs/config';
import { Logger, Module } from '@nestjs/common';
import { TTSConfigService } from './service/tts-config.service';
import { HttpModule } from '@nestjs/axios';
import { TTSController } from './tts.controller';
import { TTSService } from './service/tts.service';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    CacheModule.register({
      ttl: 24 * 60 * 60, // 1天的缓存时间
    }),
  ],
  controllers: [TTSController],
  providers: [TTSConfigService, TTSService, Logger],
  exports: [TTSService]
})
export class TtsModule {}