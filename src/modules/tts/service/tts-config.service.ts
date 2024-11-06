import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class TTSConfigService {
  private readonly apiKey: string;
  private readonly baseURL: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.baseURL = this.configService.get<string>('OPENAI_BASE_URL');
  }

  createTTSClient() {
    try {
      return new OpenAI({
        baseURL: this.baseURL,
        apiKey: this.apiKey,
      });
    } catch (error) {
      throw new HttpException(
        '创建OpenAI-tts客户端出错',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}