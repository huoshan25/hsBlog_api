import { Injectable } from '@nestjs/common';
import { LimConfigService } from './lim-config.service';
import OpenAI from 'openai';

@Injectable()
export class LimService {
  private limClient: OpenAI;

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

  async analyzeCode(code: string, language: string) {
    try {
      const completion = await this.limClient.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: '你是一个专业的代码分析师，请对下面的代码进行详细解读，包括代码的功能、关键逻辑和最佳实践建议。'
          },
          {
            role: 'user',
            content: `请分析以下${language}代码:\n\n${code}`
          }
        ],
        model: 'deepseek-chat',
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('代码分析错误:', error);
      throw error;
    }
  }
}