import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LimConfigService } from './lim-config.service';
import OpenAI from 'openai';
import { OssUploadService } from '../../oss/ali/service/ossUpload.service';
import { TTSService } from '../../tts/service/tts.service';

@Injectable()
export class LimService {
  private limClient: OpenAI;

  constructor(
    private limConfigService: LimConfigService,
    private ossUploadService: OssUploadService,
    private ttsService: TTSService,
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

  async analyzeCodeStream(code: string, language: string) {
    try {
      const stream = await this.limClient.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: '将代码功能用通俗易懂的语言解释',
          },
          {
            role: 'user',
            content: `请分析以下${language}代码:\n\n${code}`,
          },
        ],
        model: 'deepseek-chat',
        stream: true,
      });

      return stream;
    } catch (error) {
      console.error('代码分析错误:', error);
      throw error;
    }
  }

  /**
   * 生成简短的内容
   * @param articleContent 文章内容
   */
  async generateShortContent(articleContent: string) {
    try {
      const completion = await this.limClient.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: '你是一个专业的文章摘要生成助手。你需要生成不超过300个汉字的简短摘要，准确概括文章核心内容。',
          },
          {
            role: 'user',
            content: `
              请为以下文章生成一个简短摘要，要求：
                  1. 必须控制在300个汉字以内
                  2. 准确概括文章核心内容
                  3. 语言简洁明了
                  文章内容：${articleContent}
            `,
          },
        ],
        model: 'deepseek-chat',
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Error generating short content:', error);
      throw new Error('生成短文本失败');
    }
  }

  /**
   * 生成播客对话
   * @param articleContent
   */
  async generatePodcastDialogue(articleContent: string): Promise<string> {
    try {
      const completion = await this.limClient.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `你是一个专业的播客对话生成助手。你需要扮演以下角色：
              - 主持人小丽：资深媒体人，擅长引导话题，善于抓住重点提问，语气亲和但专业
              - 评论嘉宾李教授：该领域的专家，有独到见解，能用专业且易懂的方式解析内容`
          },
          {
            role: 'user',
            content: `请以播客对话的形式解析以下文章，要求：
              1. 对话风格要像专业播客节目，包含开场白和结束语
              2. 主持人负责话题引导和提问，控制对话节奏
              3. 嘉宾负责专业解读，可以分享个人见解和行业经验
              4. 对话要包含以下环节：
                 - 文章主题介绍
                 - 核心观点解析
                 - 实际应用探讨
                 - 延伸思考
              5. 保持对话的专业性，同时注意通俗易懂
              6. 可以适当加入行业案例和真实场景
              
              文章内容：
              ${articleContent}
              
              请以"小丽：欢迎收听火山播客，今天我们很荣幸邀请到..."开始对话。`
          }
        ],
        model: 'deepseek-chat',
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Error generating podcast dialogue:', error);
      throw new Error('生成播客对话失败');
    }
  }

  /**
   * 生成短文本并转换为音频
   */
  async generateShortAudio(articleContent: string, articleUUID: string) {
    try {
      // 1. 生成短文本
      const shortContent = await this.generateShortContent(articleContent);

      // 2. 转换为音频
      const audioBuffer = await this.ttsService.textToSpeech(shortContent);

      // 3. 上传到OSS
      const ossResult = await this.ossUploadService.uploadAudioBuffer(
        audioBuffer,
        articleUUID,
        'short'
      );

      return {
        code: HttpStatus.OK,
        message: '音频生成成功',
        data: {
          //@ts-ignore
          url: ossResult.url,
          content: shortContent
        }
      };
    } catch (error) {
      throw new HttpException('生成音频失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 生成对话内容并转换为音频
   */
  async generateLongAudio(articleContent: string, articleUUID: string) {
    try {
      // 1. 生成对话内容
      const dialogueContent = await this.generatePodcastDialogue(articleContent);

      // 2. 转换为音频
      const audioBuffer = await this.ttsService.textToSpeech(dialogueContent);

      // 3. 上传到OSS
      const ossResult = await this.ossUploadService.uploadAudioBuffer(
        audioBuffer,
        articleUUID,
        'long'
      );

      return {
        code: HttpStatus.OK,
        message: '对话音频生成成功',
        data: {
          //@ts-ignore
          url: ossResult.url,
          content: dialogueContent
        }
      };
    } catch (error) {
      throw new HttpException('生成对话音频失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }}