import {
  Controller,
  Get,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { UseInterceptors } from '@nestjs/common';
import { UrlPreviewService } from './url-preview.service';
import { UrlPreviewRequestDto } from './dto/url-preview.dto';

@Controller('blog/url-preview')
@UseInterceptors(CacheInterceptor)
export class UrlPreviewController {
  constructor(private readonly urlPreviewService: UrlPreviewService) {
  }

  @Get()
  async getPreview(@Query(ValidationPipe) query: UrlPreviewRequestDto) {
    const result = await this.urlPreviewService.getPreview(query.url);
    return { data: result };
  }
}