import { Body, Controller, Get, Header, Post, Res, StreamableFile } from '@nestjs/common';
import { LimService } from './service/lim.service';
import { LimConfigService } from './service/lim-config.service';
import { Readable } from 'stream';
import type { Response } from 'express';

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

  @Post('analyze-code')
  @Header('Content-Type', 'text/event-stream')
  @Header('Cache-Control', 'no-cache')
  @Header('Connection', 'keep-alive')
  async analyzeCode(
    @Res() res: Response,
    @Body() body: {
      code: string;
      language: string;
    }
  ) {
    try {
      const stream = await this.limService.analyzeCodeStream(body.code, body.language);

      // 检测客户端断开连接
      res.on('close', () => {
        stream.controller?.abort();
        res.end();
      });

      for await (const chunk of stream) {
        // 检查连接是否已关闭
        if (res.closed) {
          break;
        }

        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error) {
      console.error('Stream error:', error);
      res.write(`data: ${JSON.stringify({ error: '分析出错' })}\n\n`);
      res.end();
    }
  }

  /**
   * 生成简短的内容
   */
  @Post('generate-short-content')
  async generateShortContent(@Body() body: {
    content: string;
  }) {
    const result = await this.limService.generateShortContent(body.content);

    return {
      data: result,
    };
  }

  /**
   * 生成长的内容
   */
  @Post('generate-long-content')
  async generateLongContent(@Body() body: {
    content: string;
  }) {
    const result = await this.limService.generatePodcastDialogue(body.content);
    return {
      data: result,
      type: 'dialogue' // 添加标记表明这是对话类型
    };
  }

  /**
   * 生成短文本音频
   */
  @Post('generate-short-audio')
  async generateShortAudio(@Body() body: {
    content: string;
    articleUUID: string;
  }) {
    return await this.limService.generateShortAudio(
      body.content,
      body.articleUUID
    );
  }

  /**
   * 生成对话音频
   */
  @Post('generate-long-audio')
  async generateLongAudio(@Body() body: {
    content: string;
    articleUUID: string;
  }) {
    return await this.limService.generateLongAudio(
      body.content,
      body.articleUUID
    );
  }

}