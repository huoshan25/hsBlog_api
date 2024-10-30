import { Module } from '@nestjs/common';
import { LimController } from './lim.controller';
import { LimService } from './service/lim.service';
import { ConfigModule } from '@nestjs/config';
import { LimConfigService } from './service/lim-config.service';


@Module({
  imports: [ConfigModule],
  controllers: [LimController],
  providers: [LimConfigService, LimService],
})

export class LimModule {}