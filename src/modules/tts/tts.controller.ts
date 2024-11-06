import { Controller, Post, Body, Res, HttpStatus, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { TTSService } from './service/tts.service';
import { DialogueParser } from '../../utils/dialogue-parser';

@Controller('tts')
export class TTSController {
  constructor(private readonly ttsService: TTSService) {}

  @Post('convert')
  async convertToSpeech(@Body() body: { text: string, type?: 'normal' | 'dialogue' }) {
    try {
      if (!body.text) {
        throw new HttpException('文本是必需的', HttpStatus.BAD_REQUEST);
      }

      if (body.type === 'dialogue') {
        const segments = DialogueParser.parse(body.text);
        const audioBuffers = await this.ttsService.generateDialogueSpeech(segments);

        // 将所有音频buffer合并成一个
        const totalLength = audioBuffers.reduce((acc, buf) => acc + buf.length, 0);
        const combinedBuffer = Buffer.concat(audioBuffers, totalLength);

        return {
          success: true,
          data: combinedBuffer.toString('base64'),
          message: '对话语音生成成功'
        };
      } else {
        const audioBuffer = await this.ttsService.textToSpeech(body.text);
        return {
          success: true,
          data: audioBuffer.toString('base64'),
          message: '成功生成语音'
        };
      }
    } catch (error) {
      throw new HttpException(
        error.message || '无法将文本转换为语音',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}