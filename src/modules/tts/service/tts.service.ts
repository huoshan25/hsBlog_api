import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { TTSConfigService } from './tts-config.service';
import { DialogueSegment } from '../../../utils/dialogue-parser';

@Injectable()
export class TTSService {
  private TTSClient: OpenAI;

  constructor(
    private readonly ttsConfigService: TTSConfigService
  ) {
    this.TTSClient = this.ttsConfigService.createTTSClient();
  }

  async textToSpeech(text: string): Promise<Buffer> {
    try {
      const response = await this.TTSClient.audio.speech.create({
        model: 'tts-1',
        voice: 'alloy',
        input: text,
      });

      const buffer = Buffer.from(await response.arrayBuffer());
      return buffer;
    } catch (error) {
      console.error('TTS Error:', error);
      throw error;
    }
  }

  /**
   * 生成对话语音
   * @param segments
   */
  async generateDialogueSpeech(segments: DialogueSegment[]): Promise<Buffer[]> {
    const audioBuffers: Buffer[] = [];

    for (const segment of segments) {
      const voice = segment.speaker === 'host' ? 'alloy' : 'echo'; // 主持人用 alloy 音色,嘉宾用 echo 音色

      const response = await this.TTSClient.audio.speech.create({
        model: 'tts-1-1106',
        voice: voice,
        input: segment.content,
      });

      const buffer = Buffer.from(await response.arrayBuffer());
      audioBuffers.push(buffer);
    }

    return audioBuffers;
  }
}