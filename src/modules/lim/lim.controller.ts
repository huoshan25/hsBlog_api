import { Controller, Get, Post } from '@nestjs/common';
import { LimService } from './service/lim.service';
import { LimConfigService } from './service/lim-config.service';

@Controller('openai')
export class LimController {
  constructor(
    private readonly limService: LimService,
    private readonly limConfig: LimConfigService,
  ) {
  }

  @Post('chat')
  async chat() {
    const result = await this.limService.chat();

    return {
      data: result,
    };
  }
}