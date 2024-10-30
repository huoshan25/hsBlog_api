import { Injectable } from '@nestjs/common';
import { LimConfigService } from './lim-config.service';
import OpenAI from 'openai';

@Injectable()
export class LimService {
  private limClient: any;

  constructor(
    private limConfigService: LimConfigService
  ) {
   this.limClient = this.limConfigService.createLimClient();
  }

  async chat() {
    try {
      const completion = await this.limClient.chat.completions.create({
        messages: [{ role: 'system', content: '你是一个乐于助人的助手.' }],
        model: 'deepseek-chat',
      });


      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Error:', error);
    }
  }
}