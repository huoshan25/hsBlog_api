import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { UrlPreview } from './interfaces/url-preview.interface';
import { firstValueFrom } from 'rxjs';
import * as cheerio from 'cheerio';

@Injectable()
export class UrlPreviewService {
  private readonly logger = new Logger(UrlPreviewService.name);

  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getPreview(url: string): Promise<UrlPreview> {
    try {
      /*检查缓存*/
      const cached = await this.cacheManager.get<UrlPreview>(url);
      if (cached) {
        return cached;
      }

      /*验证URL*/
      const validUrl = this.validateUrl(url);
      if (!validUrl) {
        throw new BadRequestException('提供的URL无效');
      }

      /*获取页面内容*/
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (compatible; URLPreviewBot/1.0; +http://example.com)',
          },
          timeout: 5000,
        }),
      );

      const html = response.data;
      const $ = cheerio.load(html);

      /*提取预览数据*/
      const preview: UrlPreview = {
        title:
          $('meta[property="og:title"]').attr('content') ||
          $('title').text() ||
          '',
        description:
          $('meta[property="og:description"]').attr('content') ||
          $('meta[name="description"]').attr('content') ||
          '',
        image:
          $('meta[property="og:image"]').attr('content') ||
          this.findFirstImage($) ||
          '',
        url: url,
        siteName:
          $('meta[property="og:site_name"]').attr('content') ||
          this.extractDomain(url),
        favicon: this.getFavicon($, url),
      };

      // 存入缓存
      await this.cacheManager.set(url, preview);

      return preview;
    } catch (error) {
      this.logger.error(`Error fetching preview for ${url}:`, error);
      throw new BadRequestException(
        'Unable to fetch preview for the provided URL',
      );
    }
  }

  private validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private extractDomain(url: string): string {
    try {
      const { hostname } = new URL(url);
      return hostname;
    } catch {
      return '';
    }
  }

  private getFavicon($: cheerio.CheerioAPI, baseUrl: string): string {
    const favicon =
      $('link[rel="shortcut icon"]').attr('href') ||
      $('link[rel="icon"]').attr('href');

    if (!favicon) {
      return `${this.extractDomain(baseUrl)}/favicon.ico`;
    }

    if (favicon.startsWith('http')) {
      return favicon;
    }

    try {
      const { protocol, host } = new URL(baseUrl);
      return `${protocol}//${host}${favicon}`;
    } catch {
      return '';
    }
  }

  private findFirstImage($: cheerio.CheerioAPI): string {
    return $('img').first().attr('src') || '';
  }
}