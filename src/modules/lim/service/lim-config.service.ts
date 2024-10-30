import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';


@Injectable()
export class LimConfigService {
  private readonly apiKey: string;
  private readonly baseURL: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('DEEPSEEK_API_KEY');
    this.baseURL = this.configService.get<string>('DEEPSEEK_BASE_URL');
  }

  createLimClient() {
    try {
      return new OpenAI({
        baseURL: this.baseURL,
        apiKey: this.apiKey,
      });
    } catch (error) {
      throw new HttpException(
        '创建OpenAI客户端出错',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}